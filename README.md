# Focus Workspace

**think different**

这是一个开源的个人 Agent 项目：基于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）框架，打造最好用的、面向超级用户的个人 Agent 产品。

**面向谁**：不是职业开发者、但借助 AI 已经具备开发能力的高级知识工作者。

**核心亮点**：**自进化** 与 **可控可见**。看得见 Agent 如何工作，才能控制它；控制得住每一次改变，才能放心让它进化。

| 产品支柱 | 说明 |
| --- | --- |
| 灵活且自进化的 Harness | 按需组合模型、指令、Tools、Skills、MCP 与 Subagent；看清每次任务实际用了什么；纠正变成可验证、可回退的改进 |
| 工作台式任务管理 | 任务、成果和资料在一个工作台里组织与继续 |
| 主动性 AI | 按计划和事件主动执行、提醒、提出建议 |
| 强大的系统连接 | 真实操作电脑、浏览器、常用服务与数据 |
| 构建自身的知识库 | 资料与经验沉淀为属于你的、可检索可引用的知识 |
| 在网络中交友、在生态中成长 | Agent 之间授权协作；模式与 Skill 在 DSH 生态中分享与获得 |

第一阶段先做第一个支柱：一个强大的 Harness 底座。这也是选择 DSH 的原因——它是全插件架构，执行循环、工具、会话日志都可以组合与观测。

> 状态：**0.1.0-alpha.5 桌面预览版**（macOS Apple Silicon，未签名）。尚未完成 v0.1 验收，接口与数据格式可能变化。

## 已有能力

| 能力 | 说明 |
| --- | --- |
| 对话与任务 | 基于 DSH 官方界面的真实对话、会话历史、工作区与文件引用、工具审批和成果查看 |
| 模式管理 | 标准、PTC、极简、创造四种内置模式，可新建、复制和定制；每个模式独立草稿、表单/JSON 编辑、发布、版本回退和恢复原版；旧会话始终绑定原版本 |
| 能力装配 | 按模式装配 Tools、导入 Skills、配置本地 stdio MCP，区分已配置、已加载和实际调用 |
| 运行观测 | 查看某次会话实际使用的模式版本、模型 ID、工具结果和结束原因 |
| 受控自进化 | 记录反馈 → Agent 生成配置候选 → 独立试跑 → 人工对照证据 → 采用发布 → 可回退；不自动采用 |

规划中的能力（首页插件桌面、定时任务小组件、知识库、Agent 协同等）及进度见[产品大纲](product/outline.md)。

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

执行循环、工具与模型接入全部复用 DSH，不修改上游源码；产品能力通过 DSH 插件与 preset 实现。详见[技术架构](engineering/architecture.md)。

## 跟进 DSH 上游

DSH 迭代很快。本项目通过 npm 精确锁定 DSH 版本，只跟官方发布，在独立的升级分支验证后再合并；每天自动检查一次上游新版本。流程见[上游接入记录](engineering/upstream.md#跟进机制)。

## 项目结构

```text
product/       产品文档：outline.md 大纲（定位、支柱、模块进度、分期）+ features/ 功能设计（功能项与细节）
iterations/    迭代计划、待办与验收记录
engineering/   工程实现：apps/desktop 桌面应用、scripts 工程脚本、tests 测试、upstream.md 上游记录
demo/          早期对齐用交互 Demo 与设计稿（历史参考）
AGENTS.md      Agent 与贡献者的开发范式
```

## 参与开发

本项目采用"方案先行"的开发范式：产品方案 → 功能 ID → 确认 → 迭代 → 工程 → 验证证据。开始前请阅读 [AGENTS.md](AGENTS.md)。Issue 与 PR 模板位于 `.github/`。

## 许可证

[Apache License 2.0](LICENSE)。本项目依赖并随包分发 DeepSeek Harness（MIT License），见 [NOTICE](NOTICE)。
