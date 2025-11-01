/**
 * Test Control API
 *
 * Allows dynamic control of test simulator without restarting server.
 * Only available in development mode.
 */

import { Router, Request, Response } from 'express';

// In-memory test configuration (overrides environment variables)
let runtimeConfig: {
  enabled?: boolean;
  errorType?: 'none' | '429' | '500' | 'network';
  delay?: number;
  successRate?: number;
  createSessionEnabled?: boolean;
  sendPromptEnabled?: boolean;
} = {};

export const testControlRouter = Router();

/**
 * GET /api/test-control
 * Get current test configuration
 */
testControlRouter.get('/', (_req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not available in production' });
  }

  res.json({
    runtime: runtimeConfig,
    env: {
      AGENT_TEST_MODE: process.env.AGENT_TEST_MODE,
      AGENT_TEST_ERROR: process.env.AGENT_TEST_ERROR,
      AGENT_TEST_DELAY: process.env.AGENT_TEST_DELAY,
      AGENT_TEST_SUCCESS_RATE: process.env.AGENT_TEST_SUCCESS_RATE,
      AGENT_TEST_CREATE_SESSION: process.env.AGENT_TEST_CREATE_SESSION,
      AGENT_TEST_SEND_PROMPT: process.env.AGENT_TEST_SEND_PROMPT,
    },
  });
});

/**
 * POST /api/test-control
 * Update test configuration dynamically
 */
testControlRouter.post('/', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not available in production' });
  }

  const { enabled, errorType, delay, successRate, createSessionEnabled, sendPromptEnabled } =
    req.body;

  // Update runtime config
  if (enabled !== undefined) {
    runtimeConfig.enabled = enabled;
    // If disabling, clear fine-grained controls to avoid confusion
    if (enabled === false) {
      delete runtimeConfig.createSessionEnabled;
      delete runtimeConfig.sendPromptEnabled;
    }
  }
  if (errorType !== undefined) runtimeConfig.errorType = errorType;
  if (delay !== undefined) runtimeConfig.delay = delay;
  if (successRate !== undefined) runtimeConfig.successRate = successRate;
  if (createSessionEnabled !== undefined) runtimeConfig.createSessionEnabled = createSessionEnabled;
  if (sendPromptEnabled !== undefined) runtimeConfig.sendPromptEnabled = sendPromptEnabled;

  console.log('[TestControl] Configuration updated:', runtimeConfig);

  res.json({
    success: true,
    config: runtimeConfig,
  });
});

/**
 * DELETE /api/test-control
 * Reset to environment variable configuration
 */
testControlRouter.delete('/', (_req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not available in production' });
  }

  runtimeConfig = {};
  console.log('[TestControl] Configuration reset to environment variables');

  res.json({
    success: true,
    message: 'Reset to environment variables',
  });
});

/**
 * Get runtime configuration (for use by simulator)
 */
export function getRuntimeConfig() {
  return runtimeConfig;
}
