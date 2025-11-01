/**
 * Agent Session and Message Types
 */

import { prisma } from '@/lib/prisma';

// Prisma generated types from database models
type AgentSession = Awaited<ReturnType<typeof prisma.agentSession.findUnique>>;
type AgentMessage = Awaited<ReturnType<typeof prisma.agentMessage.findUnique>>;
type Repo = Awaited<ReturnType<typeof prisma.repo.findUnique>>;

/**
 * Session status enum
 *
 * - active: Session is currently running and accepting messages
 * - suspended: Session paused (e.g., server restart), may be resumable
 * - archived: Session archived by user, hidden from UI by default
 * - error: Session encountered fatal error, hidden from UI
 */
export type SessionStatus = 'active' | 'suspended' | 'archived' | 'error';

/**
 * Message role enum
 */
export type MessageRole = 'user' | 'agent' | 'system';

/**
 * Message content types
 */
export type MessageContent = TextMessageContent | PlanMessageContent | ToolMessageContent;

export interface TextMessageContent {
  type: 'text';
  text: string;
  partial?: boolean;
}

export interface PlanMessageContent {
  type: 'plan';
  steps: PlanStep[];
}

export interface ToolMessageContent {
  type: 'tool';
  tool: string;
  args: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

export interface PlanStep {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

/**
 * Agent session data with relations
 */
export interface AgentSessionData {
  id: string;
  repoId: number;
  status: SessionStatus;
  agentType: string;
  agentVersion: string;
  supportsResume: boolean;
  resumeData: string | null;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
  repo: Repo;
  messages: AgentMessageData[];
}

/**
 * Agent message data
 */
export interface AgentMessageData {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  timestamp: Date;
  parsedContent: MessageContent;
}

/**
 * Session creation request
 */
export interface CreateSessionRequest {
  repoId: number;
}

/**
 * Session creation response
 */
export interface CreateSessionResponse {
  id: string;
  repoId: number;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Send prompt request
 */
export interface SendPromptRequest {
  text: string;
}

/**
 * Send prompt response
 */
export interface SendPromptResponse {
  accepted: boolean;
  messageId: string;
}

/**
 * List sessions query params
 */
export interface ListSessionsQuery {
  repoId?: number;
  status?: SessionStatus;
  limit?: number;
  offset?: number;
}

/**
 * List sessions response
 */
export interface ListSessionsResponse {
  sessions: AgentSessionData[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Get messages query params
 */
export interface GetMessagesQuery {
  since?: string; // ISO timestamp
}

/**
 * Session error details
 */
export interface SessionError {
  code: string;
  message: string;
  details?: unknown;
}
