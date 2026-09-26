# DeepSeek Harness 接入记录

本页是 DSH 上游跟进的唯一流程入口，同时记录每次升级的结论。规则摘要见 [AGENTS.md](../AGENTS.md#上游跟进)。

## 跟进机制

### 原则

1. **依赖，不 fork。** 通过 npm 精确锁定 `@deepseek-ai/dsh*`，所有 `@deepseek-ai/*` 包使用同一版本号；不修改上游源码。本地 DSH 克隆只用于阅读源码和查证，不参与构建。
2. **只跟发布，不追提交。** 上游 master 日均数百提交，只评估 npm / GitHub Release 发布。默认跟 `next`（rc）渠道；`alpha` 只在需要某个具体修复或能力时评估。
3. **稳定线与升级线分开。** `main` 始终锁定已验证版本；升级在 `upgrade/dsh-<版本>` 分支完成，验证全部通过后才合并。
4. **只用文档化扩展点。** 插件、preset、profile overlay、Client slot、SDK；依赖内部实现时必须登记到下方「本地补丁」表。
5. **上游有的就用上游。** 上游发布了与本产品重叠的通用能力，优先迁移过去并删除自有实现，把精力留给上游不会做的部分（自进化闭环、账号化个人经验）。

### 发现

- 每日定时：`node engineering/scripts/upstream-watch.mjs install` 安装 macOS launchd 任务，每天 09:30 运行检查（错过时在唤醒后补跑），发现新版本发系统通知。`status` 查看、`uninstall` 移除。
- 任务开始：Agent 运行 `node engineering/scripts/check-upstream.mjs --max-age 12h`，12 小时内复用缓存结果。
- 结果保存在 `.local/upstream/last-check.json`（不入库），日志在 `.local/upstream/launchd.log`。

### 评估（发现新版本后）

阅读从当前锁定版本到目标版本的 Release 说明，逐项回答并写入下方「升级记录」：

| 检查项 | 为什么 |
| --- | --- |
| Session 格式版本是否变化 | 升级会单向迁移账号内会话数据，旧版本无法再读取 |
| 已用扩展点、Client slot、preset/profile 字段是否变化 | 决定插件和编译逻辑需要改什么 |
| 「本地补丁」对应问题是否已修复 | 能删的补丁优先删 |
| 是否出现与本产品功能重叠的新能力 | 适用原则 5 |
| 是否有安全修复 | 安全修复提高升级优先级 |

### 升级验证（`upgrade/dsh-<版本>` 分支）

1. 退出应用，备份账号数据目录（见[桌面 README](apps/desktop/README.md#本地数据和恢复)）。
2. 将 `engineering/apps/desktop/package.json` 中全部 `@deepseek-ai/*` 改为同一目标版本，`npm install` 更新锁文件。
3. 复核「本地补丁」表：构建和隔离启动会自动应用补丁，版本或代码锚点不符时停止；先判断补丁是否仍需要，再更新或删除。
4. `npm test`、`npm run typecheck`、`npm run build`。
5. `npm run dev:host` + `npm run verify:host`（隔离账号，不调用付费模型）；重启 `dev:host` 后再跑 `npm run verify:restart`，确认版本、默认与旧会话在重启后保持。
6. 用真实模型跑一次最小任务，覆盖对话、工具调用、审批和模式发布。
7. 打包，在副本账号上启动，确认旧会话可读（`npm run verify:restart`）。打包时用 `--config.directories.output` 指定新目录，不覆盖正在使用的 `dist/mac-arm64`。
8. 更新本页「当前锁定」与「升级记录」，合并后打 `checkpoint/dsh-<版本>` 标签。

任一步失败：保留分支，记录失败原因与阻塞项，`main` 不变。

### 本地补丁

| 补丁 | 原因 | 上游跟进 | 每次升级 |
| --- | --- | --- | --- |
| `apps/desktop/scripts/brand-upstream.mjs` | 上游 Client 未开放首页标语 slot | 0.1.7-rc.2 仍未开放，待提交上游 issue/PR（TASK-033） | 升级时更新版本检查并确认两处文案仍可替换；0.1.7-rc.2 已复核 |

已删除：`apps/desktop/scripts/patch-creator.mjs` 与 `plugin/inspect-leases.mjs`（多个创造 preset 重复注册 Host 检查 provider），上游 #4742 在 0.1.7 修复，随 [迭代 019](../iterations/019-dsh-017-migration.md) 删除。

### 依赖的上游接口

以下不是补丁，而是产品依赖的公开接口；升级时逐项复核。

| 接口 | 用途 |
| --- | --- |
| `agentPresets.register(definition)` / 返回的 disposer | 注册模式版本；产品持有 disposer |
| `agentPresets.readDocument(id)` | 读取官方 preset 的插件行，作为版本定义的基础 |
| `agentPresets.resolve(id)`、`defaultId`、`composedPreset(ctx)` | 激活诊断、账号默认、识别会话所用版本 |
| `settings.update('agent-preset-registry', {selectedDefault})` | 写账号默认 |
| `sessionController.create/inspect/list/rename/prompt`、`workspaceController.create` | 检查会话、试跑会话、观测 |
| `tool/result` 事件的 `message.isError` | 统计工具失败 |
| `settings.yaml` 旧 `agent-presets.default` 段 | 仅用于从 alpha.5 迁移默认模式；DSH 启动后把该文件改名为 `settings.yaml.imported` |

### 升级记录

| 日期 | 从 → 到 | 结论 | 记录 |
| --- | --- | --- | --- |
| 2026-09-20 | — → 0.1.6-alpha.2 | 首次接入 | [迭代 008](../iterations/008-desktop-alpha.md) |
| 2026-09-25 | 0.1.6-alpha.2 → 0.1.7-rc.2 | 已评估，**有破坏性变化**，升级需重构模式发布；计划见[迭代 018](../iterations/018-harness-p1-plan.md) | [评估](#017-rc2-评估2026-09-25) |
| 2026-09-26 | 0.1.6-alpha.2 → 0.1.7-rc.2 | **已升级**：模式发布改为运行时注册，alpha.5 版本迁移，删除 `patch-creator`；隔离账号验证通过，真实账号待迁移；真实模型最小任务未执行 | [迭代 019](../iterations/019-dsh-017-migration.md) |

## 0.1.7-rc.2 评估（2026-09-25）

依据：本地上游克隆中 `dsh-v0.1.6-alpha.2..dsh-v0.1.7-rc.2` 的源码与迁移说明，只读核查，未构建运行。

| 检查项 | 结论 |
| --- | --- |
| Session 格式 | v3 → v4（`docs/persistence-changes/2026-09-16-session-format-v4.md`）。打开时自动迁移，写入 `session.v4.jsonl` 并保留 v3 文件；v3 读取器拒绝 v4，**升级对用户会话数据是单向的**。工具结果改为 `role: 'tool'` 消息，错误标记移到 `message.isError` |
| 所用扩展点 | **破坏性**：`agent-presets` 包被删除（#4569），由 `agent-preset-registry` 与 `agent-preset` 取代；preset 改为在 profile YAML 中声明或运行时 `agentPresets.register(definition)` 注册，不再扫描目录。产品依赖的 `copy`、`resolve().path`、`remove` 已移除；`settings.get` 已移除，默认 preset 设置改为 `agent-preset-registry.selectedDefault`，`modeSelectionEnabled` 取消 |
| preset 版本 | 注册表的修订只在内存中；重启后按 preset id 解析，缺失的 id 会被拒绝。产品必须自己持久化每个版本定义，并在启动时、会话恢复前重新注册 |
| 本地补丁 | 创造模式重复注册已由 #4742 修复；首页标语 slot 仍未开放 |
| 重叠能力 | 运行时 `register()` 可直接作为模式发布和按需组合的实现基础；`sessionController.projections` 提供 token、上下文占用与构成等投影，可用于观测与上下文可视；`compositionInventory()` 可用于实际装配视图 |
| 仍缺的能力 | 创建会话时仍不能指定模型与权限；没有按步骤返回完整模型请求的公开接口 |
| 安全修复 | 本次未发现需要紧急升级的安全修复 |

未验证项已在[迭代 019](../iterations/019-dsh-017-migration.md#技术验证结论)核实：四个内置 preset 实际工具数为标准 26、PTC 26、极简 1、创造 29；产品注册时把 `baseUrl` 设为应用内插件位置，打包应用中子插件包名和创造 Skill 路径都能解析；官方选择器会列出全部已注册版本（与 alpha.5 相同，待第 2 步处理）；构建后两处首页标语替换仍生效。

## 当前源码参考

- 上游仓库：[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)。
- 本地参考位置：上游仓库本地克隆（本产品仓库位于其 `custom-projects/dsh-product/`），分支 `master`。
- 拉取日期：2026-09-20；同步本次获取的 `origin/master`，没有推送。
- 当前提交：`ddefc45fbc7f8e46dd73185e68295696d1297887`。
- 精确标签：`dsh-v0.1.6-alpha.2`。
- 2026-09-25 另行获取标签 `dsh-v0.1.7-rc.2`；本地 HEAD 未移动，0.1.7 源码用 `git show dsh-v0.1.7-rc.2:<path>` 只读查阅。
- 提交日期：2026-09-17 21:19:19 +08:00。
- 原参考提交：`b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`，标签 `dsh-v0.1.1-rc.2`，首次记录于 2026-09-10。

（历史记录）此次获取远端与标签后，以 fast-forward 和 autostash 更新，前进 4,912 个提交。更新前保留了本地 HEAD、AGENTS.md 和未提交差异；更新后个人知识库区块仍保留，父仓库唯一已跟踪的本地修改仍为 AGENTS.md 的 27 行追加。备份位于 `custom-projects/.backups/`：`upstream-head-before-update-20260920.txt`、`upstream-AGENTS-before-update-20260920.md`、`upstream-local-before-update-20260920.patch`。

上述标签是本次拉取结果，不表示生产稳定版，也不是本产品已验证的依赖。产品独立仓库及 Demo 不属于这次上游快进范围。

## 界面与接入证据

以下链接固定到本次提交，避免上游继续变化后证据漂移。

| 来源 | 核查结论 |
| --- | --- |
| [Desktop README](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/apps/desktop/README.md) | 已有 Electron 桌面壳，包装完整 Web 应用，受管理 Host 子进程与打包流程可复用 |
| [Client 包目录](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/client/README.md) | 已有输入、会话、审批、预览、产物、插件管理等 GUI 插件 |
| [Connection](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/client/connection/README.md)、[API 装配](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/api/remotes/README.md) | 当前 GUI 使用 Typert Remote；旧 apiproxy 路径已移除；新业务接口需要显式装配 |
| [Schedule](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/schedule/schedule/README.md)、[重复规则](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/subsystems/schedule.md) | 持久化会话提醒，冷会话不执行，重复间隔至少 300 秒，无日历重复规则 |
| [TypeScript SDK](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/sdk/client/README.md) | stdio 通道仍缺少中途取消、服务端交互请求，不适合作为完整桌面主通道 |
| [会话格式](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/session-format-status.md) | 该提交时 Session 格式为 V3；0.1.7 起为 V4（单向迁移），升级与代码回退须考虑数据兼容性 |

## 当前锁定

`@deepseek-ai/dsh@0.1.7-rc.2` 与 `@deepseek-ai/dsh-mcp-client@0.1.7-rc.2`（2026-09-26 起，[迭代 019](../iterations/019-dsh-017-migration.md)），依赖树由 `apps/desktop/package-lock.json` 固定。正式 0.1.7 发布后再升级并复验。

## 接入状态

桌面预览版接入 npm 发布包 `@deepseek-ai/dsh` 与同版本 MCP Client，版本见上方“当前锁定”。没有修改上游源码；产品壳、Host/Client 插件与启动补丁由独立产品仓库维护。

Electron 固定 43.2.0，Node 固定 24.19.0 并随包分发。DSH 的原生加载器不支持该 Electron 小版本内嵌 Node，因此内核使用独立 Node 子进程。已验证包内启动和 Harness 装配，真实模型及完整任务验收待配置密钥后进行，见[迭代 008](../iterations/008-desktop-alpha.md)。

后续升级必须记录前后版本、保存数据备份，验证启动、插件加载、流式任务、审批、提问、取消及恢复。
