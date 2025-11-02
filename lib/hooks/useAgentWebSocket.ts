'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { WSServerMessage, ConnectionStatus } from '@/types/websocket';

interface UseAgentWebSocketOptions {
  url: string;
  onMessage?: (message: WSServerMessage) => void;
  onError?: (error: Event) => void;
  autoConnect?: boolean;
}

export function useAgentWebSocket({
  url,
  onMessage,
  onError,
  autoConnect = true,
}: UseAgentWebSocketOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus('connecting');

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        reconnectAttemptsRef.current = 0;

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', payload: {} }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message: WSServerMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('[useAgentWebSocket] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        // WebSocket error events don't contain useful error info
        // The actual error will be in the close event
        console.warn('[useAgentWebSocket] WebSocket error event received');
        setStatus('error');
        onError?.(error);
      };

      ws.onclose = () => {
        setStatus('disconnected');

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }

        // Attempt reconnection with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        reconnectAttemptsRef.current++;

        reconnectTimeoutRef.current = setTimeout(() => {
          if (autoConnect) {
            connect();
          }
        }, delay);
      };
    } catch (error) {
      console.error('[useAgentWebSocket] Failed to create WebSocket:', error);
      setStatus('error');
    }
  }, [url, onMessage, onError, autoConnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
  }, []);

  const send = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[useAgentWebSocket] Cannot send message, WebSocket not connected');
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    status,
    connect,
    disconnect,
    send,
  };
}
