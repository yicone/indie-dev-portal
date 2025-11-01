# Session 和消息合并修复 - 2025-11-01

**日期**: 2025-11-01  
**类型**: Bug 修复 + 设计决策

---

## 🐛 问题 1: Session 创建失败

### 用户反馈

- 创建新 session 后仍显示旧消息
- 错误提示："Failed to create session"
- 但 session 列表中已有 6 个 active sessions

### 根本原因

**异步竞态条件**:

```typescript
// 之前的代码
const session = await response.json();

// 重新加载所有 sessions（可能失败或延迟）
const sessionsResponse = await fetch('http://localhost:4000/sessions');
if (sessionsResponse.ok) {
  setSessions(sessionsMap); // 如果这里失败，sessions 不更新
}

// 但继续执行
setActiveSessionId(session.id); // 设置了不存在的 session
```

**问题**:

1. 如果重新加载失败，新 session 不在 sessions Map 中
2. 但 activeSessionId 已设置为新 session
3. UI 找不到 session 数据，显示错误

### 解决方案 (问题1)

**立即添加 session，后台刷新**:

```typescript
const session = await response.json();

// 1. 立即添加到 sessions map
setSessions((prev) => {
  const newSessions = new Map(prev);
  newSessions.set(session.id, session);
  return newSessions;
});

// 2. 初始化空消息
setMessages((prev) => {
  const newMessages = new Map(prev);
  newMessages.set(session.id, []);
  return newMessages;
});

// 3. 设置为活动 session
setActiveSessionId(session.id);
setIsOpen(true);

// 4. 后台刷新（不阻塞，不影响主流程）
fetch('http://localhost:4000/sessions')
  .then(...)
  .catch(...);  // 失败也不影响
```

**优点 (问题1解决方案)**:

- ✅ 新 session 立即可用
- ✅ 不依赖后台刷新
- ✅ 失败不影响用户体验
- ✅ 后台刷新获取完整数据

---

## 🔄 问题 2: 刷新后消息重新分离

### 用户反馈 (问题2)

"之前测试在对话时已合并的消息，在页面刷新后，又重新分离显示在多个气泡中"

### 根本原因分析

**前端合并 vs 后端存储**:

```
对话时（实时）:
1. Agent 发送消息 A
2. Agent 发送消息 B
3. 前端检测到时间窗口内 → 合并为 A+B
4. UI 显示一个气泡

页面刷新后:
1. 从后端加载消息
2. 后端返回两条独立消息：A 和 B
3. 前端直接显示 → 两个气泡
4. 合并逻辑不会在加载时执行
```

**问题**:

- 前端合并只在**实时接收**时发生
- 后端存储的是**原始消息**（未合并）
- 刷新后加载的是原始消息

### 设计决策

#### 选项 1: 前端加载时合并（临时方案）

**实现**:

```typescript
const loadSessionMessages = async (sessionId: string) => {
  const messagesData = await fetch(...).then(res => res.json());

  // 加载后应用合并逻辑
  const mergedMessages = mergeConsecutiveAgentMessages(messagesData);

  setMessages(prev => {
    const newMessages = new Map(prev);
    newMessages.set(sessionId, mergedMessages);
    return newMessages;
  });
};
```

**优点 (选项1)**:

- ✅ 快速修复
- ✅ 前端实现
- ✅ 不需要后端改动

**缺点 (选项1)**:

- ⚠️ 合并逻辑重复（实时 + 加载）
- ⚠️ 可能与实时合并不一致
- ⚠️ 不是根本解决方案

---

#### 选项 2: 后端 Streaming 协议（推荐方案）

**设计**:

```typescript
// 后端 WebSocket 消息协议
interface StreamingMessage {
  type: 'message.start' | 'message.chunk' | 'message.end';
  payload: {
    sessionId: string;
    messageId: string;  // 整个 streaming 使用同一个 ID
    role: 'agent';
    content: {
      type: 'text';
      text: string;  // chunk: 增量, end: 完整
    };
    timestamp: string;
  };
}

// 后端存储
{
  id: 'msg-123',
  role: 'agent',
  content: '完整的合并后内容',  // 存储完整内容
  isStreaming: false
}
```

**流程**:

```
1. Agent 开始回复 → message.start
2. Agent 发送内容块 → message.chunk (多次)
3. Agent 完成回复 → message.end (包含完整内容)
4. 后端存储完整内容（一条消息）
5. 刷新后加载 → 一条完整消息
```

**优点 (选项2)**:

- ✅ 根本解决方案
- ✅ 前后端一致
- ✅ 支持进度显示
- ✅ 刷新后保持合并

**缺点 (选项2)**:

- ❌ 需要后端重构
- ❌ 需要定义新协议
- ❌ 实施时间较长

---

### 最终决策

**✅ 采用选项 2（后端 Streaming 协议）**

**理由**:

1. 这是**架构问题**，不是简单的 Bug
2. 前端临时方案会导致技术债务
3. 需要在新 spec 中正确设计和实施

