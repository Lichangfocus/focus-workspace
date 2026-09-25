# AGENTS.md · Focus Workspace 开发范式

本仓库是基于 DeepSeek Harness（DSH）的开源个人 Agent 产品，公开托管于 GitHub `Lichangfocus/focus-workspace`，许可证 Apache-2.0。本文是所有 Agent 与贡献者的工作规范；与其他文档冲突时以本文为准，并同步修正冲突文档。

## 开始每个任务

1. 读 [README](README.md)、[产品大纲](product/outline.md)（含功能清单）、相关的[功能设计](product/features/README.md)和[待办](iterations/backlog.md)。
2. 运行 `node engineering/scripts/check-upstream.mjs --max-age 12h`。有新版本时在回复中报告一次：当前锁定、最新版本、是否已有对应升级任务；不在当前任务中顺带升级。
3. 判断任务类型：方案、工程、上游升级、维护；按下文对应流程执行。

## 方案先行：产品与工程的关联

**先确定产品方案，再写代码。** 链路固定为：

```text
产品大纲 outline.md  →  功能 ID  →  功能设计 features/  →  用户确认 approval.md  →  迭代文档 iterations/NNN  →  工程 engineering/  →  验证证据  →  功能状态更新
```

- **产品大纲**（`product/outline.md`）是第一层：定位、用户、支柱、分期和**功能清单**。功能清单是功能 ID、阶段与状态的唯一来源；新增功能先在这里分配 ID，状态只能凭真实证据推进（待细化 → 待对齐 → 可开发 → 开发中 → 待验收 → 已验收）。
- **功能设计**（`product/features/`，按[写法规范](product/features/README.md#写法规范)）是第二层：每个模块一份，定义用户操作、规则、数据、实现约束与验收；不重复维护阶段和状态。可见行为、数据归属、权限及交付范围的改变，先改设计并获得用户确认。
- **确认记录**（`product/approval.md`）写明确认日期、用户原话摘要、获准范围和待定事项。没有确认记录的范围不开始正式编程，包括脚手架、依赖和工程实验。研究、方案编辑、任务整理和对齐 Demo 不受此限。
- **迭代文档**（`iterations/NNN-主题.md`，按[模板](iterations/template.md)）每轮只定一个可观察的交付结果，列出关联的功能 ID 与 TASK 编号、实际执行的验证和剩余问题。`CHAT-01`、`HARNESS-04.1` 类为产品功能，`TASK-001` 类为执行任务，不混用。
- **工程变更**必须能追溯到功能 ID：分支名和提交说明带 TASK 编号，迭代文档链接到代码位置。方案与实现不一致时，先改文档再改代码。
- **Demo**（`demo/`）只用于对齐样式和主要交互，模拟行为必须标识；Demo 通过不能作为功能验收证据。
- 未验证的产品假设明确标为待验证；不得把目录占位、模拟响应或插件加载当作产品闭环完成。

## 工程原则

- **优先复用 DSH。** 通过配置、插件、preset、profile overlay 和应用入口定制；执行循环、模型接入、工具与会话日志复用上游。需要改上游行为时先记录具体缺口与维护成本，优先向上游提 issue/PR。
- **三类数据分开管理与恢复**：应用代码（Git）、Harness/模式配置（应用内版本）、账号数据（数据目录备份）。遵循[版本与恢复约定](iterations/versioning.md)。
- **固定依赖。** 依赖精确版本并提交锁文件；环境变量用无密钥的 `.env.example` 说明。
- **可复制的验证。** 每个工程目录提供启动和验证命令；报告只写实际执行过的命令和结果。桌面工程验证命令见[桌面 README](engineering/apps/desktop/README.md#开发和验证)，脚本测试为 `node --test engineering/tests/*.test.mjs`。

## 上游跟进

DSH 是快速迭代的开源项目。完整流程与升级记录见[上游接入记录](engineering/upstream.md#跟进机制)，规则摘要：

1. **依赖，不 fork**：npm 精确锁定 `@deepseek-ai/dsh*` 且各包同版本，不修改上游源码。
2. **只跟发布**：评估 npm / GitHub Release，默认跟 `next`（rc）渠道，不追 master 提交。
3. **稳定线与升级线分开**：`main` 锁定已验证版本；升级只在 `upgrade/dsh-<版本>` 分支，按升级验证清单全部通过后合并。
4. **每次升级先评估**：Session 格式是否变化（单向迁移）、所用扩展点是否变化、本地补丁是否可删除、是否出现与本产品重叠的上游能力。
5. **补丁登记**：依赖上游内部实现或打补丁时，必须登记到 `engineering/upstream.md` 的「本地补丁」表并注明上游跟进方式；目标是持续减少补丁。
6. **上游有的就用上游**：上游提供了重叠的通用能力，优先迁移并删除自有实现。
7. **发现机制**：每日 launchd 定时检查（`node engineering/scripts/upstream-watch.mjs install|status`）加每个任务开始时的检查。

## Git 与 GitHub

- 远端 `origin` 为公开仓库。`main` 只接收已验证的变更；功能在 `feat/TASK-NNN-简述`，升级在 `upgrade/dsh-<版本>`，文档可直接提交到 `main`。
- 提交说明使用 Conventional Commits（`feat:`、`fix:`、`docs:`、`chore:`、`test:`），一个提交围绕一个可解释的变更，并注明关联 TASK 或功能 ID。
- 推送前运行与变更相关的验证。已推送的历史用补充提交或 `git revert` 修正，不重写 `main`，不强制推送。
- **公开仓库卫生**：不提交凭证、真实会话、用户数据、真实姓名等个人信息、第三方版权截图、本机绝对路径和构建产物（`dist/`、`.local/`、`node_modules/`）。截图和示例数据使用示例账号。
- 只在本仓库目录执行本项目的 Git 操作；外层 DSH 克隆是上游参考，不提交产品内容。
