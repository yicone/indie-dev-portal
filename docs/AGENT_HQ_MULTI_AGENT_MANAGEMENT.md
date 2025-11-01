# **解构 Agent HQ：一份关于本地多 Agent 编排的架构分析与战略指南**

---

## **第一部分：GitHub Agent HQ 的架构蓝图**

GitHub Agent HQ 的发布，标志着一个重要的战略转型：将 GitHub 从一个代码托管与协作平台，演进为 AI 驱动软件开发的核心操作系统。这一愿景超越了简单的功能叠加，旨在通过一个统一的、深度集成的架构，解决当前 AI 编码工具碎片化所带来的混乱与低效问题 1。本部分将深入剖析 Agent HQ 的核心架构支柱，揭示其设计背后的基本原则及其如何融入现有的开发者工作流。

### **1.1 “任务控制中心”范式：一个中心化的控制平面**

Agent HQ 的核心用户交互界面是“任务控制中心”（Mission Control），它被设计为一个统一的指挥中心，旨在“为创新的混乱带来一丝秩序” 1。这不仅是一个信息展示仪表盘，更是一个具备实时交互能力的控制平面，其技术实现和功能设计体现了对开发者工作流的深刻理解。

从技术实现上看，任务控制中心提供了一个跨越多终端的一致性接口，覆盖了 GitHub 网站、VS Code、移动应用以及 Copilot CLI 2。这种跨平台的一致性强烈暗示其后端存在一个中心化的任务与 Agent 状态管理服务，并通过 API 将这些状态暴露给不同的前端应用。这种架构确保了无论开发者在何处发起或监控任务，都能获得无缝衔接的体验。

该控制平面的核心功能允许开发者以前所未有的方式与 AI Agent 协作：

- **并行任务分配**：开发者可以从一个“Agent 集群”中选择多个 Agent，并行为它们分配复杂的编码任务 2。
- **实时进度监控**：对于这些异步执行的任务，开发者可以实时追踪其进展，了解 Agent 正在执行的具体操作 1。
- **主动引导与干预**：当发现 Agent 的执行路径偏离预期时，用户可以实时介入，进行引导和修正，确保最终产出符合要求 1。

Agent HQ 的一个关键设计哲学是，它并非一个“附加”的功能，而是与 GitHub 的核心元素（Git、Pull Request、Issue）原生集成 2。这意味着 Agent 的工作不再是抽象的、孤立的过程，而是直接体现为代码仓库中的具体活动，例如创建分支、提交代码、发起 Pull Request 9。这种深度集成使得 AI 的工作产出能够无缝地融入到团队既有的开发、审查和部署流程中，而不是成为一个需要额外适配的外部环节。

### **1.2 Agent 作为一等协作者：身份与治理**

Agent HQ 架构的另一项根本性转变，是将 AI Agent 从单纯的工具提升为与人类开发者同等地位的“一等协主” 9。这一转变在安全、治理和审计方面带来了深远的影响。

- **身份与权限管理**：每个 Agent 都被赋予一个唯一的身份标识。这使得企业管理员能够像管理团队成员一样，对 Agent 进行精细化的权限控制和策略管理 2。例如，可以设定特定的 Agent 只能访问某些代码仓库，或者限制其执行高风险操作 4。这种基于身份的访问控制是确保 Agent 在企业环境中安全、合规运行的基础。
- **审计与可追溯性**：通过为 Agent 分配身份，其执行的所有操作（如代码提交、PR 评论）都变得完全可审计。这为每一次变更都提供了清晰的记录——“谁或什么，在何时，出于何种原因，做了何种修改”，这对于需要满足严格合规性要求（如 SOC 2, ISO 27001）的行业至关重要 9。
- **融入治理工作流**：Agent 生成的代码必须遵循与人类开发者编写的代码相同的治理流程和质量门槛。这体现在多个层面：
  - **分支保护规则**：可以为 Agent 创建的代码专门配置分支保护规则，例如要求必须通过特定的状态检查才能合并 2。
  - **CI/CD 门禁**：系统提供了精细化的控制，允许开发者决定何时针对 Agent 生成的代码运行持续集成（CI）检查 4。
  - **代码审查**：Agent HQ 引入了“Agent 式代码审查”功能，即由 AI Agent 在人类介入之前执行初步的代码审查 3。在审查过程中，Agent 的身份是可见的，使其行为透明化 9。

