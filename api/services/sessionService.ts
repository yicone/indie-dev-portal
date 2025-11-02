/**
 * Session Service
 * Manages agent sessions, messages, and coordinates with ACP/Gemini CLI
 */

import { prisma } from '@/lib/prisma';
import { geminiCliManager } from './geminiCliManager';
import { createACPClient, ACPClient } from './acpService';
import { websocketService } from './websocketService';
import streamingStateManager from './streamingStateManager';
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  SendPromptRequest,
  SendPromptResponse,
  ListSessionsQuery,
  ListSessionsResponse,
  SessionStatus,
  MessageContent,
} from '@/types/agent';
import path from 'path';
import { randomUUID } from 'crypto';

// Store active ACP clients
const acpClients = new Map<string, ACPClient>();

// Store active message IDs per session (for streaming)
const activeMessageIds = new Map<string, string>();

/**
 * Get active message ID for a session
 */
function getActiveMessageId(sessionId: string): string | undefined {
  return activeMessageIds.get(sessionId);
}

/**
 * Set active message ID for a session
 */
function setActiveMessageId(sessionId: string, messageId: string): void {
  activeMessageIds.set(sessionId, messageId);
}

/**
 * Clear active message ID for a session
 */
function clearActiveMessageId(sessionId: string): void {
  activeMessageIds.delete(sessionId);
}

/**
 * Create a new agent session
 */
export async function createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
  const { repoId } = request;

  // Validate repository exists
  const repo = await prisma.repo.findUnique({
    where: { id: repoId },
  });

  if (!repo) {
    throw new Error(`Repository not found: ${repoId}`);
  }

  // Validate repository path is within workspace root
  const workspaceRoot = process.env.AGENT_WORKSPACE_ROOT;
  if (workspaceRoot) {
    const normalizedRepoPath = path.normalize(repo.repoPath);
    const normalizedWorkspaceRoot = path.normalize(workspaceRoot);

    if (!normalizedRepoPath.startsWith(normalizedWorkspaceRoot)) {
      throw new Error(
        `Repository path ${repo.repoPath} is outside workspace root ${workspaceRoot}`
      );
    }
  }

  // Check if at session limit
  if (geminiCliManager.isAtLimit()) {
    throw new Error(
      `Maximum concurrent sessions reached (${geminiCliManager.getActiveProcessCount()})`
    );
  }

  // Create session record
  const session = await prisma.agentSession.create({
    data: {
      repoId,
      status: 'active',
    },
  });

  try {
    // Spawn Gemini CLI process
    const geminiProcess = await geminiCliManager.spawnGeminiCli(session.id, repo.repoPath);

    // Create ACP client
    const acpClient = createACPClient(geminiProcess, session.id);
    acpClients.set(session.id, acpClient);

    // Set up event handlers
    setupACPClientHandlers(session.id, acpClient);

    // Initialize ACP session
    await acpClient.createSession(repo.repoPath);

    console.log(`[SessionService] Session ${session.id} created successfully`);

    return {
      id: session.id,
      repoId: session.repoId,
      status: session.status as SessionStatus,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  } catch (error) {
    // Clean up on failure
    await prisma.agentSession.update({
      where: { id: session.id },
      data: { status: 'error' },
    });

    throw error;
  }
}

/**
 * Set up event handlers for ACP client
 */
