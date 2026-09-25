# Focus Workspace

**Focus Workspace 的核心目标有两个：做一个自己使用方便的 Agent 助手，以及基于 DSH 框架特性打造一个能持续自进化的 Agent。** slogan 为 **think different**。真实工作产生反馈，Agent 将反馈转成可验证、可采用、可回退的能力改进；个人经验属于账号和工作区。

[完整产品方案（修订 12）](product/brief.md)统一说明产品功能、关键交互、MVP 范围、技术架构、数据关系、开发顺序及验收。用户已授权本次修订 12 模式管理开发；专题文件保留为实施细节。

当前交付为 **Focus Workspace 0.1.0-alpha.5 桌面预览版**，基于方案修订 12，聚焦对话与可编辑模式管理。用户已明确授权开发，记录见[确认记录](product/approval.md)。[使用说明](engineering/apps/desktop/README.md)提供应用路径、启动方式和本版限制，[迭代 015](iterations/015-mode-editor.md)记录本次实际验证。

[完整方案](product/brief.md)保留长期功能，[功能清单](product/features.md)管理分期。旧 [demo-0.1.0](demo/README.md)是历史对齐稿；本版桌面应用按修订 12 实施范围交付，尚未完成全部 P1 验收，不宣称 v0.1 正式完成。真实模型改进样例已跑通，复杂任务和完整人工控制链路仍待专项验收。

## 项目目录

```text
dsh-product/
├── product/                 # 产品方案、需求与验证依据
│   └── brief.md             # 产品定义入口
├── iterations/              # 迭代计划、待办与验收记录
│   ├── backlog.md           # 待办清单
│   ├── 000-bootstrap.md     # 项目初始化记录
│   └── template.md          # 后续迭代模板
├── demo/                    # 对齐用前端、方向稿与验证截图
│   └── app/                 # React + Vite 本地 Demo
├── engineering/             # 工程实现
│   ├── harness/             # Harness 组合与配置
│   ├── plugins/             # 自定义能力插件
│   ├── apps/                # 产品应用入口
│   ├── tests/               # 集成与端到端验证
│   ├── scripts/             # 开发、检查和部署脚本
│   └── upstream.md         # 上游基线与接入状态
├── .github/                 # Issue 与 Pull Request 模板
├── AGENTS.md                # 本项目的 Agent 协作约定
└── .gitignore
```

从[产品定义](product/brief.md)确定首个使用场景，再从[迭代入口](iterations/README.md)安排验证和工程实现。[工程入口](engineering/README.md)说明各目录职责。

配套文档：[页面与交互](product/experience.md)、[账号与数据](product/data-ownership.md)、[工程接入建议](engineering/architecture-proposal.md)、[版本与恢复](iterations/versioning.md)。

[方案与 Demo 对应表](product/demo-map.md)通过功能编号连接完整需求、演示链路及正式验收。

## 本地版本管理

本目录已初始化独立 Git 仓库，默认分支为 `main`；作者信息待补，当前尚无提交历史。父级 DSH 仓库已在本地排除 `custom-projects/`。所有项目 Git 命令都在本目录执行。

v0.1 完成前仅在本地维护代码、产品文档、迭代记录和备份。GitHub 上传由用户在 v0.1 之后决定，不自动创建远端或推送。本地 Git 提交无需 GitHub 账号。

首次提交前配置自己的 Git 身份；如已配置，可跳过前两条：

```sh
git config user.name "你的名字"
git config user.email "你的本地提交邮箱"
git add .
git commit -m "chore: initialize product workspace"
```

当前任务状态以[本地待办清单](iterations/backlog.md)为准，迭代目标与验收写入对应文档。已有 GitHub Issue 和 PR 模板留待后续使用；本地检查点及恢复规则见[版本约定](iterations/versioning.md)。

模型目录已按 2026-09-23 官方信息更新，见[迭代 012](iterations/012-model-catalog.md)；这是用户单独授权的局部维护，不代表整合方案整体确认。

[模式编辑器](product/mode-editor.md)已实现四种 DSH 类型的独立草稿、表单/JSON 编辑、发布与恢复，并将运行观测和受控进化放进各模式。桌面验收与剩余范围见[迭代 015](iterations/015-mode-editor.md)。历史 Demo 保留，当前主要交互以真实桌面版对齐。
