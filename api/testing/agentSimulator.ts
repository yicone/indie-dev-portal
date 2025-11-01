/**
 * Agent Simulator for Testing
 *
 * Simulates various error conditions and delays for testing agent features.
 * Controlled via environment variables.
 */

export interface SimulatorConfig {
  enabled: boolean;
  errorType: 'none' | '429' | '500' | 'network';
  delay: number; // milliseconds
  successRate: number; // 0-100
  // Fine-grained control
  createSessionEnabled?: boolean; // Override for session creation
  sendPromptEnabled?: boolean; // Override for sending prompts
}

/**
 * Get simulator configuration from environment variables
 */
export function getSimulatorConfig(): SimulatorConfig {
  const enabled = process.env.AGENT_TEST_MODE === 'true';
  const errorType = (process.env.AGENT_TEST_ERROR || 'none') as SimulatorConfig['errorType'];
  const delay = parseInt(process.env.AGENT_TEST_DELAY || '0', 10);
  const successRate = parseInt(process.env.AGENT_TEST_SUCCESS_RATE || '100', 10);

  // Fine-grained control
  const createSessionEnabled =
    process.env.AGENT_TEST_CREATE_SESSION !== undefined
      ? process.env.AGENT_TEST_CREATE_SESSION === 'true'
      : undefined;

  const sendPromptEnabled =
    process.env.AGENT_TEST_SEND_PROMPT !== undefined
      ? process.env.AGENT_TEST_SEND_PROMPT === 'true'
      : undefined;

  return {
    enabled,
    errorType,
    delay: Math.min(Math.max(delay, 0), 10000), // Clamp 0-10000ms
    successRate: Math.min(Math.max(successRate, 0), 100), // Clamp 0-100
    createSessionEnabled,
    sendPromptEnabled,
  };
}

/**
 * Simulate delay if configured
 */
export async function simulateDelay(config: SimulatorConfig): Promise<void> {
  if (!config.enabled || config.delay === 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, config.delay));
}

/**
 * Check if request should fail based on success rate
 */
export function shouldFail(config: SimulatorConfig): boolean {
  if (!config.enabled || config.successRate === 100) {
    return false;
  }

  const random = Math.random() * 100;
  return random > config.successRate;
}

/**
 * Get simulated error response
 */
export function getSimulatedError(config: SimulatorConfig): {
  status: number;
  message: string;
  headers?: Record<string, string>;
} {
  switch (config.errorType) {
    case '429':
      return {
        status: 429,
        message: 'Too Many Requests - Simulated',
        headers: {
          'Retry-After': '60',
        },
      };

    case '500':
      return {
        status: 500,
        message: 'Internal Server Error - Simulated',
      };

    case 'network':
      // Simulate network timeout by throwing
      throw new Error('Network timeout - Simulated');

    default:
      return {
        status: 500,
        message: 'Unknown error - Simulated',
      };
  }
}

/**
 * Apply simulator middleware to a request handler
 */
export async function applySimulator<T>(
  config: SimulatorConfig,
  handler: () => Promise<T>,
  endpoint?: 'createSession' | 'sendPrompt'
): Promise<T> {
  // Check if simulator is enabled for this specific endpoint
  let effectiveEnabled = config.enabled;

  if (endpoint === 'createSession' && config.createSessionEnabled !== undefined) {
    effectiveEnabled = config.createSessionEnabled;
  } else if (endpoint === 'sendPrompt' && config.sendPromptEnabled !== undefined) {
    effectiveEnabled = config.sendPromptEnabled;
  }

  if (!effectiveEnabled) {
    return handler();
  }

  // Simulate delay
  await simulateDelay(config);

  // Check if should fail randomly
  if (shouldFail(config)) {
    const error = getSimulatedError(config);
    throw new Error(error.message);
  }

  // Check if should return specific error
  if (config.errorType !== 'none') {
    const error = getSimulatedError(config);
    throw new Error(error.message);
  }

  // Execute normal handler
  return handler();
}

/**
 * Log simulator status on startup
 */
export function logSimulatorStatus(): void {
  const config = getSimulatorConfig();

  if (config.enabled) {
    console.log('[AgentSimulator] Test mode ENABLED');
    console.log(`[AgentSimulator] Error type: ${config.errorType}`);
    console.log(`[AgentSimulator] Delay: ${config.delay}ms`);
    console.log(`[AgentSimulator] Success rate: ${config.successRate}%`);
  } else {
    console.log('[AgentSimulator] Test mode disabled');
  }
}
