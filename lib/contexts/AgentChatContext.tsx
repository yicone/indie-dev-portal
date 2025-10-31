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
  openPanel: () => void;
  closePanel: () => void;
  setActiveSession: (sessionId: string | null) => void;
  createSession: (repoId: number) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
}

const AgentChatContext = createContext<AgentChatContextType | undefined>(undefined);

export function AgentChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Map<string, AgentSessionData>>(new Map());
  const [messages, setMessages] = useState<Map<string, AgentMessageData[]>>(new Map());

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
        setMessages((prev) => {
          const newMessages = new Map(prev);
          const sessionMessages = newMessages.get(sessionId) || [];
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
      setActiveSessionId(session.id);
      setIsOpen(true);
    } catch (error) {
      console.error('[AgentChat] Failed to create session:', error);
      throw error;
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeSessionId) {
        throw new Error('No active session');
      }

      try {
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
        throw error;
      }
    },
    [activeSessionId]
  );

  const value: AgentChatContextType = {
    isOpen,
    activeSessionId,
    sessions,
    messages,
    connectionStatus,
    openPanel,
    closePanel,
    setActiveSession: setActiveSessionId,
    createSession,
    sendMessage,
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
