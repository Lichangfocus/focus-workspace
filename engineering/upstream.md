# DeepSeek Harness 接入记录

## 当前源码参考

- 上游仓库：[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)。
- 本地参考位置：上游仓库本地克隆（本产品仓库位于其 `custom-projects/dsh-product/`），分支 `master`。
- 拉取日期：2026-09-20；同步本次获取的 `origin/master`，没有推送。
- 当前提交：`ddefc45fbc7f8e46dd73185e68295696d1297887`。
- 精确标签：`dsh-v0.1.6-alpha.2`。
- 提交日期：2026-09-17 21:19:19 +08:00。
- 原参考提交：`b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`，标签 `dsh-v0.1.1-rc.2`，首次记录于 2026-09-10。

此次获取远端与标签后，以 fast-forward 和 autostash 更新，前进 4,912 个提交。更新前保留了本地 HEAD、AGENTS.md 和未提交差异；更新后个人知识库区块仍保留，父仓库唯一已跟踪的本地修改仍为 AGENTS.md 的 27 行追加。备份位于 `custom-projects/.backups/`：`upstream-head-before-update-20260920.txt`、`upstream-AGENTS-before-update-20260920.md`、`upstream-local-before-update-20260920.patch`。

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
| [会话格式](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/session-format-status.md) | 当前 Session 格式 V3，升级与代码回退须考虑数据兼容性 |

## 接入状态

桌面预览版已接入 npm 正式发布包 `@deepseek-ai/dsh@0.1.6-alpha.2` 与同版本 MCP Client，依赖树由 `apps/desktop/package-lock.json` 固定。没有修改上游源码；产品壳、Host/Client 插件与启动补丁由独立产品仓库维护。

Electron 固定 43.2.0，Node 固定 24.19.0 并随包分发。DSH 的原生加载器不支持该 Electron 小版本内嵌 Node，因此内核使用独立 Node 子进程。已验证包内启动和 Harness 装配，真实模型及完整任务验收待配置密钥后进行，见[迭代 008](../iterations/008-desktop-alpha.md)。

后续升级必须记录前后版本、保存数据备份，验证启动、插件加载、流式任务、审批、提问、取消及恢复。

## alpha.5 兼容补丁

固定版 `dsh-tool-cordis@0.1.6-alpha.2` 在多创造 preset 并存时重复注册 Host 检查 provider。`scripts/patch-creator.mjs` 在构建和隔离 Host 启动时应用精确版本补丁，公共 provider 使用 Host 引用计数，工具保持 scoped；实现位于 `plugin/inspect-leases.mjs`，生命周期及失败回滚有独立测试。没有修改父仓库源码；升级依赖需审阅此补丁。
