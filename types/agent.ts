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
 */
export type SessionStatus = 'active' | 'completed' | 'cancelled' | 'error';

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
export interface AgentSessionData extends AgentSession {
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
