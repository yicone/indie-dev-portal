import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { reposRouter } from './repos';
import { commitsRouter } from './commits';
import { contributionsRouter } from './contributions';
import { sessionsRouter } from './sessions';
import { geminiCliManager } from './services/geminiCliManager';
import * as sessionService from './services/sessionService';
import { websocketService } from './services/websocketService';

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

const httpServer = app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);

  // Initialize WebSocket server
  websocketService.initialize(httpServer);
});
