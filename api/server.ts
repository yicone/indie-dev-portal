import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { reposRouter } from './repos';
import { commitsRouter } from './commits';
import { contributionsRouter } from './contributions';
import { sessionsRouter } from './sessions';
import { testControlRouter } from './testing/testControl';
import { geminiCliManager } from './services/geminiCliManager';
import * as sessionService from './services/sessionService';
import { websocketService } from './services/websocketService';
import { logSimulatorStatus } from './testing/agentSimulator';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/repos', reposRouter);
app.use('/commits', commitsRouter);
app.use('/contributions', contributionsRouter);
app.use('/sessions', sessionsRouter);
app.use('/test-control', testControlRouter);

app.post('/api/gemini/chat', async (req, res) => {
  const { sessionId, message } = req.body;
  if (!sessionId || !message) {
    return res.status(400).send('Missing sessionId or message');
  }
  try {
    const response = await geminiCliManager.chat(sessionId, message);
    res.json(response);
  } catch (error) {
    console.error('[Server] Error in Gemini chat endpoint:', error);
    res.status(500).send('Error processing chat message');
  }
});

const port = Number(process.env.API_PORT ?? 4000);

// Verify Gemini CLI on startup
geminiCliManager.verifyGeminiCli().then((available) => {
  if (available) {
    console.log('[Server] Gemini CLI is available');
  } else {
    console.warn(
      '[Server] Gemini CLI not found. Agent features will not work. Please install Gemini CLI or set GEMINI_CLI_PATH.'
    );
  }
});

// Start idle session cleanup (every 5 minutes)
const cleanupInterval = setInterval(
  () => {
    sessionService.cleanupIdleSessions().catch((error) => {
      console.error('[Server] Error cleaning up idle sessions:', error);
    });
  },
  5 * 60 * 1000
);

// Graceful shutdown handler
const shutdown = async () => {
  console.log('[Server] Shutting down gracefully...');

  // Stop cleanup interval
  clearInterval(cleanupInterval);

  // Shutdown WebSocket server
  await websocketService.shutdown();

  // Shutdown all agent sessions
  await sessionService.shutdownAllSessions();

  console.log('[Server] Shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGUSR2', shutdown); // Handle nodemon restarts

const httpServer = app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);

  // Log simulator status
  logSimulatorStatus();

  // Initialize WebSocket server
  websocketService.initialize(httpServer);
});
