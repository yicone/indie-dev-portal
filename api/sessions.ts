/**
 * Agent Sessions API Routes
 */

import { Router, Request, Response } from 'express';
import * as sessionService from './services/sessionService';
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

    const session = await sessionService.createSession(request);
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

    const result = await sessionService.sendPrompt(id, request);
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
 * DELETE /api/sessions/:id
 * Cancel a session
 */
sessionsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await sessionService.cancelSession(id);
    res.json({ success: true });
  } catch (error) {
    console.error('[SessionsAPI] Error cancelling session:', error);
    res.status(500).json({ error: 'Failed to cancel session' });
  }
});