function setupACPClientHandlers(sessionId: string, acpClient: ACPClient): void {
  // Handle session updates from agent
  acpClient.on('session-update', async (update) => {
    try {
      await handleSessionUpdate(sessionId, update);
    } catch (error) {
      console.error(`[SessionService] Error handling session update for ${sessionId}:`, error);
    }
  });

  // Handle ACP responses (for detecting completion)
  acpClient.on('response', async (message) => {
    // Check if this is a prompt completion response
    if (message.result && typeof message.result === 'object' && 'stopReason' in message.result) {
      console.log(
        `[SessionService] Prompt completed for session ${sessionId}, stopReason: ${message.result.stopReason}`
      );

      // Finalize any active streaming
      const activeMessageId = getActiveMessageId(sessionId);

      if (activeMessageId) {
        try {
          // Complete the streaming
          const fullContent = streamingStateManager.completeStream(activeMessageId);
          clearActiveMessageId(sessionId);

          // Store complete message to database
          const completeContent: MessageContent = {
            type: 'text',
            text: fullContent,
          };

          const agentMessage = await storeAgentMessage(sessionId, completeContent);

          // Send message.end
          websocketService.broadcast({
            type: 'message.end',
            payload: {
              messageId: activeMessageId,
              content: completeContent,
              isComplete: true,
              timestamp: agentMessage.timestamp.toISOString(),
            },
          });

          console.log(
            `[SessionService] Completed streaming: ${activeMessageId}, stored as ${agentMessage.id}`
          );
        } catch (error) {
          console.error(`[SessionService] Error finalizing streaming for ${sessionId}:`, error);
        }
      } else {
        // No active streaming - Agent completed without sending message chunks
        // This can happen if Agent only sends thoughts or tool calls
        console.log(
          `[SessionService] Agent completed without message chunks for session ${sessionId}`
        );

        // Create a placeholder message indicating completion
        const placeholderContent: MessageContent = {
          type: 'text',
          text: '(Agent completed task without text response)',
        };

        const agentMessage = await storeAgentMessage(sessionId, placeholderContent);

        // Send a complete message directly
        websocketService.broadcast({
          type: 'message.new',
          payload: {
            sessionId,
            messageId: agentMessage.id,
            role: 'agent',
            content: placeholderContent,
            timestamp: agentMessage.timestamp.toISOString(),
          },
        });

        console.log(`[SessionService] Sent placeholder message for session ${sessionId}`);
      }
    }
  });

  // Handle ACP errors
  acpClient.on('acp-error', async (error) => {
    console.error(`[SessionService] ACP error for session ${sessionId}:`, error);
    await updateSessionStatus(sessionId, 'error');
  });

  // Handle process errors
  geminiCliManager.on('process-error', async ({ sessionId: sid, error }) => {
    if (sid === sessionId) {
      console.error(`[SessionService] Process error for session ${sessionId}:`, error);
      await updateSessionStatus(sessionId, 'error');
    }
  });

  // Handle process exit
  geminiCliManager.on('process-exit', async ({ sessionId: sid, code }) => {
    if (sid === sessionId) {
      console.log(`[SessionService] Process exited for session ${sessionId}, code: ${code}`);
      acpClients.delete(sessionId);

      // Log error if process crashed, but keep session active
      // Session stays active to allow continuation
      if (code !== 0) {
        console.error(
          `[SessionService] Process crashed for session ${sessionId}, exit code: ${code}`
        );
        // TODO: Store error in message history for debugging
      }
      // Session remains active - process will restart on next prompt
    }
  });
}

/**
 * Handle session update from agent
 * Implements new streaming protocol: message.start → message.chunk → message.end
 */
