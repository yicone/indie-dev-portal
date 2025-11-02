/**
 * ACP Service Layer
 * Handles communication with Gemini CLI via Agent Client Protocol
 */

import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import type {
  ACPMessage,
  ACPSessionNew,
  ACPSessionPrompt,
  ACPSessionUpdate,
  ACPSessionCancel,
} from '@/types/acp';

interface ACPClientOptions {
  process: ChildProcess;
  sessionId: string;
}

export class ACPClient extends EventEmitter {
  private process: ChildProcess;
  private sessionId: string; // Our internal session ID
  private acpSessionId?: string; // Gemini CLI's session ID
  private messageBuffer: string = '';
  private requestId: number = 0;

  constructor(options: ACPClientOptions) {
    super();
    this.process = options.process;
    this.sessionId = options.sessionId;
    this.setupStreams();
  }

  /**
   * Set up stdio streams for JSON-RPC communication
   */
  private setupStreams(): void {
    if (!this.process.stdout || !this.process.stdin) {
      throw new Error('Process stdio streams not available');
    }

    // Listen for stdout data (agent responses)
    this.process.stdout.on('data', (data: Buffer) => {
      this.handleStdoutData(data);
    });

    // Handle stream errors
    this.process.stdout.on('error', (error) => {
      console.error(`[ACPClient] stdout error for session ${this.sessionId}:`, error);
      this.emit('error', error);
    });

    this.process.stdin.on('error', (error) => {
      console.error(`[ACPClient] stdin error for session ${this.sessionId}:`, error);
      this.emit('error', error);
    });
  }

  /**
   * Handle stdout data from Gemini CLI
   */
  private handleStdoutData(data: Buffer): void {
    this.messageBuffer += data.toString();

    // Try to parse complete JSON-RPC messages
    const lines = this.messageBuffer.split('\n');
    this.messageBuffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.trim()) {
        try {
          const message: ACPMessage = JSON.parse(line);
          this.handleACPMessage(message);
        } catch (error) {
          console.error(
            `[ACPClient] Failed to parse JSON-RPC message for session ${this.sessionId}:`,
            line,
            error
          );
          this.emit('parse-error', { line, error });
        }
      }
    }
  }

  /**
   * Handle parsed ACP message
   */
  private handleACPMessage(message: ACPMessage): void {
    console.log(
      `[ACPClient] Received message for session ${this.sessionId}:`,
      JSON.stringify(message)
    );

    // Handle permission requests (special case: has both id and method)
    if (message.id && message.method === 'session/request_permission') {
      this.handlePermissionRequest(message);
      return;
    }

    // Handle notifications (no id field)
    if (!message.id && message.method) {
      this.handleNotification(message);
      return;
    }

    // Handle responses (has id field)
    if (message.id) {
      this.emit('response', message);
      return;
    }

    // Handle errors
    if (message.error) {
      console.error(`[ACPClient] ACP error for session ${this.sessionId}:`, message.error);
      this.emit('acp-error', message.error);
    }
  }

  /**
   * Handle ACP notifications from agent
   */
  private handleNotification(message: ACPMessage): void {
    if (message.method === 'session/update') {
      this.emit('session-update', message.params as ACPSessionUpdate['params']);
    } else {
      this.emit('notification', message);
    }
  }

  /**
   * Handle permission request from agent
   * Auto-approves all requests in development mode
   */
  private handlePermissionRequest(message: ACPMessage): void {
    const params = message.params as {
      sessionId: string;
      options: Array<{ optionId: string; name: string; kind: string }>;
      toolCall: { toolCallId: string; title: string; status: string };
    };

    console.log(
      `[ACPClient] Auto-approving permission request for session ${this.sessionId}:`,
      params.toolCall.title
    );

    // Find the "allow_once" option
    const allowOption = params.options.find((opt) => opt.kind === 'allow_once');

    if (!allowOption) {
      console.error('[ACPClient] No allow_once option found in permission request');
      return;
    }

    // Send permission response
    const response: ACPMessage = {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        optionId: allowOption.optionId,
      },
    };

    const responseJson = JSON.stringify(response) + '\n';
    console.log(`[ACPClient] Sending permission response:`, responseJson.trim());

    if (this.process.stdin) {
      this.process.stdin.write(responseJson);
    }
  }

  /**
   * Send JSON-RPC request to agent
   */
  private sendRequest(method: string, params: unknown): number {
    if (!this.process.stdin) {
      throw new Error('Process stdin not available');
    }

    const id = ++this.requestId;
    const request: ACPMessage = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    const requestJson = JSON.stringify(request) + '\n';
    console.log(`[ACPClient] Sending request for session ${this.sessionId}:`, requestJson.trim());
    this.process.stdin.write(requestJson);

    return id;
  }

  /**
   * Create a new ACP session
   */
  async createSession(cwd: string): Promise<string> {
    const params: ACPSessionNew['params'] = {
      cwd,
      mcpServers: [], // No MCP servers for now
    };
    const requestId = this.sendRequest('session/new', params);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Session creation timeout'));
      }, 30000);

      const handleResponse = (message: ACPMessage) => {
        if (message.id === requestId) {
          clearTimeout(timeout);
          this.off('response', handleResponse);

          if (message.error) {
            reject(new Error(message.error.message));
          } else {
            const result = message.result as { sessionId: string };
            this.acpSessionId = result.sessionId; // Save Gemini CLI's session ID
            resolve(result.sessionId);
          }
        }
      };

      this.on('response', handleResponse);
    });
  }

  /**
   * Send a prompt to the agent
   */
  async sendPrompt(prompt: string): Promise<void> {
    if (!this.acpSessionId) {
      throw new Error('ACP session not initialized');
    }

    const params: ACPSessionPrompt['params'] = {
      sessionId: this.acpSessionId, // Use Gemini CLI's session ID
      prompt: [{ type: 'text', text: prompt }],
    };

    const requestId = this.sendRequest('session/prompt', params);

    // Wait for the response to complete
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.off('response', handleResponse);
        reject(new Error('Prompt timeout'));
      }, 300000); // 5 minutes timeout

      const handleResponse = (message: ACPMessage) => {
        if (message.id === requestId) {
          clearTimeout(timeout);
          this.off('response', handleResponse);

          if (message.error) {
            reject(new Error(message.error.message));
          } else {
            resolve();
          }
        }
      };

      this.on('response', handleResponse);
    });
  }

  /**
   * Cancel the session
   */
  async cancelSession(reason?: string): Promise<void> {
    if (!this.acpSessionId) {
      return; // Session not initialized, nothing to cancel
    }

    const params: ACPSessionCancel['params'] = {
      sessionId: this.acpSessionId, // Use Gemini CLI's session ID
      reason,
    };

    this.sendRequest('session/cancel', params);
  }

  /**
   * Close the ACP client
   */
  close(): void {
    this.removeAllListeners();
    if (this.process.stdin) {
      this.process.stdin.end();
    }
  }
}

/**
 * Create an ACP client for a Gemini CLI process
 */
export function createACPClient(process: ChildProcess, sessionId: string): ACPClient {
  return new ACPClient({ process, sessionId });
}
