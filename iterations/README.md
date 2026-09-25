# 迭代管理

[功能清单](../product/outline.md)管理功能范围与交付阶段，[待办清单](backlog.md)记录执行任务；每轮复制[迭代模板](template.md)，以 `001-主题.md` 递增命名。每轮围绕一个可验收结果，关联产品依据、工程变更和验证证据。

任务状态统一为：待办、进行中、阻塞、完成。完成必须满足该项验收标准；阻塞时记录所缺信息或条件。

## 迭代记录

| 编号 | 目标 | 状态 |
| --- | --- | --- |
| [000](000-bootstrap.md) | 建立独立项目与基础目录 | 完成 |
| [001](001-product-plan.md) | 确认个人 Agent 工作台方案与开发范围 | 等待用户确认 |
| [002](002-demo.md) | 按方向 3 制作本地交互 Demo | 实现及验证完成，待用户审阅 |
| [005](005-upstream-architecture.md) | 更新上游并研究桌面架构 | 源码核查与技术草案完成，未开始正式工程 |
| [006](006-conversation-first.md) | 功能分区与初次分期 | 历史方案修订 6，第一期范围由 007 更新 |
| [011](011-integrated-proposal.md) | 整合产品功能与技术架构为单一审阅方案 | 修订 9 完成，待用户确认后开发 |
| [010](010-dual-goals-evolution.md) | 方便使用与自进化双目标、MVP 底层设计 | 修订 8 文档完成，新增能力未开发 |
| [009](009-focus-brand.md) | Focus Workspace 品牌更新 | 名称与 slogan 已更新，字体待确认 |
| [008](008-desktop-alpha.md) | 可独立启动的桌面预览版 | Alpha.1 已实现，完整 P1 验收进行中 |
| [007](007-conversation-harness.md) | 第一期对话与 Harness 管理 | 修订 7 已更新，具体交互待 Demo 对齐 |
| [012](012-model-catalog.md) | 模型目录对齐官方 | alpha.3 交付 |
| [013](013-harness-compositions.md) | 多套 Harness 设计与模型显示 | 设计由 014/015 落地；alpha.4 交付 |
| [014](014-mode-design.md) | 统一“模式”概念 | 设计完成，由 015 实现 |
| [015](015-mode-editor.md) | 模式编辑与受控改进 | alpha.5 交付并完成真实样例验收 |
| [016](016-open-source-and-upstream.md) | 开源发布与上游跟进机制 | 完成 |
| [017](017-outline-revision-13.md) | 产品大纲修订 13 与文档分层 | 定位已确认，新增项待确认 |

插件补充见[004 首页快捷方式与定时任务小组件](004-home-widgets.md)。

上一轮首页调整见[003 首页功能定义](003-home-definition.md)，其方案更新不表示旧 Demo 已同步。

应用开发遵循[方案确认记录](../product/approval.md)，代码、配置与数据恢复遵循[版本约定](versioning.md)。

[待办清单](backlog.md)记录任务状态，各迭代文档保存目标与验收结论。仓库已公开托管于 GitHub，规则见 [AGENTS.md](../AGENTS.md)。
