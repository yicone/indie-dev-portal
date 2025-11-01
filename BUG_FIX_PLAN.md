# Bug Fix Implementation Plan

## 🐛 Bug 1: Markdown Rendering Issues

### Problem

- Incorrect line breaks
- Missing formatting
- Cramped content

### Root Cause

ReactMarkdown needs better configuration for line breaks and spacing.

### Solution

```tsx
// In AgentChatPanel.tsx, update ReactMarkdown configuration:
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    // Add paragraph spacing
    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
    // Add list spacing
    ul: ({ children }) => <ul className="mb-4 last:mb-0 space-y-2">{children}</ul>,
    ol: ({ children }) => <ol className="mb-4 last:mb-0 space-y-2">{children}</ol>,
    // Existing code component...
  }}
>
  {content}
</ReactMarkdown>
```

---

## 🐛 Bug 2: Message Content Duplication

### Problem

Agent responses show duplicated content blocks (图2 shows clear duplication).

### Root Cause

**Found in `AgentChatContext.tsx` lines 62-90**:

```tsx
// Merge consecutive agent messages
if (role === 'agent' && sessionMessages.length > 0) {
  const lastMessage = sessionMessages[sessionMessages.length - 1];
  // ...
  // If last message is also from agent and within 5 seconds, merge them
  if (lastMessage.role === 'agent' && timeDiff < 5000) {
    const mergedContent = lastMessage.parsedContent.text + '\n\n' + content.text;
    // This concatenation is causing duplication!
  }
}
```

**The Problem**:

1. WebSocket sends message chunks
2. Each chunk triggers `message.new` event
3. The merge logic concatenates chunks
4. But chunks may already contain previous content
5. Result: Duplication

### Solution

**Option 1: Remove merge logic** (Safest)

- Remove lines 62-91 entirely
- Let each message be independent
- Backend should handle streaming properly

**Option 2: Add deduplication** (More complex)

- Check if new content is already in existing message
- Only append truly new content
- Requires content diff logic

**Recommended: Option 1** - Remove the problematic merge logic.

### Implementation

```tsx
// In AgentChatContext.tsx, replace lines 58-106 with:
setMessages((prev) => {
  const newMessages = new Map(prev);
  const sessionMessages = newMessages.get(sessionId) || [];

  // Check if message already exists (by messageId)
  const existingIndex = sessionMessages.findIndex((m) => m.id === messageId);

  if (existingIndex >= 0) {
    // Update existing message (for streaming updates)
    sessionMessages[existingIndex] = {
      ...sessionMessages[existingIndex],
      content: JSON.stringify(content),
      parsedContent: content,
      timestamp: new Date(timestamp),
    };
  } else {
    // Add as new message
    sessionMessages.push({
      id: messageId,
      sessionId,
      role,
      content: JSON.stringify(content),
      timestamp: new Date(timestamp),
      parsedContent: content,
    } as AgentMessageData);
  }

  newMessages.set(sessionId, [...sessionMessages]);
  return newMessages;
});
```

---

## 📝 Implementation Steps

### Step 1: Fix Markdown Rendering

- [ ] Update ReactMarkdown components in AgentChatPanel.tsx
- [ ] Add proper spacing for paragraphs and lists
- [ ] Test with various markdown content

### Step 2: Fix Message Duplication

- [ ] Remove problematic merge logic in AgentChatContext.tsx
- [ ] Implement message update by ID instead of merge
- [ ] Add logging to verify fix
- [ ] Test with streaming responses

### Step 3: Testing

- [ ] Test markdown rendering with complex content
- [ ] Test message streaming without duplication
- [ ] Verify no regressions
- [ ] Check console for errors

---

## 🎯 Expected Results

**After Fix**:

- ✅ Markdown content has proper line breaks
- ✅ Lists and paragraphs have adequate spacing
- ✅ No duplicate content in agent responses
- ✅ Streaming messages work correctly
- ✅ Clean console output

---

## 📊 Files to Modify

1. `components/agent/AgentChatPanel.tsx` - Markdown rendering
2. `lib/contexts/AgentChatContext.tsx` - Message handling logic
3. `docs/fixes/2025-11-01-agent-chat-ui-bugs.md` - Update with results
