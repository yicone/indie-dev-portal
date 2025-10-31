/**
 * ACP (Agent Client Protocol) Types
 * Based on the official ACP specification
 */

/**
 * ACP JSON-RPC message structure
 */
export interface ACPMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: ACPError;
}

/**
 * ACP error structure
 */
export interface ACPError {
  code: number;
  message: string;
  data?: unknown;
}

/**
 * Session creation request
 */
export interface ACPSessionNew {
  method: 'session/new';
  params: {
    cwd: string;
    mcpServers?: unknown[];
  };
}

/**
 * Session creation response
 */
export interface ACPSessionNewResult {
  sessionId: string;
}

/**
 * Prompt submission request
 */
export interface ACPSessionPrompt {
  method: 'session/prompt';
  params: {
    sessionId: string;
    prompt: string;
  };
}

/**
 * Session update notification (from agent)
 */
export interface ACPSessionUpdate {
  method: 'session/update';
  params: {
    sessionId: string;
    update: {
      type: 'text' | 'plan' | 'tool' | 'status';
      content?: string;
      partial?: boolean;
      plan?: ACPPlanStep[];
      tool?: ACPToolCall;
      status?: string;
    };
  };
}

/**
 * Plan step in agent's execution plan
 */
export interface ACPPlanStep {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

/**
 * Tool call information
 */
export interface ACPToolCall {
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

/**
 * Session cancellation request
 */
export interface ACPSessionCancel {
  method: 'session/cancel';
  params: {
    sessionId: string;
    reason?: string;
  };
}

/**
 * Permission request from agent
 */
export interface ACPRequestPermission {
  method: 'session/request_permission';
  params: {
    sessionId: string;
    operation: string;
    details: Record<string, unknown>;
  };
}

/**
 * Permission response
 */
export interface ACPPermissionResponse {
  granted: boolean;
  reason?: string;
}
