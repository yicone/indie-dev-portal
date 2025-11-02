# Fix Message Streaming

## Why

Agent 消息在实时对话时可以正确合并，但页面刷新后会重新分离到多个气泡中。这是因为：

1. **前端合并是临时的**：合并逻辑只在实时接收 WebSocket 消息时执行
2. **后端存储原始消息**：每个消息片段都作为独立消息存储
3. **刷新后加载原始数据**：从后端加载时获得的是未合并的原始消息
4. **用户体验不一致**：同一对话在刷新前后显示不同

这不是简单的 Bug，而是架构问题，需要重新设计消息 streaming 协议。

## What Changes

### Backend Changes

1. **定义 Streaming 消息协议**
   - `message.start`: 开始一条新消息
   - `message.chunk`: 发送内容增量
   - `message.end`: 完成消息，包含完整内容

2. **存储完整消息**
   - 后端在 streaming 过程中累积内容
   - 只在 `message.end` 时存储一条完整消息
   - 数据库中每条消息都是完整的

3. **WebSocket 消息格式**
   ```typescript
   interface StreamingMessage {
     type: 'message.start' | 'message.chunk' | 'message.end';
     payload: {
       sessionId: string;
       messageId: string; // 整个 streaming 使用同一个 ID
       role: 'agent';
       content: {
         type: 'text';
         text: string; // chunk: 增量, end: 完整
       };
       timestamp: string;
       isComplete?: boolean; // end 时为 true
     };
   }
   ```

### Frontend Changes

1. **处理 Streaming 事件**
   - `message.start`: 创建占位消息
   - `message.chunk`: 追加内容到现有消息
   - `message.end`: 标记消息完成

2. **移除前端合并逻辑**
   - 删除基于时间窗口的合并
   - 依赖后端提供完整消息

3. **统一加载和实时逻辑**
   - 加载历史消息：直接显示完整消息
   - 实时接收：通过 streaming 协议构建完整消息
   - 刷新后保持一致

## Impact

### Affected Specs

- **MODIFIED**: `agent-chat-ui` - 移除前端合并逻辑，处理 streaming 协议
- **NEW**: `message-streaming` - 定义 streaming 协议和实现

### Affected Code

**Backend**:

- **Modified**: WebSocket message handler - 实现 streaming 协议
- **Modified**: Message storage - 只存储完整消息
- **New**: Streaming state manager - 管理 streaming 状态

**Frontend**:

- **Modified**: `lib/contexts/AgentChatContext.tsx` - 处理 streaming 事件
- **Modified**: `components/agent/AgentChatPanel.tsx` - 显示 streaming 进度
- **Removed**: 前端消息合并逻辑

### Benefits

- ✅ 刷新后消息保持合并状态
- ✅ 前后端数据一致
- ✅ 支持进度显示
- ✅ 更清晰的架构
- ✅ 减少前端复杂度

### Risks

- ⚠️ 需要后端重构
- ⚠️ 需要协调前后端实施
- ⚠️ 可能影响现有消息

### Migration Path

1. **Phase 1: 后端实现**
   - 实现 streaming 协议
   - 保持向后兼容（同时支持旧协议）
   - 测试 streaming 功能

2. **Phase 2: 前端适配**
   - 实现 streaming 事件处理
   - 保留前端合并作为 fallback
   - 测试新旧协议兼容性

3. **Phase 3: 数据迁移**
   - 可选：合并历史消息
   - 或：只对新消息使用新协议

4. **Phase 4: 清理**
   - 移除旧协议支持
   - 移除前端合并逻辑
   - 更新文档

## Alternatives Considered

### Alternative 1: 前端加载时合并

**方案**: 在 `loadSessionMessages` 时应用合并逻辑

**优点**:

- 快速实现
- 不需要后端改动

**缺点**:

- 合并逻辑重复（实时 + 加载）
- 可能不一致
- 技术债务

**决策**: ❌ 不采用，只是临时方案

### Alternative 2: 后端定期合并

**方案**: 后端定期任务合并连续的 agent 消息

**优点**:

- 前端不需要改动
- 数据库中消息已合并

**缺点**:

- 合并逻辑复杂（如何判断应该合并）
- 可能误合并
- 延迟合并

**决策**: ❌ 不采用，逻辑不清晰

### Alternative 3: Streaming 协议（推荐）

**方案**: 定义明确的 streaming 协议

**优点**:

- 语义清晰
- 前后端一致
- 支持进度显示
- 根本解决问题

**缺点**:

- 需要后端重构
- 实施时间较长

**决策**: ✅ 采用，这是正确的架构

## Success Criteria

- [ ] 后端实现 streaming 协议
- [ ] 前端正确处理 streaming 事件
- [ ] 刷新后消息保持合并
- [ ] 实时对话显示进度
- [ ] 历史消息正确加载
- [ ] 无性能退化
- [ ] 文档完整

## Timeline

- **Week 1**: 设计和规范定义
- **Week 2**: 后端实现
- **Week 3**: 前端实现
- **Week 4**: 测试和优化
- **Week 5**: 数据迁移（可选）
- **Week 6**: 清理和文档

## Dependencies

- 后端团队协作
- WebSocket 协议升级
- 可能需要数据库迁移

## Notes

- 这是 `improve-agent-chat-ui-ux` spec 的后续工作
- 当前 spec 中的前端合并是临时方案
- 本 spec 将提供根本解决方案
