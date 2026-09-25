# 功能设计

产品文档分两层：[产品大纲](../outline.md)负责思路、定位和功能清单（功能 ID、阶段、状态），本目录每份文档负责一个功能模块的具体设计。在大纲里调整方向和功能清单，在这里持续细化每个功能怎么做。

## 文档索引

| 支柱 | 设计文档 | 覆盖的功能 ID |
| --- | --- | --- |
| 一、灵活且自进化的 Harness | [模式管理与按需组合](harness-modes.md) | HARNESS-04.x、HARNESS-05 |
| | [能力装配与现状](harness-capabilities.md) | HARNESS-01、HARNESS-02.2、HARNESS-06、CAP-* |
| | [自进化](self-evolution.md) | HARNESS-02.1、EVOLVE-* |
| | [模式编辑器 alpha.5 实施规格](harness-mode-editor.md) | HARNESS-04.1～04.3、EVOLVE-01～04 的已交付范围 |
| | [DSH 内置模式说明](harness-builtin-modes.md) | 参考资料 |
| 二、工作台式任务管理 | [对话与任务](conversation.md) | HOME-01.1、CHAT-*、TASK-01.x、ARTIFACT-01.1 |
| | [工作台](workbench.md) | HOME-01.2、HOME-02～08、ARTIFACT-01.2 |
| 三、主动性 AI | [主动性 AI](proactive.md) | PROACTIVE-*、HOME-06/07 |
| 四、强大的系统连接 | [系统连接](connections.md) | CAP-01.2、CONNECT-* |
| 五、构建自身的知识库 | [知识库](knowledge.md) | KNOW-* |
| 六、网络与生态 | [网络与生态](network.md) | COLLAB-*、NET-01、MARKET-01、CLOUD-01 |
| 基础 | [账号、数据与设置](account-data.md) | APP-01、ACCOUNT-*、SETTINGS-01 |

## 写法规范

每份功能设计文档：

1. 标题下第一行是所属信息：`> 所属：产品大纲 · 支柱 · 功能 ID · 阶段与状态以大纲功能清单为准`。
2. 正文按需包含：目标（解决什么问题）、用户操作与结果、规则与边界、数据与状态、实现约束（依赖哪些 DSH 能力、有哪些待工程验证项）、验收、待确认。
3. 功能的阶段和状态只写在大纲功能清单里，本目录不重复维护，避免两处不一致。
4. 新功能先在大纲分配 ID，再在对应文档写设计；一个模块变大时拆成新文档并更新本索引。
5. 尚未确认的设计标注“草案，待对齐”；用户确认后在[确认记录](../approval.md)登记，才能进入工程。
6. 历史修订说明保留在文档内，但当前行为写在前面；过时内容直接改写，不叠加“修订 N 补充”。
