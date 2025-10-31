/**
 * Session Service
 * Manages agent sessions, messages, and coordinates with ACP/Gemini CLI
 */

import { prisma } from '@/lib/prisma';
import { geminiCliManager } from './geminiCliManager';
import { createACPClient, ACPClient } from './acpService';
import { websocketService } from './websocketService';
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

// Store active ACP clients
const acpClients = new Map<string, ACPClient>();

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

      // Update status if not already completed/cancelled
      const session = await prisma.agentSession.findUnique({
        where: { id: sessionId },
      });
      if (session && session.status === 'active') {
        await updateSessionStatus(sessionId, code === 0 ? 'completed' : 'error');
      }
    }
  });
}

/**
 * Handle session update from agent
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

  const agentMessage = await storeAgentMessage(sessionId, content);

  // Broadcast agent message via WebSocket
  websocketService.broadcast({
    type: 'message.new',
    payload: {
      sessionId,
      messageId: agentMessage.id,
      role: 'agent',
      content,
      timestamp: agentMessage.timestamp.toISOString(),
    },
  });
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

  // Send prompt to agent
  await acpClient.sendPrompt(text);

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
  await updateSessionStatus(sessionId, 'cancelled');
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
 */
export async function cleanupIdleSessions(): Promise<void> {
  const idleTimeoutMinutes = parseInt(process.env.AGENT_SESSION_IDLE_TIMEOUT || '30', 10);
  const idleTimeoutMs = idleTimeoutMinutes * 60 * 1000;

  const idleSessionIds = geminiCliManager.getIdleSessions(idleTimeoutMs);

  for (const sessionId of idleSessionIds) {
    console.log(`[SessionService] Cleaning up idle session: ${sessionId}`);
    try {
      await cancelSession(sessionId);
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

  // Update all active sessions to cancelled
  await prisma.agentSession.updateMany({
    where: { status: 'active' },
    data: { status: 'cancelled' },
  });

  console.log('[SessionService] All sessions shut down');
}
