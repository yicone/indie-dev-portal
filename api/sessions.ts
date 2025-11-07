/**
 * Agent Sessions API Routes
 */

import { Router, Request, Response } from 'express';
import * as sessionService from './services/sessionService';
import { getSimulatorConfig, applySimulator } from './testing/agentSimulator';
import { getRuntimeConfig } from './testing/testControl';
import type {
  CreateSessionRequest,
  SendPromptRequest,
  ListSessionsQuery,
  SessionStatus,
} from '@/types/agent';

export const sessionsRouter = Router();

/**
 * POST /api/sessions
 * Create a new agent session
 */
sessionsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const request: CreateSessionRequest = req.body;

    if (!request.repoId) {
      return res.status(400).json({ error: 'repoId is required' });
    }

    // Apply test simulator if enabled (with runtime config)
    const config = getSimulatorConfig(getRuntimeConfig());
    const session = await applySimulator(
      config,
      async () => {
        return await sessionService.createSession(request);
      },
      'createSession'
    );

    res.status(201).json(session);
  } catch (error) {
    console.error('[SessionsAPI] Error creating session:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Maximum concurrent sessions')) {
        return res.status(429).json({
          error: error.message,
          retryAfter: 60,
        });
      }
      if (error.message.includes('outside workspace root')) {
        return res.status(403).json({ error: error.message });
      }
      // Handle simulated errors
      if (error.message.includes('Simulated')) {
        if (error.message.includes('429')) {
          return res.status(429).json({
            error: 'Too Many Requests (Test Mode)',
            retryAfter: 60,
          });
        }
        if (error.message.includes('500')) {
          return res.status(500).json({ error: 'Internal Server Error (Test Mode)' });
        }
        if (error.message.includes('Network')) {
          return res.status(503).json({ error: 'Service Unavailable (Test Mode)' });
        }
      }
    }

    res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * GET /api/sessions
 * List agent sessions
 */
sessionsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const query: ListSessionsQuery = {
      repoId: req.query.repoId ? parseInt(req.query.repoId as string, 10) : undefined,
      status: req.query.status as SessionStatus | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
    };

    const result = await sessionService.listSessions(query);
    res.json(result);
  } catch (error) {
    console.error('[SessionsAPI] Error listing sessions:', error);
    res.status(500).json({ error: 'Failed to list sessions' });
  }
});

/**
 * GET /api/sessions/:id
 * Get session details
 */
sessionsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await sessionService.getSession(id);
    res.json(session);
  } catch (error) {
    console.error('[SessionsAPI] Error getting session:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to get session' });
  }
});

/**
 * POST /api/sessions/:id/prompt
 * Send a prompt to an agent session
 */
sessionsRouter.post('/:id/prompt', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request: SendPromptRequest = req.body;

    if (!request.text) {
      return res.status(400).json({ error: 'text is required' });
    }

    // Apply test simulator if enabled (with runtime config)
    const config = getSimulatorConfig(getRuntimeConfig());
    const result = await applySimulator(
      config,
      async () => {
        return await sessionService.sendPrompt(id, request);
      },
      'sendPrompt'
    );

    res.status(202).json(result);
  } catch (error) {
    console.error('[SessionsAPI] Error sending prompt:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('not active')) {
        return res.status(409).json({ error: error.message });
      }
      // Handle simulated errors
      if (error.message.includes('Simulated')) {
        if (error.message.includes('429')) {
          return res.status(429).json({
            error: 'Too Many Requests (Test Mode)',
            retryAfter: 60,
          });
        }
        if (error.message.includes('500')) {
          return res.status(500).json({ error: 'Internal Server Error (Test Mode)' });
        }
        if (error.message.includes('Network')) {
          return res.status(503).json({ error: 'Service Unavailable (Test Mode)' });
        }
      }
    }

    res.status(500).json({ error: 'Failed to send prompt' });
  }
});

/**
 * GET /api/sessions/:id/messages
 * Get messages for a session
 */
sessionsRouter.get('/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const since = req.query.since as string | undefined;

    const messages = await sessionService.getMessages(id, since);
    res.json(messages);
  } catch (error) {
    console.error('[SessionsAPI] Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

/**
 * PATCH /api/sessions/:id
 * Update session (e.g., rename)
 */
sessionsRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name is required and must be a string' });
    }

    if (name.trim().length === 0) {
      return res.status(400).json({ error: 'name cannot be empty' });
    }

    if (name.length > 100) {
      return res.status(400).json({ error: 'name must be 100 characters or less' });
    }

    const session = await sessionService.updateSession(id, { name });
    res.json(session);
  } catch (error) {
    console.error('[SessionsAPI] Error updating session:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to update session' });
  }
});

/**
 * DELETE /api/sessions/:id
 * Cancel a session
 */
sessionsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // First, verify the session exists
    await sessionService.getSession(id);
    // Then, cancel it
    await sessionService.cancelSession(id);
    res.status(204).end();
  } catch (error) {
    console.error('[SessionsAPI] Error cancelling session:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to cancel session' });
  }
});