### **1.3 核心技术组件及其协同作用**

Agent HQ 的强大能力源于其多个核心技术组件的协同工作，这些组件共同构成了一个从意图定义到代码生成的完整闭环。

- **VS Code 中的“计划模式” (Plan Mode)**：在生成任何代码之前，开发者可以通过“计划模式”与 Copilot 协作，制定一个结构化的、分步骤的实施计划。在此过程中，Copilot 会主动提出澄清性问题，帮助开发者在早期阶段发现设计上的漏洞或缺失的决策点 3。这个经过深思熟虑的计划随后可以被交给 Agent，在本地或云端环境中执行 2。
- **AGENTS.md：声明式自定义 Agent 行为**：Agent 的行为可以通过一个名为 AGENTS.md 的配置文件进行声明式定义，该文件由源代码控制管理 3。团队可以在这个文件中定义项目特定的编码规范和偏好，例如“优先使用此日志记录器”或“为所有处理器使用表驱动测试”。

这种声明式的配置方式，标志着人机协作模式的演进。它将过去依赖于即时、命令式“提示工程”的交互方式，转变为一种更稳定、可复用、可版本化的“AI 配置即代码”模式。传统的 Agent 交互是短暂且个人化的，一个开发者对 Agent 的偏好设置难以与团队共享 2。而 AGENTS.md 将 Agent 的配置变成了项目级、可版本化、可审计的共享资产 3。这确保了团队中的每一位开发者以及 CI/CD 流水线中运行的 Agent，都遵循同一套在代码仓库中定义的规则。这使得 Agent 的自定义行为从个人设置提升为标准化的、可治理的软件开发生命周期的一部分，其地位类似于 eslintrc.json 或 tsconfig.json 等配置文件。

这些组件协同工作，形成了一个连贯的工作流：开发者首先使用**计划模式**清晰地定义任务意图；随后，任务被交给一个其行为受项目 AGENTS.md 文件约束和引导的 **Agent**；整个执行过程由**任务控制中心**进行编排和监控；同时，Agent 的所有操作都受到 GitHub **身份与治理**体系的严格管控。

这种架构的推出，不仅仅是发布了一项新功能，而是 GitHub 的一次战略性平台化举措。当前 AI Agent 市场呈现碎片化状态，开发者不得不在多个工具间切换，每个工具都有其独立的界面和工作流，这造成了严重的摩擦和上下文切换成本 1。Agent HQ 的“任务控制中心”通过将编排过程中心化，解决了这一痛点 1。更重要的是，通过将 Agent 与平台的核心元素（Git、PRs、Issues、Actions、Identity）深度绑定 2，GitHub 正在将其平台打造为 Agent 式开发不可或缺的基础设施。这构筑了一道强大的护城河：一个新的 AI Agent 如果想在 GitHub 的 1.8 亿开发者生态中获得成功，仅仅具备出色的编码能力已然不够，它还必须能够无缝集成到 Agent HQ 的生态系统中 1。这成功地将市场竞争的焦点从单个 Agent 的性能，转移到了平台集成的深度和广度上。

---

## **第二部分：协议层：通过模型上下文协议（MCP）统一 Agent**

要实现对来自不同供应商（如 OpenAI、Google、Anthropic）的 Agent 进行统一管理，一个标准化的通信协议至关重要。本部分将直接回应关于 Agent HQ 所采用协议的疑问，论证其选择了模型上下文协议（Model Context Protocol, MCP），并深入分析这一技术选型背后的战略考量。

### **2.1 协议选择：为何是 MCP，而非 ACP？**

对现有信息的分析明确指出，Agent HQ 及其在 VS Code 中的集成，全面采用了模型上下文协议（MCP）。相关公告反复强调，VS Code 是“唯一支持完整 MCP 规范的编辑器” 3，并且 GitHub 正在推出“GitHub MCP 注册表”（GitHub MCP Registry）以方便开发者发现和启用 MCP 服务器 3。

与此同时，所有关于 GitHub Agent HQ 的资料中均未提及由 Zed 推出的 Agent 客户端协议（Agent Client Protocol, ACP）。关于 ACP 的信息片段 14 描述的是一个由 Zed 和 JetBrains 等公司推动的、与 GitHub 生态系统相独立的标准化努力。

