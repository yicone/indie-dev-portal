/**
 * WebSocket Service for Real-time Agent Communication
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server as HTTPServer } from 'http';
import type { WSServerMessage } from '@/types/websocket';

interface WSClient {
  ws: WebSocket;
  id: string;
  connectedAt: Date;
  lastPing: Date;
}

class WebSocketService {
  private wss?: WebSocketServer;
  private clients: Map<string, WSClient> = new Map();
  private pingInterval?: NodeJS.Timeout;

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): void {
    this.wss = new WebSocketServer({ server: httpServer });

    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    // Start ping/pong heartbeat
    this.startHeartbeat();

    console.log('[WebSocketService] WebSocket server initialized');
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket): void {
    const clientId = this.generateClientId();
    const client: WSClient = {
      ws,
      id: clientId,
      connectedAt: new Date(),
      lastPing: new Date(),
    };

    this.clients.set(clientId, client);
    console.log(`[WebSocketService] Client connected: ${clientId}`);

    // Handle messages from client
    ws.on('message', (data: Buffer) => {
      this.handleMessage(clientId, data);
    });

    // Handle client disconnect
    ws.on('close', () => {
      this.clients.delete(clientId);
      console.log(`[WebSocketService] Client disconnected: ${clientId}`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`[WebSocketService] Client error ${clientId}:`, error);
    });

    // Send welcome message
    this.send(clientId, {
      type: 'pong',
      payload: {},
    });
  }

  /**
   * Handle message from client
   */
  private handleMessage(clientId: string, data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());

      // Handle ping
      if (message.type === 'ping') {
        const client = this.clients.get(clientId);
        if (client) {
          client.lastPing = new Date();
          this.send(clientId, { type: 'pong', payload: {} });
        }
      }
    } catch (error) {
      console.error(`[WebSocketService] Failed to parse message from ${clientId}:`, error);
    }
  }

  /**
   * Send message to specific client
   */
  send(clientId: string, message: WSServerMessage): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`[WebSocketService] Failed to send to ${clientId}:`, error);
      }
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message: WSServerMessage): void {
    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error(`[WebSocketService] Failed to broadcast to ${client.id}:`, error);
        }
      }
    }
  }

  /**
   * Start heartbeat ping/pong
   */
  private startHeartbeat(): void {
    this.pingInterval = setInterval(() => {
      const now = Date.now();
      for (const [clientId, client] of this.clients.entries()) {
        // Check if client is alive (responded to ping within 60s)
        const timeSinceLastPing = now - client.lastPing.getTime();
        if (timeSinceLastPing > 60000) {
          console.log(`[WebSocketService] Client ${clientId} timeout, closing`);
          client.ws.close();
          this.clients.delete(clientId);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Shutdown WebSocket server
   */
  async shutdown(): Promise<void> {
    console.log('[WebSocketService] Shutting down WebSocket server');

    // Stop heartbeat
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    // Close all client connections
    for (const client of this.clients.values()) {
      client.ws.close();
    }
    this.clients.clear();

    // Close WebSocket server
    if (this.wss) {
      await new Promise<void>((resolve) => {
        this.wss!.close(() => {
          console.log('[WebSocketService] WebSocket server closed');
          resolve();
        });
      });
    }
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active client count
   */
  getClientCount(): number {
    return this.clients.size;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
