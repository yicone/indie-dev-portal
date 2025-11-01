# Agent Chat UI Bug Fixes

**Date**: 2025-11-01  
**Type**: Bug Fix  
**Component**: Agent Chat UI  
**Status**: In Progress

## Problems Identified

### 1. Markdown Rendering Issues (图1)

**Problem**:

- Incorrect line breaks in agent responses
- Missing formatting for readability
- Content appears cramped

**Root Cause**:

- ReactMarkdown configuration may need adjustment
- remarkGfm plugin settings
- CSS styling for markdown content

**Solution**:

- Review ReactMarkdown configuration
- Adjust remarkGfm settings for proper line break handling
- Add CSS for better markdown content spacing

### 2. Message Content Duplication (图2)

**Problem**:

- Agent responses show duplicated content blocks
- Content appears to be concatenated incorrectly
- Clear evidence of streaming message assembly issues

**Root Cause**:

- WebSocket message handling bug
- Message chunk concatenation logic error
- Possible race condition in state updates

**Solution**:

- Investigate WebSocket message handler
- Review message state management in AgentChatContext
- Add message deduplication logic
- Implement idempotency checks

## Implementation Plan

### Phase 1: Markdown Rendering Fix (Immediate)

- [ ] Review ReactMarkdown props and configuration
- [ ] Test remarkGfm settings
- [ ] Add CSS for markdown content spacing
- [ ] Test with various markdown content types

### Phase 2: Message Duplication Fix (Immediate)

- [ ] Investigate WebSocket message handler in AgentChatContext
- [ ] Review message concatenation logic
- [ ] Add logging to track message chunks
- [ ] Implement deduplication logic
- [ ] Add unit tests for message assembly

### Phase 3: Testing and Validation

- [ ] Test markdown rendering with various content
- [ ] Test message streaming with different response lengths
- [ ] Verify no regressions in existing functionality
- [ ] Manual testing with real agent conversations

## Files to Modify

1. `components/agent/AgentChatPanel.tsx` - Markdown rendering configuration
2. `lib/contexts/AgentChatContext.tsx` - WebSocket message handling
3. `components/agent/AgentChatPanel.tsx` - CSS for markdown content

## Testing Checklist

- [ ] Markdown line breaks render correctly
- [ ] Code blocks display properly
- [ ] Lists and formatting work as expected
- [ ] No duplicate content in agent responses
- [ ] Streaming messages assemble correctly
- [ ] No console errors
- [ ] TypeScript compilation passes

## Related Issues

- User feedback: 问题 5 (Markdown 渲染)
- User feedback: 问题 6 (消息重复)

## Notes

These are bug fixes that restore intended behavior, so they don't require new OpenSpec proposals. They fix implementation issues that violate existing specs.