这一选择并非偶然，而是基于深思熟虑的战略定位。ACP 的设计初衷是标准化**编辑器（客户端）与 Agent 之间的前端交互**，聚焦于用户体验（UX）层面的元素，如在编辑器中显示差异（diff）、管理终端等 18。相比之下，MCP 是一个**后端协议**，其核心目标是标准化**Agent 如何访问外部工具和数据源** 19。GitHub 的战略核心在于掌控和构建一个围绕工具和数据的庞大生态系统，而非仅仅统一编辑器界面的交互方式。因此，选择 MCP，并将 GitHub MCP 注册表作为这个生态系统的入口，是实现其平台化战略的必然之举。

### **2.2 模型上下文协议（MCP）技术深潜**

MCP 是一个最初由 Anthropic 提出的开放协议，旨在为大型语言模型（LLM）应用（如 AI Agent）与外部数据和工具的连接提供一种标准化的方式 20。它的目标是解决所谓的“N×M”数据集成问题，即避免为每个 Agent 和每个工具都开发一个定制的连接器 20。

MCP 的通信机制借鉴了语言服务器协议（LSP）的成功经验，采用 JSON-RPC 2.0 协议，在*主机*（Host，即 LLM 应用）、_客户端_（Client，主机内的连接器）和*服务器*（Server，提供上下文和能力的服务）之间建立通信 19。

MCP 规范定义了三大核心能力：

1. **工具 (Tools)**：MCP 服务器可以向 Agent 暴露可供其执行的功能。这是让 Agent 能够执行代码生成之外的复杂操作的核心机制，例如查询数据库、调用 API 或执行计算 19。协议为工具的输入和输出定义了清晰的模式（schema），从而实现了结构化的、可靠的交互 21。
2. **资源 (Resources)**：服务器可以为模型提供其执行任务所需的上下文和数据。这些资源可以是来自 Stripe 的实时账户信息，也可以是来自 Figma 的设计组件 3。
3. **提示 (Prompts)**：服务器可以提供标准化的消息模板和工作流，以引导用户或 Agent 更高效地完成特定任务 19。

通过在 VS Code 中集成 GitHub MCP 注册表，开发者能够一键发现、安装并启用来自 Stripe、Figma、Sentry 等第三方服务的 MCP 服务器 3。这正是 Agent HQ 扩展 Agent 能力、构建开放生态系统的关键机制。

### **2.3 协议对比分析：MCP vs. ACP**

为了更清晰地阐明 GitHub 选择 MCP 的原因，下表对 MCP 和 ACP 进行了多维度的比较。

| 维度           | 模型上下文协议 (Model Context Protocol, MCP)                                          | Agent 客户端协议 (Agent Client Protocol, ACP)                                     | 战略意义分析                                                                                                           |
| :------------- | :------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **核心哲学**   | 标准化 Agent **访问外部工具和数据**的方式。一个为 Agent 能力打造的“应用商店”协议 19。 | 标准化 Agent **与代码编辑器交互**的方式。一个为编辑器 UI/UX 设计的“驱动”协议 18。 | GitHub 选择控制价值更高的后端工具生态系统，而非将编辑器接口商品化。                                                    |
| **主要用例**   | 赋能 Agent 查询 Stripe 账户、获取 Figma 设计稿或检查 Sentry 错误日志 3。              | 赋能 Agent 在编辑器中实时显示代码差异、创建终端或请求文件系统访问 18。            | Agent HQ 的核心竞争力在于 Agent 能**做什么**（由 MCP 定义），而不仅仅是它们在编辑器里**看起来怎么样**（由 ACP 定义）。 |
| **关键参与者** | 主机 (LLM 应用), 客户端 (连接器), **服务器 (工具/数据提供方)** 19。                   | **客户端 (编辑器/IDE)**, **Agent (子进程)** 18。                                  | 关注点不同：MCP 关注 Agent 与服务的连接，而 ACP 关注编辑器与 Agent 的连接。                                            |
| **核心功能**   | tools, resources, prompts。定义了函数调用和数据检索的模式 19。                        | session/update (用于 UI), fs/\* 方法, terminal/\* 方法, diff 显示 18。            | MCP 以数据为中心，ACP 以 UI 为中心。                                                                                   |
| **发起实体**   | Anthropic，并获得 OpenAI、Google 及现在的 GitHub/Microsoft 的广泛采用 20。            | Zed，并与 JetBrains 合作 23。                                                     | GitHub 选择与由所有主要 AI 实验室支持的新兴行业标准保持一致。                                                          |

