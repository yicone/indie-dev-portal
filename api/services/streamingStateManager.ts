/**
 * Streaming State Manager
 * Manages active message streaming states
 */

interface StreamingState {
  messageId: string;
  sessionId: string;
  role: 'agent';
  contentAccumulator: string;
  startedAt: Date;
  lastChunkAt: Date;
}

class StreamingStateManager {
  private activeStreams: Map<string, StreamingState> = new Map();
  private readonly TIMEOUT_MS = 60000; // 60 seconds timeout

  /**
   * Start a new streaming session
   */
  startStream(messageId: string, sessionId: string): void {
    if (this.activeStreams.has(messageId)) {
      console.warn(`[StreamingStateManager] Stream already exists: ${messageId}`);
      return;
    }

    const state: StreamingState = {
      messageId,
      sessionId,
      role: 'agent',
      contentAccumulator: '',
      startedAt: new Date(),
      lastChunkAt: new Date(),
    };

    this.activeStreams.set(messageId, state);
    console.log(`[StreamingStateManager] Started stream: ${messageId}`);
  }

  /**
   * Add a chunk to an active stream
   */
  addChunk(messageId: string, text: string): void {
    const state = this.activeStreams.get(messageId);

    if (!state) {
      console.error(`[StreamingStateManager] Stream not found: ${messageId}`);
      throw new Error(`Stream not found: ${messageId}`);
    }

    state.contentAccumulator += text;
    state.lastChunkAt = new Date();

    console.log(
      `[StreamingStateManager] Added chunk to ${messageId}, total length: ${state.contentAccumulator.length}`
    );
  }

  /**
   * Complete a stream and get the full content
   */
  completeStream(messageId: string): string {
    const state = this.activeStreams.get(messageId);

    if (!state) {
      console.error(`[StreamingStateManager] Stream not found: ${messageId}`);
      throw new Error(`Stream not found: ${messageId}`);
    }

    const fullContent = state.contentAccumulator;
    this.activeStreams.delete(messageId);

    console.log(
      `[StreamingStateManager] Completed stream: ${messageId}, final length: ${fullContent.length}`
    );

    return fullContent;
  }

  /**
   * Get current state of a stream
   */
  getState(messageId: string): StreamingState | undefined {
    return this.activeStreams.get(messageId);
  }

  /**
   * Check if a stream is active
   */
  isActive(messageId: string): boolean {
    return this.activeStreams.has(messageId);
  }

  /**
   * Cancel a stream
   */
  cancelStream(messageId: string): void {
    if (this.activeStreams.has(messageId)) {
      this.activeStreams.delete(messageId);
      console.log(`[StreamingStateManager] Cancelled stream: ${messageId}`);
    }
  }

  /**
   * Clean up timed-out streams
   * Should be called periodically
   */
  cleanupTimedOutStreams(): void {
    const now = new Date();
    const timedOut: string[] = [];

    for (const [messageId, state] of this.activeStreams.entries()) {
      const elapsed = now.getTime() - state.lastChunkAt.getTime();

      if (elapsed > this.TIMEOUT_MS) {
        timedOut.push(messageId);
      }
    }

    for (const messageId of timedOut) {
      console.warn(`[StreamingStateManager] Cleaning up timed-out stream: ${messageId}`);
      this.activeStreams.delete(messageId);
    }

    if (timedOut.length > 0) {
      console.log(`[StreamingStateManager] Cleaned up ${timedOut.length} timed-out streams`);
    }
  }

  /**
   * Get all active streams (for debugging)
   */
  getActiveStreams(): Map<string, StreamingState> {
    return new Map(this.activeStreams);
  }

  /**
   * Get count of active streams
   */
  getActiveCount(): number {
    return this.activeStreams.size;
  }
}

// Singleton instance
const streamingStateManager = new StreamingStateManager();

// Start cleanup interval
setInterval(() => {
  streamingStateManager.cleanupTimedOutStreams();
}, 30000); // Check every 30 seconds

export default streamingStateManager;
