/**
 * Unit tests for StreamingStateManager
 * Core streaming state management functionality
 */

import streamingStateManager from '../streamingStateManager';

describe('StreamingStateManager', () => {
  beforeEach(() => {
    // Clear all active streams before each test
    const activeStreams = streamingStateManager.getActiveStreams();
    for (const [messageId] of activeStreams) {
      streamingStateManager.cancelStream(messageId);
    }
  });

  describe('startStream', () => {
    it('should create a new stream with correct initial state', () => {
      const messageId = 'msg-001';
      const sessionId = 'session-001';

      streamingStateManager.startStream(messageId, sessionId);

      expect(streamingStateManager.isActive(messageId)).toBe(true);
      const state = streamingStateManager.getState(messageId);
      expect(state).toBeDefined();
      expect(state?.messageId).toBe(messageId);
      expect(state?.sessionId).toBe(sessionId);
      expect(state?.role).toBe('agent');
      expect(state?.contentAccumulator).toBe('');
    });

    it('should not create duplicate stream for same messageId', () => {
      const messageId = 'msg-001';
      const sessionId = 'session-001';

      streamingStateManager.startStream(messageId, sessionId);
      const initialState = streamingStateManager.getState(messageId);

      // Try to start again
      streamingStateManager.startStream(messageId, sessionId);
      const finalState = streamingStateManager.getState(messageId);

      expect(initialState).toEqual(finalState);
      expect(streamingStateManager.getActiveCount()).toBe(1);
    });
  });

  describe('addChunk', () => {
    it('should accumulate content chunks correctly', () => {
      const messageId = 'msg-001';
      const sessionId = 'session-001';

      streamingStateManager.startStream(messageId, sessionId);
      streamingStateManager.addChunk(messageId, 'Hello ');
      streamingStateManager.addChunk(messageId, 'World');
      streamingStateManager.addChunk(messageId, '!');

      const state = streamingStateManager.getState(messageId);
      expect(state?.contentAccumulator).toBe('Hello World!');
    });

    it('should throw error when adding chunk to non-existent stream', () => {
      expect(() => {
        streamingStateManager.addChunk('non-existent', 'text');
      }).toThrow('Stream not found: non-existent');
    });

    it('should update lastChunkAt timestamp', () => {
      const messageId = 'msg-001';
      const sessionId = 'session-001';

      streamingStateManager.startStream(messageId, sessionId);
      const initialState = streamingStateManager.getState(messageId);
      const initialTime = initialState?.lastChunkAt.getTime();

      // Wait a bit
      setTimeout(() => {
        streamingStateManager.addChunk(messageId, 'chunk');
        const updatedState = streamingStateManager.getState(messageId);
        const updatedTime = updatedState?.lastChunkAt.getTime();

        expect(updatedTime).toBeGreaterThan(initialTime!);
      }, 10);
    });
  });

  describe('touchStream', () => {
    it('should update lastChunkAt for active stream by sessionId', () => {
      const messageId = 'msg-001';
      const sessionId = 'session-001';

      streamingStateManager.startStream(messageId, sessionId);
      const initialState = streamingStateManager.getState(messageId);
      const initialTime = initialState?.lastChunkAt.getTime();

      setTimeout(() => {
        streamingStateManager.touchStream(sessionId);
        const updatedState = streamingStateManager.getState(messageId);
        const updatedTime = updatedState?.lastChunkAt.getTime();

        expect(updatedTime).toBeGreaterThan(initialTime!);
      }, 10);
    });

    it('should not throw error for non-existent session', () => {
      expect(() => {
        streamingStateManager.touchStream('non-existent-session');
      }).not.toThrow();
    });
  });

  describe('completeStream', () => {
    it('should return complete content and remove stream', () => {
      const messageId = 'msg-001';
      const sessionId = 'session-001';

      streamingStateManager.startStream(messageId, sessionId);
      streamingStateManager.addChunk(messageId, 'Hello ');
      streamingStateManager.addChunk(messageId, 'World');

      const content = streamingStateManager.completeStream(messageId);

      expect(content).toBe('Hello World');
      expect(streamingStateManager.isActive(messageId)).toBe(false);
      expect(streamingStateManager.getState(messageId)).toBeUndefined();
    });

    it('should throw error when completing non-existent stream', () => {
      expect(() => {
        streamingStateManager.completeStream('non-existent');
      }).toThrow('Stream not found: non-existent');
    });
  });

  describe('cancelStream', () => {
    it('should remove stream without returning content', () => {
      const messageId = 'msg-001';
      const sessionId = 'session-001';

      streamingStateManager.startStream(messageId, sessionId);
      streamingStateManager.addChunk(messageId, 'Some content');

      streamingStateManager.cancelStream(messageId);

      expect(streamingStateManager.isActive(messageId)).toBe(false);
      expect(streamingStateManager.getState(messageId)).toBeUndefined();
    });

    it('should not throw error when canceling non-existent stream', () => {
      expect(() => {
        streamingStateManager.cancelStream('non-existent');
      }).not.toThrow();
    });
  });

  describe('concurrent streams', () => {
    it('should handle multiple streams independently', () => {
      const msg1 = 'msg-001';
      const msg2 = 'msg-002';
      const session1 = 'session-001';
      const session2 = 'session-002';

      streamingStateManager.startStream(msg1, session1);
      streamingStateManager.startStream(msg2, session2);

      streamingStateManager.addChunk(msg1, 'Stream 1 ');
      streamingStateManager.addChunk(msg2, 'Stream 2 ');
      streamingStateManager.addChunk(msg1, 'content');
      streamingStateManager.addChunk(msg2, 'content');

      const state1 = streamingStateManager.getState(msg1);
      const state2 = streamingStateManager.getState(msg2);

      expect(state1?.contentAccumulator).toBe('Stream 1 content');
      expect(state2?.contentAccumulator).toBe('Stream 2 content');
      expect(streamingStateManager.getActiveCount()).toBe(2);
    });

    it('should isolate streams by sessionId', () => {
      const msg1 = 'msg-001';
      const msg2 = 'msg-002';
      const session1 = 'session-001';
      const session2 = 'session-002';

      streamingStateManager.startStream(msg1, session1);
      streamingStateManager.startStream(msg2, session2);

      // Touch session1 should only affect msg1
      streamingStateManager.touchStream(session1);

      const state1 = streamingStateManager.getState(msg1);
      const state2 = streamingStateManager.getState(msg2);

      expect(state1?.sessionId).toBe(session1);
      expect(state2?.sessionId).toBe(session2);
    });
  });

  describe('cleanupTimedOutStreams', () => {
    it('should remove streams that exceed timeout', () => {
      const messageId = 'msg-001';
      const sessionId = 'session-001';

      streamingStateManager.startStream(messageId, sessionId);

      // Manually set lastChunkAt to past time
      const state = streamingStateManager.getState(messageId);
      if (state) {
        // Set to 61 seconds ago (timeout is 60 seconds)
        state.lastChunkAt = new Date(Date.now() - 61000);
      }

      streamingStateManager.cleanupTimedOutStreams();

      expect(streamingStateManager.isActive(messageId)).toBe(false);
    });

    it('should not remove active streams within timeout', () => {
      const messageId = 'msg-001';
      const sessionId = 'session-001';

      streamingStateManager.startStream(messageId, sessionId);
      streamingStateManager.addChunk(messageId, 'Recent activity');

      streamingStateManager.cleanupTimedOutStreams();

      expect(streamingStateManager.isActive(messageId)).toBe(true);
    });
  });

  describe('getActiveCount', () => {
    it('should return correct count of active streams', () => {
      expect(streamingStateManager.getActiveCount()).toBe(0);

      streamingStateManager.startStream('msg-001', 'session-001');
      expect(streamingStateManager.getActiveCount()).toBe(1);

      streamingStateManager.startStream('msg-002', 'session-002');
      expect(streamingStateManager.getActiveCount()).toBe(2);

      streamingStateManager.completeStream('msg-001');
      expect(streamingStateManager.getActiveCount()).toBe(1);

      streamingStateManager.cancelStream('msg-002');
      expect(streamingStateManager.getActiveCount()).toBe(0);
    });
  });
});