GitHub MCP 注册表是整个战略的支点。MCP 协议本身只解决了工具集成的“如何做”的问题，但并未解决“如何发现和信任”的问题。GitHub MCP 注册表 3 通过在开发者最主要的工具（VS Code）内部创建一个中心化的、可信的市场，完美地解决了这个问题。这使得 GitHub 成为了生态系统的守门人。为了将自己的工具和服务带给广大的开发者，像 Stripe 和 Figma 这样的公司有强烈的动机去构建 MCP 服务器，并将其发布到 GitHub 的注册表中。未来，GitHub 甚至可以围绕该注册表引入验证、安全扫描乃至商业化模式，复制 VS Code 扩展市场或苹果应用商店的成功，从而开辟新的收入来源，并进一步巩固其平台霸主地位。

---

## **第三部分：破解状态难题：跨 Agent 的会话与任务管理**

当前 AI Agent 集成普遍存在一个核心痛点：缺乏持久化和跨平台的会话管理能力。大多数交互都是一次性的、无状态的。Agent HQ 的设计目标之一正是要解决这个问题，实现对不同 Agent 的统一会话管理。由于官方并未提供详尽的后端架构图，本部分将基于其已公布的能力和底层技术，推断其会话管理的实现架构。

### **3.1 从无状态提示到有状态工作流**

Agent HQ 的一个明确目标，是从当前普遍的“一次性提示”模式，转向“持续的、可追踪的工作流” 9。当一个任务被分配给 Agent 时，它不再是一个简单的“请求-响应”循环，而是一个持久化的会话（session），其状态可以被长时间监控和管理。

该架构的两个基本特性是异步和并行执行。Agent 可以在后台处理任务，即使用户关闭了本地计算机，任务也会继续运行 7。同时，系统支持将复杂任务分解后，并行地分配给多个 Agent 执行 2。这些能力要求其后端必须具备强大的任务调度和状态管理能力。

### **3.2 统一会话管理的推断架构**

基于“任务控制中心”作为一个“单一队列” 9 的描述，以及其跨平台（Web、VS Code、Mobile）的状态同步能力，可以推断出 Agent HQ 的后端架构包含以下几个关键部分：

- **中心化任务队列**：当用户从任何界面分配一个任务时，该任务的描述和上下文会被封装成一个作业（job），并被放入一个中心化的任务队列中。这个队列是整个编排系统的入口。
- **执行后端——GitHub Actions**：一份关键的技术文档明确指出，Agent 的运行环境是一个“由 GitHub Actions 驱动的安全环境” 7。这是解读其架构的核心线索。这意味着 Agent 任务的实际执行单元很可能是在由 GitHub Actions 基础设施管理的容器化运行器（runner）中。这一选择极具战略眼光，因为它直接复用了 GitHub 现有、成熟且高度安全的基础设施。
- **状态持久化与同步**：为了让任务状态能够在 Web、VS Code 和移动端之间实时同步，状态数据必须被中心化地持久存储。其架构很可能包含：
  1. 一个中心化的数据库（例如 Azure Cosmos DB）来存储每个 Agent 任务的状态，包括任务状态（如排队中、运行中、已完成）、实时日志、生成的代码片段等。
  2. 当一个在 Actions 容器中运行的 Agent 完成一个步骤时，它会通过 API 将最新的状态更新回这个中心存储。
  3. 各个“任务控制中心”的前端客户端通过 WebSocket 或类似的长连接技术，订阅这些状态更新，从而实现对 Agent 进展的实时展示。

基于以上推断，一个典型的会话生命周期如下：

