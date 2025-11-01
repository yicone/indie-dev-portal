'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAgentWebSocket } from '@/lib/hooks/useAgentWebSocket';
import type { WSServerMessage, ConnectionStatus } from '@/types/websocket';
import type { AgentSessionData, AgentMessageData } from '@/types/agent';

interface AgentChatContextType {
  isOpen: boolean;
  activeSessionId: string | null;
  sessions: Map<string, AgentSessionData>;
  messages: Map<string, AgentMessageData[]>;
  connectionStatus: ConnectionStatus;
  isTyping: boolean;
  isCreatingSession: boolean;
  error: string | null;
  openPanel: () => void;
  closePanel: () => void;
  setActiveSession: (sessionId: string | null) => void;
  createSession: (repoId: number) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  clearError: () => void;
}

const AgentChatContext = createContext<AgentChatContextType | undefined>(undefined);

export function AgentChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Map<string, AgentSessionData>>(new Map());
  const [messages, setMessages] = useState<Map<string, AgentMessageData[]>>(new Map());
  const [isTyping, setIsTyping] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsUrl =
    typeof window !== 'undefined' ? `ws://${window.location.hostname}:4000` : 'ws://localhost:4000';

  const handleMessage = useCallback((message: WSServerMessage) => {
    switch (message.type) {
      case 'session.created':
        // Session created notification
        console.log('[AgentChat] Session created:', message.payload);
        break;

      case 'session.status':
        // Session status update
        console.log('[AgentChat] Session status:', message.payload);
        break;

      case 'message.new':
        // New message
        const { sessionId, messageId, role, content, timestamp } = message.payload;

        // Stop typing indicator when agent message arrives
        if (role === 'agent') {
          setIsTyping(false);
        }

        setMessages((prev) => {
          const newMessages = new Map(prev);
          const sessionMessages = newMessages.get(sessionId) || [];

          // Check if message already exists (by messageId) to handle updates
          const existingIndex = sessionMessages.findIndex((m) => m.id === messageId);

          if (existingIndex >= 0) {
            // Update existing message (for streaming updates)
            const updatedMessages = [...sessionMessages];
            updatedMessages[existingIndex] = {
              ...updatedMessages[existingIndex],
              content: JSON.stringify(content),
              parsedContent: content,
              timestamp: new Date(timestamp),
            };
            newMessages.set(sessionId, updatedMessages);
          } else {
            // Smart merge: combine consecutive agent messages within time window
            const MERGE_WINDOW_MS = 5000; // 5 second window (increased from 2s)
            const shouldMerge =
              role === 'agent' && sessionMessages.length > 0 && content.type === 'text';

            if (shouldMerge) {
              const lastMessage = sessionMessages[sessionMessages.length - 1];
              const lastTime = lastMessage.timestamp
                ? new Date(lastMessage.timestamp).getTime()
                : 0;
              const currentTime = new Date(timestamp).getTime();
              const timeDiff = currentTime - lastTime;

              console.log('[AgentChat] Merge check:', {
                lastRole: lastMessage.role,
                currentRole: role,
                timeDiff,
                window: MERGE_WINDOW_MS,
                shouldMerge: lastMessage.role === 'agent' && timeDiff < MERGE_WINDOW_MS,
              });

              // Merge if: 1) last is also agent 2) within time window 3) both are text
              if (
                lastMessage.role === 'agent' &&
                timeDiff < MERGE_WINDOW_MS &&
                lastMessage.parsedContent?.type === 'text'
              ) {
                console.log('[AgentChat] Merging messages');
                // Merge content with newline separator
                const mergedContent = {
                  type: 'text' as const,
                  text: lastMessage.parsedContent.text + '\n' + content.text,
                };

                // Update last message
                const updatedMessages = [...sessionMessages];
                updatedMessages[updatedMessages.length - 1] = {
                  ...lastMessage,
                  content: JSON.stringify(mergedContent),
                  parsedContent: mergedContent,
                  timestamp: new Date(timestamp),
                };

                newMessages.set(sessionId, updatedMessages);
                return newMessages;
              } else {
                console.log('[AgentChat] Not merging - conditions not met');
              }
            }

            // Add as new message (no merge)
            newMessages.set(sessionId, [
              ...sessionMessages,
              {
                id: messageId,
                sessionId,
                role,
                content: JSON.stringify(content),
                timestamp: new Date(timestamp),
                parsedContent: content,
              } as AgentMessageData,
            ]);
          }

          return newMessages;
        });
        break;

      case 'message.update':
        // Message update (streaming)
        console.log('[AgentChat] Message update:', message.payload);
        break;

      case 'error':
        console.error('[AgentChat] Error:', message.payload);
        setError(message.payload.message || 'An error occurred');
        setIsTyping(false);
        break;
    }
  }, []);

  const { status: connectionStatus } = useAgentWebSocket({
    url: wsUrl,
    onMessage: handleMessage,
    autoConnect: true,
  });

  const openPanel = useCallback(() => setIsOpen(true), []);
  const closePanel = useCallback(() => setIsOpen(false), []);

  // Load messages for a session
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/sessions/${sessionId}/messages`);
      if (response.ok) {
        const messagesData = await response.json();
        // Parse content for each message
        const parsedMessages = messagesData.map(
          (msg: { content: string; [key: string]: unknown }) => ({
            ...msg,
            parsedContent: JSON.parse(msg.content),
          })
        );
        setMessages((prev) => {
          const newMessages = new Map(prev);
          newMessages.set(sessionId, parsedMessages);
          return newMessages;
        });
      }
    } catch (error) {
      console.error('[AgentChat] Failed to load messages:', error);
    }
  }, []);

  // Load existing sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch('http://localhost:4000/sessions');
        if (response.ok) {
          const data = await response.json();
          const sessionsMap = new Map();
          data.sessions.forEach((session: { id: string; [key: string]: unknown }) => {
            sessionsMap.set(session.id, session as unknown as AgentSessionData);
          });
          setSessions(sessionsMap);
        }
      } catch (error) {
        console.error('[AgentChat] Failed to load sessions:', error);
      }
    };

    loadSessions();
  }, []);

  const createSession = useCallback(async (repoId: number) => {
    setIsCreatingSession(true);
    try {
      const response = await fetch('http://localhost:4000/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId }),
      });

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Failed to create session (${response.status})`);
        }
      }

      const session = await response.json();
      console.log('[AgentChat] Session created:', session);

      // Add new session to sessions map immediately
      setSessions((prev) => {
        const newSessions = new Map(prev);
        newSessions.set(session.id, session as unknown as AgentSessionData);
        return newSessions;
      });

      // Initialize empty messages for new session
      setMessages((prev) => {
        const newMessages = new Map(prev);
        newMessages.set(session.id, []);
        return newMessages;
      });

      // Set as active session
      setActiveSessionId(session.id);
      setIsOpen(true);

      // Reload sessions in background to get complete data (don't block on this)
      fetch('http://localhost:4000/sessions')
        .then((res) => res.json())
        .then((data) => {
          const sessionsArray = Array.isArray(data) ? data : data.sessions || [];
          const sessionsMap = new Map<string, AgentSessionData>();
          sessionsArray.forEach((s: AgentSessionData) => sessionsMap.set(s.id, s));
          setSessions(sessionsMap);
        })
        .catch((err) => console.error('[AgentChat] Failed to reload sessions:', err));
    } catch (error) {
      console.error('[AgentChat] Failed to create session:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create session. Please try again.';
      setError(errorMessage);
      // Don't re-throw, let the UI handle the error display
    } finally {
      setIsCreatingSession(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeSessionId) {
        throw new Error('No active session');
      }

      try {
        setError(null);
        setIsTyping(true);

        const response = await fetch(`http://localhost:4000/sessions/${activeSessionId}/prompt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('[AgentChat] Failed to send message:', error);
        setError(error instanceof Error ? error.message : 'Failed to send message');
        setIsTyping(false);
        throw error;
      }
    },
    [activeSessionId]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Enhanced setActiveSession that loads messages
  const handleSetActiveSession = useCallback(
    (sessionId: string | null) => {
      console.log('[AgentChat] Setting active session:', sessionId);
      setActiveSessionId(sessionId);
      setError(null); // Clear any previous errors
      if (sessionId) {
        loadSessionMessages(sessionId);
      }
    },
    [loadSessionMessages]
  );

  const value: AgentChatContextType = {
    isOpen,
    activeSessionId,
    sessions,
    messages,
    connectionStatus,
    isTyping,
    isCreatingSession,
    error,
    openPanel,
    closePanel,
    setActiveSession: handleSetActiveSession,
    createSession,
    sendMessage,
    clearError,
  };

  return <AgentChatContext.Provider value={value}>{children}</AgentChatContext.Provider>;
}

export function useAgentChat() {
  const context = useContext(AgentChatContext);
  if (!context) {
    throw new Error('useAgentChat must be used within AgentChatProvider');
  }
  return context;
}