**行动**:

1. ✅ 在当前 spec (`improve-agent-chat-ui-ux`) 中**不处理**此问题
2. ✅ 创建新 spec (`fix-message-streaming`) 来正确解决
3. ✅ 在新 spec 中定义完整的 streaming 协议
4. ✅ 协调前后端实施

**临时状态**:

- ⚠️ 实时对话时消息合并正常
- ⚠️ 刷新后消息会分离（已知限制）
- ✅ 不影响核心功能
- ✅ 将在新 spec 中彻底解决

---

## 📁 问题 3: 文档组织规范

### 用户反馈 (问题3)

"你最近多次将短时性的过程文档，建立在 repo 根目录下，且文件名为大写字母，这是否都违背我们设置的规则体系？"

### 规则回顾

**项目规则** (`AGENTS.md`):

```markdown
### File Naming Conventions

#### Documentation Files

**In docs/ directory**:

- Use `SCREAMING_SNAKE_CASE.md` for top-level docs
- Use `kebab-case.md` for subdirectory docs

**In openspec/ directory**:

- Use `kebab-case` for change IDs
- Standard files: `proposal.md`, `tasks.md`, `design.md`, `spec.md`
```

### 违规文件清单

**根目录下的临时文档**:

1. ❌ `MESSAGE_MERGE_STRATEGY.md` - 应该在 `docs/` 或 `openspec/`
2. ❌ `BACKEND_ISSUES.md` - 应该在 `docs/`
3. ❌ `TEST_REPORT.md` - 应该在 `docs/`
4. ❌ `TEST_REPORT_ROUND3.md` - 应该在 `docs/`
5. ❌ `WORK_SUMMARY.md` - 应该在 `docs/`
6. ❌ `BUG_FIX_PLAN.md` - 应该在 `docs/`
7. ❌ `FINAL_SUMMARY.md` - 应该在 `docs/`
8. ❌ `ACTION_SUMMARY.md` - 应该在 `docs/`
9. ❌ `CRITICAL_FIX.md` - 应该在 `docs/fixes/`

### 正确的组织方式

**应该是**:

```
docs/
├── fixes/
│   ├── 2025-11-01-message-merge-strategy.md
│   ├── 2025-11-01-backend-issues.md
│   ├── 2025-11-01-session-creation-fix.md
│   └── 2025-11-01-session-and-merge-fixes.md (本文档)
├── testing/
│   ├── 2025-11-01-round-1-test-report.md
│   ├── 2025-11-01-round-2-test-report.md
│   └── 2025-11-01-round-3-test-report.md
└── summaries/
    ├── 2025-11-01-work-summary.md
    └── 2025-11-01-final-summary.md
```

**命名规范**:

- ✅ 使用 `kebab-case.md`
- ✅ 添加日期前缀 `YYYY-MM-DD-`
- ✅ 放在适当的子目录中
- ✅ 描述性的文件名

### 修复计划 (问题3)

**立即行动**:

1. 移动所有根目录文档到 `docs/` 的适当子目录
2. 重命名为 `kebab-case` 格式
3. 添加日期前缀
4. 更新所有内部链接

**文件映射**:

| 当前位置                     | 正确位置                                           |
| ---------------------------- | -------------------------------------------------- |
| `/MESSAGE_MERGE_STRATEGY.md` | `/docs/fixes/2025-11-01-message-merge-strategy.md` |
| `/BACKEND_ISSUES.md`         | `/docs/fixes/2025-11-01-backend-issues.md`         |
| `/CRITICAL_FIX.md`           | `/docs/fixes/2025-11-01-session-creation-fix.md`   |
| `/TEST_REPORT.md`            | `/docs/testing/2025-11-01-round-2-test-report.md`  |
| `/TEST_REPORT_ROUND3.md`     | `/docs/testing/2025-11-01-round-3-test-report.md`  |
| `/WORK_SUMMARY.md`           | `/docs/summaries/2025-11-01-work-summary.md`       |
| `/FINAL_SUMMARY.md`          | `/docs/summaries/2025-11-01-final-summary.md`      |
| `/ACTION_SUMMARY.md`         | `/docs/summaries/2025-11-01-action-summary.md`     |
| `/BUG_FIX_PLAN.md`           | `/docs/fixes/2025-11-01-bug-fix-plan.md`           |

---

## ✅ 总结

### 问题 1: Session 创建

- **状态**: ✅ 已修复
- **方案**: 立即添加 session，后台刷新
- **提交**: 待提交

### 问题 2: 消息合并

- **状态**: ⏳ 推迟到新 spec
- **决策**: 需要后端 Streaming 协议
- **新 spec**: `fix-message-streaming`
- **当前**: 已知限制，不影响核心功能

### 问题 3: 文档组织

- **状态**: ❌ 违反规范
- **修复**: 移动和重命名所有文档
- **行动**: 立即执行

---

**下一步**:

1. 提交 session 创建修复
2. 重组文档结构
3. 创建 `fix-message-streaming` spec（如需要）