1. **任务分配**：用户通过自然语言提示（例如，“修复 Issue \#877”）从任一界面发起一个任务 7。
2. **任务派发**：中心编排器从队列中取出任务，并启动一个 GitHub Actions 运行器来处理它。
3. **任务执行**：Agent 在安全的容器环境中开始工作。它会克隆代码仓库，根据需要运行构建、测试或静态检查，并生成代码 7。执行过程中，它可以访问在任务分配时提供的上下文信息（如 Issue 内容）。
4. **状态更新**：Agent 定期将其执行状态、日志和代码变更报告给中心状态存储。
5. **实时监控**：所有连接到任务控制中心的用户界面都会接收到实时的状态更新。
6. **任务完成**：当任务完成后，Agent 会创建一个 Pull Request，并通知（tag）用户进行审查，同时将任务标记为完成状态 7。

GitHub Actions 在这套架构中扮演了至关重要的角色。运行由 AI 生成的、可能不受信任的代码，存在巨大的安全风险。从零开始构建一个安全、可靠、多租户的沙箱环境是一项极其艰巨的工程。而 GitHub Actions 恰好就是这样一个经过全球数百万开发者实战检验的、世界级的安全执行环境 7。通过复用 Actions，GitHub 不仅免费解决了 Agent 执行环境的安全性、可扩展性和基础设施管理等一系列难题，还为希望自定义 Agent 运行环境的开发者提供了一个他们已经非常熟悉的平台 2。这使得 GitHub 在构建 Agent 编排平台方面，拥有了其他竞争者难以企及的巨大先发优势，因为它成功地将数十亿美元的基础设施投资转化为了其在 AI 时代的核心竞争力。

---

## **第四部分：构建本地编排工具的战略蓝图**

本部分将综合前文对 Agent HQ 和相关生态系统的分析，为您的最终目标——构建一个本地多 Agent 编排工具——提供一份可行的战略蓝图和技术建议。

### **4.1 本地编排的可行性与架构模式**

您的目标是高度可行的。虽然无法复制 Agent HQ 与 GitHub 平台那种深度的原生集成，但完全可以创建一个功能强大的本地“任务控制中心”，用于编排各种 Agent 的命令行工具（CLI）。

要实现这一目标，可以采用以下几种架构模式：

1. **CLI 包装器/适配器模式**：这是架构的基础层。您的工具需要为每个目标 Agent 的 CLI（如 codex-cli, claude code, gemini cli）创建一个适配器。这种方法类似于 Zed 编辑器为集成不同 Agent 所采用的策略 24。适配器的职责是将一个标准化的内部任务格式，转换为特定 Agent CLI 的命令行参数，并解析其输出（stdout, stderr, exit codes）。
2. **中心化状态管理器**：需要一个本地进程或基于文件的数据库（如 SQLite）来跟踪所有任务的状态，例如 排队中、运行中、已完成、失败 等。这是您本地版本的 Agent HQ 中心状态存储。
3. **任务调度器/队列**：一个用于管理任务执行的机制。可以是一个简单的内存队列，按顺序执行任务；也可以是一个更复杂的调度器，允许设置并发数限制，并行执行多个任务。
4. **前端用户界面**：这是您的编排器的用户界面，可以是一个 Raycast 插件、一个本地网页应用或一个终端界面（TUI）。它从状态管理器中读取数据以显示任务进度，并提供创建新任务的交互控件。

### **4.2 开源多 Agent 编排框架概览**

为了给您的本地编排工具构建“大脑”，特别是用于管理复杂的任务流和 Agent 交互，可以利用现有的开源多 Agent 编排框架。下表对几个主流框架进行了比较分析。

