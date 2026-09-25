# Focus Workspace

**think different**

这是一个开源的个人 Agent 项目：基于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）框架，打造最好用的、面向超级用户的个人 Agent 产品。

Focus Workspace 有两个核心目标：

1. **好用**：对话就能开展工作，方便地引用资料、调用工具、查看成果、继续修改和人工接管。
2. **持续进化**：真实工作产生反馈，Agent 把反馈变成可验证、可采用、可回退的能力改进；个人经验属于你的账号和工作区，而不是写死在产品里。

> 状态：**0.1.0-alpha.5 桌面预览版**（macOS Apple Silicon，未签名）。尚未完成 v0.1 验收，接口与数据格式可能变化。

## 已有能力

| 能力 | 说明 |
| --- | --- |
| 对话与任务 | 基于 DSH 官方界面的真实对话、会话历史、工作区与文件引用、工具审批和成果查看 |
| 模式管理 | 标准、PTC、极简、创造四种内置模式，可新建、复制和定制；每个模式独立草稿、表单/JSON 编辑、发布、版本回退和恢复原版；旧会话始终绑定原版本 |
| 能力装配 | 按模式装配 Tools、导入 Skills、配置本地 stdio MCP，区分已配置、已加载和实际调用 |
| 运行观测 | 查看某次会话实际使用的模式版本、模型 ID、工具结果和结束原因 |
| 受控自进化 | 记录反馈 → Agent 生成配置候选 → 独立试跑 → 人工对照证据 → 采用发布 → 可回退；不自动采用 |

规划中的能力（首页插件桌面、定时任务小组件、知识库、Agent 协同等）及分期见[功能清单](product/features.md)。

## 快速开始（从源码运行）

要求：macOS Apple Silicon、Node.js 24.19.0、一个 DeepSeek API Key。

```sh
git clone https://github.com/Lichangfocus/focus-workspace.git
cd focus-workspace/engineering/apps/desktop
npm ci
node scripts/bundle-runtime.mjs
npm start
```

首次启动后在应用设置中填入 API Key（只保存在本机账号目录），添加工作区即可开始对话。打包、隔离验证和数据备份见[桌面应用说明](engineering/apps/desktop/README.md)。

## 架构

```text
Electron 桌面壳 ──启动/关闭──▶ 包内独立 Node ──▶ DSH（官方 web profile）
       │                                         ├─ 模型、会话日志、Tools、Skills、MCP、Subagent、审批
       └─ 界面：DSH 官方 Client + 产品插件 ◀──────▶ └─ 产品 Host 插件：模式版本、反馈、候选、验证、采用与回退
```

执行循环、工具与模型接入全部复用 DSH，不修改上游源码；产品能力通过 DSH 插件与 preset 实现。详见[产品方案 · 技术架构](product/brief.md#五技术架构以-dsh-执行以产品管理经验与改进)。

## 跟进 DSH 上游

DSH 迭代很快。本项目通过 npm 精确锁定 DSH 版本，只跟官方发布，在独立的升级分支验证后再合并；每天自动检查一次上游新版本。流程见[上游接入记录](engineering/upstream.md#跟进机制)。

## 项目结构

```text
product/       产品方案（brief.md 为入口）、功能清单与专题设计
iterations/    迭代计划、待办与验收记录
engineering/   工程实现：apps/desktop 桌面应用、scripts 工程脚本、tests 测试、upstream.md 上游记录
demo/          早期对齐用交互 Demo 与设计稿（历史参考）
AGENTS.md      Agent 与贡献者的开发范式
```

## 参与开发

本项目采用"方案先行"的开发范式：产品方案 → 功能 ID → 确认 → 迭代 → 工程 → 验证证据。开始前请阅读 [AGENTS.md](AGENTS.md)。Issue 与 PR 模板位于 `.github/`。

## 许可证

[Apache License 2.0](LICENSE)。本项目依赖并随包分发 DeepSeek Harness（MIT License），见 [NOTICE](NOTICE)。
