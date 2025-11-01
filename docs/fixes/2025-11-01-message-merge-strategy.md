# Message Merge Strategy Design

## 🎯 目标

解决 Agent 消息被分割到多个气泡中显示的问题，实现智能消息合并。

---

## 📊 问题分析

### 当前问题

1. **消息分割**：Agent 的一次完整回复被分割成多个独立消息
2. **语法高亮丢失**：分割后的代码块失去语法高亮
3. **用户体验差**：难以阅读完整的回复内容

### 根本原因

**后端行为**：

- 每次发送内容时都创建新的 `message.new` 事件
- 每个事件都有不同的 `messageId`
- 前端将每个 messageId 视为独立消息

**前端行为**：

- 之前的合并逻辑已被移除（因为导致重复）
- 现在基于 messageId 更新，但每个新 messageId 都创建新消息

---

## 🎨 设计方案

### 方案 1: 基于时间窗口的智能合并（推荐）

**原理**：

- 在短时间窗口内（如 2 秒）连续的 agent 消息自动合并
- 使用消息角色和时间戳判断是否应该合并
- 避免合并用户消息或时间间隔较长的消息

**优点**：

- ✅ 前端实现简单
- ✅ 不需要后端改动
- ✅ 适用于各种场景
- ✅ 避免重复内容

**缺点**：

- ⚠️ 时间窗口需要调优
- ⚠️ 可能误合并不相关的消息

---

### 方案 2: 基于 Streaming 标识（最佳）

**原理**：

- 后端在 streaming 开始时发送 `message.start`
- 后续发送 `message.chunk` 更新内容
- 结束时发送 `message.end`
- 前端根据事件类型决定创建或更新消息

**优点**：

- ✅ 语义清晰
- ✅ 完全可控
- ✅ 支持进度显示
- ✅ 避免所有边界情况

**缺点**：

- ❌ 需要后端重构
- ❌ 需要定义新的消息协议

---

### 方案 3: 基于 messageId 前缀（折中）

**原理**：

- 同一次回复的所有消息使用相同的 messageId 前缀
- 例如：`msg-123-1`, `msg-123-2`, `msg-123-3`
- 前端提取前缀，合并相同前缀的消息

**优点**：

- ✅ 后端改动小
- ✅ 前端逻辑清晰
- ✅ 可靠性高

**缺点**：

- ⚠️ 需要后端配合
- ⚠️ messageId 格式约定

---

## ✅ 推荐实施方案

**采用方案 1（短期）+ 方案 2（长期）**

### 短期：前端智能合并（立即实施）

```typescript
// AgentChatContext.tsx
const MERGE_WINDOW_MS = 2000; // 2秒合并窗口

case 'message.new':
  const { sessionId, messageId, role, content, timestamp } = message.payload;

  setMessages((prev) => {
    const newMessages = new Map(prev);
    const sessionMessages = newMessages.get(sessionId) || [];

    // 检查是否应该合并到上一条消息
    if (role === 'agent' && sessionMessages.length > 0) {
      const lastMessage = sessionMessages[sessionMessages.length - 1];
      const lastTime = lastMessage.timestamp ? new Date(lastMessage.timestamp).getTime() : 0;
      const currentTime = new Date(timestamp).getTime();
      const timeDiff = currentTime - lastTime;

      // 条件：1) 上一条也是 agent 消息 2) 时间间隔小于窗口 3) 内容类型相同
      if (
        lastMessage.role === 'agent' &&
        timeDiff < MERGE_WINDOW_MS &&
        lastMessage.parsedContent?.type === 'text' &&
        content.type === 'text'
      ) {
        // 合并内容（使用换行分隔）
        const mergedContent = {
          type: 'text' as const,
          text: lastMessage.parsedContent.text + '\n' + content.text,
        };

        // 更新最后一条消息
        sessionMessages[sessionMessages.length - 1] = {
          ...lastMessage,
          content: JSON.stringify(mergedContent),
          parsedContent: mergedContent,
          timestamp: new Date(timestamp),
        };

        newMessages.set(sessionId, [...sessionMessages]);
        return newMessages;
      }
    }

    // 不合并，创建新消息
    newMessages.set(sessionId, [
      ...sessionMessages,
      {
        id: messageId,
        sessionId,
        role,
        content: JSON.stringify(content),
        timestamp: new Date(timestamp),
        parsedContent: content,
      } as AgentMessageData,
    ]);

    return newMessages;
  });
  break;
```

### 长期：后端 Streaming 协议（未来实施）

```typescript
// 后端 WebSocket 消息协议
interface StreamingMessage {
  type: 'message.start' | 'message.chunk' | 'message.end';
  payload: {
    sessionId: string;
    messageId: string; // 整个 streaming 过程使用同一个 ID
    role: 'agent';
    content: {
      type: 'text';
      text: string; // chunk: 增量内容, end: 完整内容
    };
    timestamp: string;
    isComplete?: boolean; // end 时为 true
  };
}

// 前端处理
case 'message.start':
  // 创建新消息，标记为 streaming
  break;

case 'message.chunk':
  // 追加内容到现有消息
  break;

case 'message.end':
  // 标记消息完成
  break;
```

---

## 🔧 实施步骤

### Phase 1: 前端智能合并（立即）

1. ✅ 修改 `AgentChatContext.tsx` 的 `message.new` 处理
2. ✅ 添加时间窗口合并逻辑
3. ✅ 添加内容类型检查
4. ✅ 测试合并效果

### Phase 2: Session 切换 Bug 修复（立即）

1. ✅ 修复 session 切换时不加载消息的问题
2. ✅ 修复新 session 显示旧消息的问题
3. ✅ 修复 sendMessage 失败的问题

### Phase 3: 后端协议升级（未来）

1. 定义 streaming 消息协议
2. 后端实现 message.start/chunk/end
3. 前端适配新协议
4. 测试和验证

---

## 🧪 测试计划

### 功能测试

- [ ] 连续的 agent 消息正确合并
- [ ] 用户消息不被合并
- [ ] 时间间隔超过窗口的消息不合并
- [ ] 代码块语法高亮正确显示
- [ ] 列表格式正确渲染

### 边界测试

- [ ] 快速连续发送多条消息
- [ ] 网络延迟情况
- [ ] 消息顺序错乱情况
- [ ] 空消息处理

### 性能测试

- [ ] 大量消息合并性能
- [ ] 内存占用
- [ ] UI 渲染性能

---

## 📈 成功指标

1. ✅ Agent 的完整回复显示在一个气泡中
2. ✅ 代码块保持语法高亮
3. ✅ 列表格式正确
4. ✅ 无重复内容
5. ✅ 用户体验流畅

---

## 🔄 回滚计划

如果合并策略导致问题：

1. 调整合并窗口时间（从 2s 改为 1s 或 3s）
2. 添加更严格的合并条件
3. 如果仍有问题，回退到不合并（当前状态）

---

## 📝 相关文档

- `AgentChatContext.tsx` - 消息处理逻辑
- `AgentChatPanel.tsx` - UI 渲染
- WebSocket 协议文档（待创建）