| 框架          | 架构范式                                                | 状态管理                                                                  | 核心优势                                                                  | 对您本地编排工具的适用性                                                                                                                                                 |
| :------------ | :------------------------------------------------------ | :------------------------------------------------------------------------ | :------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LangGraph** | 基于图的工作流（节点和边），提供显式的控制流 27。       | 设计上即为有状态。状态在一个中心对象中定义，并在节点间显式传递和更新 28。 | 非常适合处理包含分支、循环等逻辑的复杂多步任务。工作流透明，易于调试 28。 | **高度契合**。其结构化的工作流非常适合定义一个 Agent CLI 的输出（如规划步骤）成为另一个 Agent CLI 输入（如编码步骤）的流程。显式的状态管理机制与您的需求完美匹配。       |
| **AutoGen**   | 多 Agent 对话图，事件驱动的异步架构 29。                | 状态在交互 Agent 的对话上下文中进行管理 29。                              | 擅长模拟协作的 Agent 团队，通过“对话”来解决问题。高度灵活且可扩展 31。    | **适用，但可能过于复杂**。可用于模拟 Agent 间的交互，但对于编排独立的 CLI 工具而言，其对话范式可能比所需的更复杂。更适合需要 Agent 动态决定下一步操作的场景。            |
| **CrewAI**    | 基于角色的 Agent 协作，比 LangGraph 更高层次的抽象 28。 | 在一个“团队”内的 Agent 之间共享上下文和记忆 28。                          | 易于设置基于角色的工作流（如研究员、编写者）。适合快速原型开发 31。       | **适合简单工作流**。如果您的工作流是线性的、基于角色的（如“Agent 1 负责研究，Agent 2 负责编码”），这是一个很好的起点。但对于复杂的条件逻辑，其灵活性可能不如 LangGraph。 |

### **4.3 推荐设计与实施策略**

- 核心框架推荐：LangGraph  
  对于任务调度和会话管理这一核心需求，LangGraph 提供的显式、有状态的图范式是最合适的架构。它在控制力和抽象层次之间取得了很好的平衡。
- **分步实施蓝图**：
  1. **定义统一任务模式 (Schema)**：为系统中的“任务”创建一个标准的 JSON 模式。该模式应包含 task_id、prompt、target_agent（例如 "gemini"）、status、input_files、output_files 和 logs 等字段。
  2. **构建 Agent 适配器**：为您希望支持的每个 Agent CLI 创建一个 Python 类（例如 GeminiAdapter, CodexAdapter）。每个类都应包含一个 execute(task) 方法，该方法接收标准任务对象，将其作为子进程运行相应的 CLI 命令，并返回一个标准化的结果对象。
  3. **设计 LangGraph 工作流**：
     - 使用 TypedDict 定义您的 GraphState，用于存储任务列表和任何共享的上下文信息。
     - 在图中为工作流的关键阶段创建节点，例如：schedule_task（调度任务）、run_task_on_agent（在 Agent 上运行任务）、update_task_status（更新任务状态）和 handle_completion（处理完成）。
     - run_task_on_agent 节点可以作为一个条件路由器。它会根据任务中的 target_agent 字段，调用相应的适配器（例如 GeminiAdapter）。
  4. **实现状态持久化**：使用一个简单的本地数据库（如 TinyDB 或 SQLite）来持久化 GraphState。您的 LangGraph 应用在启动时从数据库加载状态，并在每一步执行后保存状态。
  5. **开发前端界面**：构建您的 Raycast 插件或 Web UI。该前端不直接运行 Agent。相反，它通过一个简单的本地 API 服务器（如 Flask/FastAPI）与您的 LangGraph 后端通信，以创建新任务并轮询状态更新。这种设计将 UI 与执行逻辑解耦，使系统更具模块化和可维护性。

通过遵循这一蓝图，您可以构建一个强大的、可扩展的本地多 Agent 编排工具，实现对多个 AI Agent CLI 的任务调度和会话管理，从而显著提升您的开发效率。

#### **Works cited**

