/**
 * WebSocket Message Types for Agent Communication
 */

import type { SessionStatus, MessageContent } from './agent';

/**
 * WebSocket message type enum
 */
export type WSMessageType =
  | 'session.created'
  | 'session.status'
  | 'message.new'
  | 'message.update'
  | 'error'
  | 'ping'
  | 'pong';

/**
 * Base WebSocket message structure
 */
export interface WSMessage {
  type: WSMessageType;
  payload: unknown;
}

/**
 * Session created notification
 */
export interface WSSessionCreated extends WSMessage {
  type: 'session.created';
  payload: {
    sessionId: string;
    repoId: number;
    status: SessionStatus;
    createdAt: string;
  };
}

/**
 * Session status update
 */
export interface WSSessionStatus extends WSMessage {
  type: 'session.status';
  payload: {
    sessionId: string;
    status: SessionStatus;
  };
}

/**
 * New message notification
 */
export interface WSMessageNew extends WSMessage {
  type: 'message.new';
  payload: {
    sessionId: string;
    messageId: string;
    role: 'user' | 'agent' | 'system';
    content: MessageContent;
    timestamp: string;
  };
}

/**
 * Message update (for streaming)
 */
export interface WSMessageUpdate extends WSMessage {
  type: 'message.update';
  payload: {
    sessionId: string;
    messageId: string;
    content: MessageContent;
    complete: boolean;
  };
}

/**
 * Error notification
 */
export interface WSError extends WSMessage {
  type: 'error';
  payload: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Ping message
 */
export interface WSPing extends WSMessage {
  type: 'ping';
  payload: Record<string, never>;
}

/**
 * Pong message
 */
export interface WSPong extends WSMessage {
  type: 'pong';
  payload: Record<string, never>;
}

/**
 * Union of all server-to-client messages
 */
export type WSServerMessage =
  | WSSessionCreated
  | WSSessionStatus
  | WSMessageNew
  | WSMessageUpdate
  | WSError
  | WSPong;

/**
 * Connection status
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
