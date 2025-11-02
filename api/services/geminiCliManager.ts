/**
 * Gemini CLI Process Manager
 * Manages Gemini CLI processes for agent sessions
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

interface ProcessInfo {
  process: ChildProcess;
  sessionId: string;
  repoPath: string;
  startedAt: Date;
  lastActivity: Date;
}

class GeminiCliManager extends EventEmitter {
  private processes: Map<string, ProcessInfo> = new Map();
  private geminiCliPath: string;
  private maxConcurrentSessions: number;

  constructor() {
    super();
    this.geminiCliPath = process.env.GEMINI_CLI_PATH || 'gemini';
    this.maxConcurrentSessions = parseInt(process.env.AGENT_MAX_CONCURRENT_SESSIONS || '5', 10);
  }

  /**
   * Spawn a new Gemini CLI process for a session
   */
  async spawnGeminiCli(sessionId: string, repoPath: string): Promise<ChildProcess> {
    // Check concurrent session limit
    if (this.processes.size >= this.maxConcurrentSessions) {
      throw new Error(`Maximum concurrent sessions (${this.maxConcurrentSessions}) reached`);
    }

    console.log(`[GeminiCliManager] Spawning Gemini CLI for session ${sessionId} at ${repoPath}`);

    try {
      // Spawn Gemini CLI with ACP mode
      // Set cwd to repo path so Gemini CLI uses it as workspace
      // Note: Removed --approval-mode yolo as it doesn't work reliably
      // We handle permissions via ACP protocol instead
      const geminiProcess = spawn(this.geminiCliPath, ['--experimental-acp'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          // Ensure non-interactive mode
          NO_COLOR: '1',
        },
        cwd: repoPath,
      });

      // Store process info
      const processInfo: ProcessInfo = {
        process: geminiProcess,
        sessionId,
        repoPath,
        startedAt: new Date(),
        lastActivity: new Date(),
      };
      this.processes.set(sessionId, processInfo);

      // Set up process event handlers
      this.setupProcessHandlers(sessionId, geminiProcess);

      console.log(
        `[GeminiCliManager] Gemini CLI spawned successfully for session ${sessionId}, PID: ${geminiProcess.pid}`
      );

      return geminiProcess;
    } catch (error) {
      console.error(
        `[GeminiCliManager] Failed to spawn Gemini CLI for session ${sessionId}:`,
        error
      );
      throw new Error(`Failed to spawn Gemini CLI: ${error}`);
    }
  }

  /**
   * Set up event handlers for a Gemini CLI process
   */
  private setupProcessHandlers(sessionId: string, geminiProcess: ChildProcess): void {
    // Handle process exit
    geminiProcess.on('exit', (code, signal) => {
      console.log(
        `[GeminiCliManager] Gemini CLI process exited for session ${sessionId}, code: ${code}, signal: ${signal}`
      );
      this.processes.delete(sessionId);
      this.emit('process-exit', { sessionId, code, signal });
    });

    // Handle process errors
    geminiProcess.on('error', (error) => {
      console.error(`[GeminiCliManager] Gemini CLI process error for session ${sessionId}:`, error);
      this.emit('process-error', { sessionId, error });
    });

    // Capture stderr for error logging
    if (geminiProcess.stderr) {
      geminiProcess.stderr.on('data', (data) => {
        const errorMessage = data.toString();
        console.error(
          `[GeminiCliManager] Gemini CLI stderr for session ${sessionId}:`,
          errorMessage
        );
        this.emit('process-stderr', { sessionId, message: errorMessage });
      });
    }
  }

  /**
   * Get process for a session
   */
  getProcess(sessionId: string): ChildProcess | undefined {
    return this.processes.get(sessionId)?.process;
  }

  /**
   * Get process info for a session
   */
  getProcessInfo(sessionId: string): ProcessInfo | undefined {
    return this.processes.get(sessionId);
  }

  /**
   * Update last activity timestamp for a session
   */
  updateActivity(sessionId: string): void {
    const processInfo = this.processes.get(sessionId);
    if (processInfo) {
      processInfo.lastActivity = new Date();
    }
  }

  /**
   * Terminate a process for a session
   */
  async terminateProcess(sessionId: string): Promise<void> {
    const processInfo = this.processes.get(sessionId);
    if (!processInfo) {
      console.warn(`[GeminiCliManager] No process found for session ${sessionId}`);
      return;
    }

    console.log(`[GeminiCliManager] Terminating Gemini CLI process for session ${sessionId}`);

    const { process } = processInfo;

    // Try graceful termination first
    process.kill('SIGTERM');

    // Wait up to 5 seconds for graceful termination
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        if (!process.killed) {
          console.warn(
            `[GeminiCliManager] Force killing Gemini CLI process for session ${sessionId}`
          );
          process.kill('SIGKILL');
        }
        resolve();
      }, 5000);

      process.once('exit', () => {
        clearTimeout(timeout);
        resolve();
      });
    });

    this.processes.delete(sessionId);
  }

  /**
   * Terminate all processes (for server shutdown)
   */
  async terminateAllProcesses(): Promise<void> {
    console.log(
      `[GeminiCliManager] Terminating all Gemini CLI processes (${this.processes.size} active)`
    );

    const terminationPromises = Array.from(this.processes.keys()).map((sessionId) =>
      this.terminateProcess(sessionId)
    );

    await Promise.all(terminationPromises);

    console.log('[GeminiCliManager] All Gemini CLI processes terminated');
  }

  /**
   * Get count of active processes
   */
  getActiveProcessCount(): number {
    return this.processes.size;
  }

  /**
   * Check if at session limit
   */
  isAtLimit(): boolean {
    return this.processes.size >= this.maxConcurrentSessions;
  }

  /**
   * Get idle sessions (no activity for specified duration)
   */
  getIdleSessions(idleTimeoutMs: number): string[] {
    const now = Date.now();
    const idleSessions: string[] = [];

    for (const [sessionId, processInfo] of this.processes.entries()) {
      const idleTime = now - processInfo.lastActivity.getTime();
      if (idleTime > idleTimeoutMs) {
        idleSessions.push(sessionId);
      }
    }

    return idleSessions;
  }

  /**
   * Verify Gemini CLI is available
   */
  async verifyGeminiCli(): Promise<boolean> {
    return new Promise((resolve) => {
      const testProcess = spawn(this.geminiCliPath, ['--version'], {
        stdio: 'pipe',
      });

      testProcess.on('error', () => {
        resolve(false);
      });

      testProcess.on('exit', (code) => {
        resolve(code === 0);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        testProcess.kill();
        resolve(false);
      }, 5000);
    });
  }
}

// Singleton instance
export const geminiCliManager = new GeminiCliManager();
