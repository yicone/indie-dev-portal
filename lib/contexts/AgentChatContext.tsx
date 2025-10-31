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

          // Merge consecutive agent messages
          if (role === 'agent' && sessionMessages.length > 0) {
            const lastMessage = sessionMessages[sessionMessages.length - 1];
            const lastMessageTime = lastMessage.timestamp
              ? new Date(lastMessage.timestamp).getTime()
              : 0;
            const currentTime = new Date(timestamp).getTime();
            const timeDiff = currentTime - lastMessageTime;

            // If last message is also from agent and within 5 seconds, merge them
            if (lastMessage.role === 'agent' && timeDiff < 5000) {
              const mergedContent =
                lastMessage.parsedContent?.type === 'text' && content.type === 'text'
                  ? {
                      type: 'text' as const,
                      text: lastMessage.parsedContent.text + '\n\n' + content.text,
                    }
                  : content;

              sessionMessages[sessionMessages.length - 1] = {
                ...lastMessage,
                content: JSON.stringify(mergedContent),
                parsedContent: mergedContent,
                timestamp: new Date(timestamp),
              };

              newMessages.set(sessionId, [...sessionMessages]);
              return newMessages;
            }
          }

          // Add as new message
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
    try {
      const response = await fetch('http://localhost:4000/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const session = await response.json();

      // Add to sessions map
      setSessions((prev) => {
        const newSessions = new Map(prev);
        newSessions.set(session.id, session);
        return newSessions;
      });

      setActiveSessionId(session.id);
      setIsOpen(true);
    } catch (error) {
      console.error('[AgentChat] Failed to create session:', error);
      setError(error instanceof Error ? error.message : 'Failed to create session');
      throw error;
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
      setActiveSessionId(sessionId);
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