async function handleSessionUpdate(
  sessionId: string,
  params: {
    sessionId: string;
    update: {
      sessionUpdate: string;
      content?: { type: string; text: string };
      [key: string]: unknown;
    };
  }
): Promise<void> {
  // Update activity timestamp
  geminiCliManager.updateActivity(sessionId);

  // Touch streaming state to prevent timeout during long-running operations
  streamingStateManager.touchStream(sessionId);

  const update = params.update;
  const updateType = update.sessionUpdate;

  // Only process agent message chunks (ignore thought chunks)
  if (updateType !== 'agent_message_chunk') {
    return;
  }

  // Extract content
  let content: MessageContent;

  if (update.content && update.content.type === 'text') {
    content = {
      type: 'text',
      text: update.content.text,
    };
  } else {
    // Fallback for unknown formats
    content = {
      type: 'text',
      text: JSON.stringify(update.content || update),
    };
  }

  // NEW STREAMING PROTOCOL
  // Check if this is the first chunk (start of streaming)
  const activeMessageId = getActiveMessageId(sessionId);

  if (!activeMessageId) {
    // First chunk - start streaming
    const messageId = randomUUID();
    setActiveMessageId(sessionId, messageId);

    // Initialize streaming state
    streamingStateManager.startStream(messageId, sessionId);

    // Send message.start
    websocketService.broadcast({
      type: 'message.start',
      payload: {
        sessionId,
        messageId,
        role: 'agent',
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`[SessionService] Started streaming: ${messageId}`);
  }

  const messageId = getActiveMessageId(sessionId)!;

  // Add chunk to accumulator
  streamingStateManager.addChunk(messageId, content.text);

  // Send message.chunk
  websocketService.broadcast({
    type: 'message.chunk',
    payload: {
      messageId,
      content,
    },
  });

  // Note: message.end is sent when the ACP prompt response completes
  // See sendPrompt() function for the completion handler
}

/**
 * Send a prompt to an agent session
 */
export async function sendPrompt(
  sessionId: string,
  request: SendPromptRequest
): Promise<SendPromptResponse> {
  const { text } = request;

  // Validate session exists and is active
  const session = await prisma.agentSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  if (session.status !== 'active') {
    throw new Error(`Session is not active: ${session.status}`);
  }

  // Get ACP client
  const acpClient = acpClients.get(sessionId);
  if (!acpClient) {
    throw new Error(`No ACP client found for session: ${sessionId}`);
  }

  // Store user message
  const userMessage = await storeUserMessage(sessionId, text);

  // Broadcast user message via WebSocket
  websocketService.broadcast({
    type: 'message.new',
    payload: {
      sessionId,
      messageId: userMessage.id,
      role: 'user',
      content: { type: 'text', text },
      timestamp: userMessage.timestamp.toISOString(),
    },
  });

  // Send prompt to agent (don't wait for response)
  // Completion is handled by the 'response' event listener in setupACPClientHandlers
  acpClient.sendPrompt(text).catch((error) => {
    console.error(`[SessionService] Prompt error for session ${sessionId}:`, error);
    // Clean up streaming state on error
    const activeMessageId = getActiveMessageId(sessionId);
    if (activeMessageId) {
      streamingStateManager.cancelStream(activeMessageId);
      clearActiveMessageId(sessionId);

      // Notify frontend about the error
      websocketService.broadcast({
        type: 'error',
        payload: {
          code: 'STREAMING_ERROR',
          message: error.message || 'Failed to complete message streaming',
          details: {
            sessionId,
            messageId: activeMessageId,
          },
        },
      });

      console.log(`[SessionService] Sent error notification for streaming: ${activeMessageId}`);
    }
  });

  // Update activity
  geminiCliManager.updateActivity(sessionId);

  return {
    accepted: true,
    messageId: userMessage.id,
  };
}

/**
 * Cancel a session
 */
export async function cancelSession(sessionId: string): Promise<void> {
  const acpClient = acpClients.get(sessionId);
  if (acpClient) {
    await acpClient.cancelSession('User requested cancellation');
    acpClient.close();
    acpClients.delete(sessionId);
  }

  await geminiCliManager.terminateProcess(sessionId);
  await updateSessionStatus(sessionId, 'archived');
}

/**
 * List sessions with filters
 */
export async function listSessions(query: ListSessionsQuery): Promise<ListSessionsResponse> {
  const { repoId, status, limit = 20, offset = 0 } = query;

  const where: { repoId?: number; status?: string } = {};
  if (repoId) where.repoId = repoId;
  if (status) where.status = status;

  const [sessions, total] = await Promise.all([
    prisma.agentSession.findMany({
      where,
      include: {
        repo: true,
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.agentSession.count({ where }),
  ]);

  return {
    sessions: sessions as never,
    total,
    limit,
    offset,
  };
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string) {
  const session = await prisma.agentSession.findUnique({
    where: { id: sessionId },
    include: {
      repo: true,
      messages: {
        orderBy: { timestamp: 'asc' },
      },
    },
  });

  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  return session;
}

/**
 * Update session (e.g., rename)
 */
export async function updateSession(sessionId: string, updates: { name?: string }) {
  const session = await prisma.agentSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  // For now, we only support updating the name
  // Store custom name in resumeData as JSON
  const currentResumeData = session.resumeData ? JSON.parse(session.resumeData) : {};
  const updatedResumeData = {
    ...currentResumeData,
    customName: updates.name,
  };

  const updatedSession = await prisma.agentSession.update({
    where: { id: sessionId },
    data: {
      resumeData: JSON.stringify(updatedResumeData),
      updatedAt: new Date(),
    },
    include: {
      repo: true,
      messages: {
        orderBy: { timestamp: 'asc' },
      },
    },
  });

  return updatedSession;
}

/**
 * Get messages for a session
 */
export async function getMessages(sessionId: string, since?: string) {
  const where: { sessionId: string; timestamp?: { gt: Date } } = { sessionId };
  if (since) {
    where.timestamp = { gt: new Date(since) };
  }

  return prisma.agentMessage.findMany({
    where,
    orderBy: { timestamp: 'asc' },
  });
}

/**
 * Store a user message
 */
async function storeUserMessage(sessionId: string, text: string) {
  const content: MessageContent = { type: 'text', text };

  return prisma.agentMessage.create({
    data: {
      sessionId,
      role: 'user',
      content: JSON.stringify(content),
    },
  });
}

/**
 * Store an agent message
 */
async function storeAgentMessage(sessionId: string, content: MessageContent) {
  return prisma.agentMessage.create({
    data: {
      sessionId,
      role: 'agent',
      content: JSON.stringify(content),
    },
  });
}

/**
 * Update session status
 */
async function updateSessionStatus(sessionId: string, status: SessionStatus) {
  return prisma.agentSession.update({
    where: { id: sessionId },
    data: { status },
  });
}

/**
 * Clean up idle sessions
 * Terminates idle processes but keeps sessions active (user can resume)
 */
export async function cleanupIdleSessions(): Promise<void> {
  const idleTimeoutMinutes = parseInt(process.env.AGENT_SESSION_IDLE_TIMEOUT || '30', 10);
  const idleTimeoutMs = idleTimeoutMinutes * 60 * 1000;

  const idleSessionIds = geminiCliManager.getIdleSessions(idleTimeoutMs);

  for (const sessionId of idleSessionIds) {
    console.log(`[SessionService] Terminating idle process for session: ${sessionId}`);
    try {
      // Only terminate the process, don't change session status
      // Session stays active - process will restart on next prompt
      await geminiCliManager.terminateProcess(sessionId);

      // Close ACP client if exists
      const acpClient = acpClients.get(sessionId);
      if (acpClient) {
        acpClient.close();
        acpClients.delete(sessionId);
      }
    } catch (error) {
      console.error(`[SessionService] Error cleaning up idle session ${sessionId}:`, error);
    }
  }
}

/**
 * Shutdown all sessions (for server shutdown)
 */
export async function shutdownAllSessions(): Promise<void> {
  console.log('[SessionService] Shutting down all sessions');

  // Close all ACP clients
  for (const [sessionId, acpClient] of acpClients.entries()) {
    try {
      await acpClient.cancelSession('Server shutdown');
      acpClient.close();
    } catch (error) {
      console.error(`[SessionService] Error closing ACP client for ${sessionId}:`, error);
    }
  }
  acpClients.clear();

  // Terminate all Gemini CLI processes
  await geminiCliManager.terminateAllProcesses();

  // Update all active sessions to suspended (may be resumable in future)
  await prisma.agentSession.updateMany({
    where: { status: 'active' },
    data: {
      status: 'suspended',
      lastActiveAt: new Date(),
    },
  });

  console.log('[SessionService] All sessions shut down');
}
