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
  | 'message.start' // NEW: Start streaming a message
  | 'message.chunk' // NEW: Send content chunk
  | 'message.end' // NEW: Complete message with full content
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
 * @deprecated Use message.start/chunk/end instead
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
 * Message streaming start
 * Signals the beginning of a new message stream
 */
export interface WSMessageStart extends WSMessage {
  type: 'message.start';
  payload: {
    sessionId: string;
    messageId: string;
    role: 'agent';
    timestamp: string;
  };
}

/**
 * Message streaming chunk
 * Delivers incremental content for an ongoing message
 */
export interface WSMessageChunk extends WSMessage {
  type: 'message.chunk';
  payload: {
    messageId: string;
    content: MessageContent; // Incremental content
  };
}

/**
 * Message streaming end
 * Completes the message with full content and stores to database
 */
export interface WSMessageEnd extends WSMessage {
  type: 'message.end';
  payload: {
    messageId: string;
    content: MessageContent; // Complete content
    isComplete: true;
    timestamp: string;
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
  | WSMessageUpdate // Deprecated, kept for backward compatibility
  | WSMessageStart // NEW: Streaming protocol
  | WSMessageChunk // NEW: Streaming protocol
  | WSMessageEnd // NEW: Streaming protocol
  | WSError
  | WSPong;

/**
 * Connection status
 */
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