1. GitHub launches ‘Agent HQ’ to bring AI agents from OpenAI, Google, xAI and more, accessed October 30, 2025, [https://timesofindia.indiatimes.com/technology/tech-news/github-launches-agent-hq-to-bring-ai-agents-from-openai-google-xai-and-more/articleshow/124885679.cms](https://timesofindia.indiatimes.com/technology/tech-news/github-launches-agent-hq-to-bring-ai-agents-from-openai-google-xai-and-more/articleshow/124885679.cms)
2. Introducing Agent HQ: Any agent, any way you work \- The GitHub Blog, accessed October 30, 2025, [https://github.blog/news-insights/company-news/welcome-home-agents/](https://github.blog/news-insights/company-news/welcome-home-agents/)
3. GitHub Introduces Agent HQ to Orchestrate 'Any Agent Any Way You ..., accessed October 30, 2025, [https://visualstudiomagazine.com/Articles/2025/10/28/GitHub-Introduces-Agent-HQ-to-Orchestrate-Any-Agent-Any-Way-You-Work.aspx](https://visualstudiomagazine.com/Articles/2025/10/28/GitHub-Introduces-Agent-HQ-to-Orchestrate-Any-Agent-Any-Way-You-Work.aspx)
4. GitHub unveils Agent HQ for integrated AI coding workflow \- SecurityBrief Australia, accessed October 30, 2025, [https://securitybrief.com.au/story/github-unveils-agent-hq-for-integrated-ai-coding-workflow](https://securitybrief.com.au/story/github-unveils-agent-hq-for-integrated-ai-coding-workflow)
5. Introducing Agent HQ: your mission control for AI agents \- YouTube, accessed October 30, 2025, [https://www.youtube.com/watch?v=sP-SQEE7K-Y](https://www.youtube.com/watch?v=sP-SQEE7K-Y)
6. GitHub Adds Platform for Managing AI Agents Embedded in DevOps Workflows, accessed October 30, 2025, [https://devops.com/github-adds-platform-for-managing-ai-agents-embedded-in-devops-workflows/](https://devops.com/github-adds-platform-for-managing-ai-agents-embedded-in-devops-workflows/)
7. Agents panel: Launch Copilot coding agent tasks anywhere on GitHub \- The GitHub Blog, accessed October 30, 2025, [https://github.blog/news-insights/product-news/agents-panel-launch-copilot-coding-agent-tasks-anywhere-on-github/](https://github.blog/news-insights/product-news/agents-panel-launch-copilot-coding-agent-tasks-anywhere-on-github/)
8. GitHub Universe · Recap · GitHub, accessed October 30, 2025, [https://github.com/events/universe/recap](https://github.com/events/universe/recap)
9. GitHub Launches Agent HQ For Unified AI Dev Workflows, accessed October 30, 2025, [https://www.findarticles.com/github-launches-agent-hq-for-unified-ai-dev-workflows/](https://www.findarticles.com/github-launches-agent-hq-for-unified-ai-dev-workflows/)
10. GitHub unveils Agent HQ, the next evolution of its platform that focuses on agent-based development \- SD Times, accessed October 30, 2025, [https://sdtimes.com/ai/github-unveils-agent-hq-the-next-evolution-of-its-platform-that-focuses-on-agent-based-development/](https://sdtimes.com/ai/github-unveils-agent-hq-the-next-evolution-of-its-platform-that-focuses-on-agent-based-development/)
11. GitHub Agent HQ: Unifying AI Development with Seamless Agent Integration \- 高效码农, accessed October 30, 2025, [https://www.xugj520.cn/en/archives/github-agent-hq-ai-integration.html?amp=1](https://www.xugj520.cn/en/archives/github-agent-hq-ai-integration.html?amp=1)
12. GitHub Introduces Agent HQ and Expands Copilot Subscription Features \- Binance, accessed October 30, 2025, [https://www.binance.com/en/square/post/31661687809817](https://www.binance.com/en/square/post/31661687809817)
13. GitHub Introduces Agent HQ to Orchestrate 'Any Agent Any Way You Work', accessed October 30, 2025, [https://visualstudiomagazine.com/articles/2025/10/28/github-introduces-agent-hq-to-orchestrate-any-agent-any-way-you-work.aspx](https://visualstudiomagazine.com/articles/2025/10/28/github-introduces-agent-hq-to-orchestrate-any-agent-any-way-you-work.aspx)
14. Intro to Agent Client Protocol (ACP): The Standard for AI Agent-Editor Integration | goose, accessed October 30, 2025, [https://block.github.io/goose/blog/2025/10/24/intro-to-agent-client-protocol-acp/](https://block.github.io/goose/blog/2025/10/24/intro-to-agent-client-protocol-acp/)
15. GitHub doubles down on openness as AI-powered software development takes center stage at Universe 2025 in San Francisco, accessed October 30, 2025, [https://indianexpress.com/article/technology/tech-news-technology/github-doubles-down-on-openness-as-ai-powered-software-development-takes-center-stage-at-universe-2025-in-san-francisco-10332854/](https://indianexpress.com/article/technology/tech-news-technology/github-doubles-down-on-openness-as-ai-powered-software-development-takes-center-stage-at-universe-2025-in-san-francisco-10332854/)
16. The GitHub Blog: Home, accessed October 30, 2025, [https://github.blog/](https://github.blog/)
17. Agent Client Protocol (ACP) \- Hacker News, accessed October 30, 2025, [https://news.ycombinator.com/item?id=45074147](https://news.ycombinator.com/item?id=45074147)
18. Agent Client Protocol: Introduction, accessed October 30, 2025, [https://agentclientprotocol.com/overview/introduction](https://agentclientprotocol.com/overview/introduction)
19. Specification \- Model Context Protocol, accessed October 30, 2025, [https://modelcontextprotocol.io/specification/2025-03-26](https://modelcontextprotocol.io/specification/2025-03-26)
20. Model Context Protocol \- Wikipedia, accessed October 30, 2025, [https://en.wikipedia.org/wiki/Model_Context_Protocol](https://en.wikipedia.org/wiki/Model_Context_Protocol)
21. Tools \- Model Context Protocol, accessed October 30, 2025, [https://modelcontextprotocol.io/specification/2025-06-18/server/tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)
22. Model context protocol (MCP) \- OpenAI Agents SDK, accessed October 30, 2025, [https://openai.github.io/openai-agents-python/mcp/](https://openai.github.io/openai-agents-python/mcp/)
23. JetBrains × Zed: Open Interoperability for AI Coding Agents in Your IDE, accessed October 30, 2025, [https://blog.jetbrains.com/ai/2025/10/jetbrains-zed-open-interoperability-for-ai-coding-agents-in-your-ide/](https://blog.jetbrains.com/ai/2025/10/jetbrains-zed-open-interoperability-for-ai-coding-agents-in-your-ide/)
24. Zed debuts Agent Client Protocol to connect AI coding agents to any editor | AI Native Dev, accessed October 30, 2025, [https://ainativedev.io/news/zed-debuts-agent-client-protocol-to-connect-ai-coding-agents-to-any-editor](https://ainativedev.io/news/zed-debuts-agent-client-protocol-to-connect-ai-coding-agents-to-any-editor)
25. Model Context Protocol \- GitHub, accessed October 30, 2025, [https://github.com/modelcontextprotocol](https://github.com/modelcontextprotocol)
26. GitHub unveils Agent HQ to bring AI agents from Anthropic, OpenAI and Google together, accessed October 30, 2025, [https://www.thehindu.com/sci-tech/technology/github-unveils-agent-hq-to-bring-ai-agents-from-anthropic-openai-and-google-together/article70216767.ece](https://www.thehindu.com/sci-tech/technology/github-unveils-agent-hq-to-bring-ai-agents-from-anthropic-openai-and-google-together/article70216767.ece)
27. AI Agent Orchestration Frameworks: Which One Works Best for You? \- n8n Blog, accessed October 30, 2025, [https://blog.n8n.io/ai-agent-orchestration-frameworks/](https://blog.n8n.io/ai-agent-orchestration-frameworks/)
28. Top 7 Open Source AI Agent Frameworks for Building AI Agents, accessed October 30, 2025, [https://www.adopt.ai/blog/top-7-open-source-ai-agent-frameworks-for-building-ai-agents](https://www.adopt.ai/blog/top-7-open-source-ai-agent-frameworks-for-building-ai-agents)
29. AutoGen vs LangChain: Comparison for LLM Applications, accessed October 30, 2025, [https://blog.promptlayer.com/autogen-vs-langchain/](https://blog.promptlayer.com/autogen-vs-langchain/)
30. AutoGen vs LangChain in 2025: Which Is Better for AI Agent Apps? \- Kanerika, accessed October 30, 2025, [https://kanerika.com/blogs/autogen-vs-langchain/](https://kanerika.com/blogs/autogen-vs-langchain/)
31. Comparing Open-Source AI Agent Frameworks \- Langfuse Blog, accessed October 30, 2025, [https://langfuse.com/blog/2025-03-19-ai-agent-comparison](https://langfuse.com/blog/2025-03-19-ai-agent-comparison)
32. Autogen vs LangChain vs CrewAI: Our AI Engineers' Ultimate Comparison Guide, accessed October 30, 2025, [https://www.instinctools.com/blog/autogen-vs-langchain-vs-crewai/](https://www.instinctools.com/blog/autogen-vs-langchain-vs-crewai/)
