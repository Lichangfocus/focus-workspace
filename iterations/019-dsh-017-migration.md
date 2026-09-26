# 019 · 迁移到 DSH 0.1.7-rc.2

日期：2026-09-26。状态：隔离账号验证通过，已合并 `main`；真实账号尚未迁移。

## 目标

Focus Workspace 运行在 DSH 0.1.7-rc.2 上，模式发布改为运行时注册；alpha.5 及更早创建的模式版本和旧会话在新版本上可以继续打开，两个模式互不影响，旧会话仍绑定原版本。

## 依据与范围

- 关联功能 ID：HARNESS-04.1～04.3（[模式管理](../product/features/harness-modes.md#功能项与进度)）、APP-01（[账号、数据与设置](../product/features/account-data.md)）。
- 关联 TASK：TASK-030（升级 DSH 至 0.1.7）、TASK-033（本地补丁上游化，本轮删除 `patch-creator`）。
- 计划与确认：[迭代 018](018-harness-p1-plan.md) 第 1 步；[确认记录 2026-09-25](../product/approval.md#harness-p1-开发计划2026-09-25)。
- 上游评估：[0.1.7-rc.2 评估](../engineering/upstream.md#017-rc2-评估2026-09-25)。
- 分支：`upgrade/dsh-0.1.7-rc.2`。

本轮不改变可见的产品行为、数据归属和权限；只替换发布与加载方式，并迁移账号内已有的版本数据。应用版本号改为 0.1.0-alpha.6，用来区分会话格式不同的两个构建。

## 任务

| 任务 | 代码位置 | 状态 |
| --- | --- | --- |
| 依赖统一改为 `0.1.7-rc.2` 并更新锁文件 | `engineering/apps/desktop/package.json`、`package-lock.json` | 完成 |
| 版本定义改为插件行数组，基础行读取 `agentPresets.readDocument(kind)`，`!!js` 转为 `{__jsExpr}` | `plugin/config.mjs`（`parseRows`、`composePlugins`、`withSkillRoots`） | 完成 |
| 版本定义保存到账号存储，冻结的 Skill 副本放入产品存储 | `plugin/presets.mjs`（`presetStore`） | 完成 |
| 发布调用 `register()`，一直持有 disposer；失败时注销并删除定义 | `plugin/host.mjs`（`register`、`build`） | 完成 |
| 启动时在会话恢复前注册全部已保存版本 | `plugin/host.mjs`（`apply`） | 完成 |
| 迁移 alpha.5（含 alpha.1 时期）的 `$DSH_HOME/.agent-presets/wb-*` 目录，保留 preset id | `plugin/presets.mjs`（`migrateLegacyDirectories`） | 完成 |
| 默认模式改读 `agentPresets.defaultId`，写 `settings.update('agent-preset-registry',{selectedDefault})`；迁移旧 `settings.yaml` 里的默认 | `plugin/host.mjs` | 完成 |
| 观测改用 `message.isError` | `plugin/host.mjs`（`observeSession`） | 完成 |
| 删除 `scripts/patch-creator.mjs`、`plugin/inspect-leases.mjs` | — | 完成 |
| `brand-upstream.mjs` 版本检查改为 0.1.7-rc.2，并确认两处标语替换生效 | `scripts/brand-upstream.mjs` | 完成 |
| 新增重启与迁移验证脚本 | `scripts/verify-restart.mjs`（`npm run verify:restart`） | 完成 |
| 打包时避开外层 pnpm 工作区识别 | `package.json` 的 `"workspaces": []` | 完成 |

## 实现要点

- **定义归账号所有。** 每个版本保存为 `workbench/presets/<presetId>.json`，只写一次（`wx`），字段为 id、名称、类型、创建时的 DSH 版本、来源（`published` 或 `migrated-alpha5`）、插件行和 Skill 根目录。Skill 根目录保存为相对 `workbench/` 的路径，注册时再拼成绝对路径，因此不再把本机绝对路径写进版本定义。
- **注册表只在内存里。** 启动时读取全部定义并逐个 `register()`；单个定义损坏或被拒绝时记入 `startupErrors`，Harness 页顶部显示，其他版本照常可用。
- **包名按应用解析。** 注册时用 `ctx.extend({baseUrl: import.meta.url})`，子插件包名和创造模式里 `createRequire(baseUrl)` 的表达式都从应用安装目录解析，与账号目录位置无关。
- **加载检查前移。** 发布时先看注册表的 `broken`，MCP 启动失败等激活错误不再创建检查会话。
- **默认值写入时机。** `settings.update` 要等 Loader 完成加载，而 Loader 要等本插件返回；在插件初始化里直接写会互相等待（第一次迁移时实际卡住）。旧默认的迁移和中断恢复因此作为串行队列的第一项，在 Loader 完成后执行，排在所有管理操作之前。
- **创造模式的内置 Skill。** alpha.5 的创造版本通过“相对 preset 目录”的表达式引用复制进目录的 0.1.6 创造 Skill。迁移时改为 0.1.7 包自带的创造 Skill：这些 Skill 说明的是当前运行时的配置方式，旧版内容讲的是已删除的目录 preset。用户导入的 Skill 仍按原内容冻结。
- **工作区路径。** 检查会话和打开会话统一用工作区的真实路径（`realpath`），避免 `/var` 与 `/private/var` 这类软链接造成“会话不属于该工作区”。

## 技术验证结论

| 待验证项 | 结论 |
| --- | --- |
| `register()` 在打包应用里能否按调用方 `baseUrl` 解析子插件包名 | 可以。在应用目录以外的临时账号、以及打包产物（路径含空格）中，四类版本全部激活；自定义创造版本发现 3 个创造 Skill，自定义标准版本发现导入的 Skill 和 MCP 工具 |
| 大量 `wb-*` preset 出现在官方选择器中的体验 | 与 alpha.5 相同，每个版本都会列出。0.1.7 默认开启“编程工具”设置，此时新会话模式选择器可见；迁移的 alpha.5 验证账号共 25 项（4 个内置 + 21 个版本）。上游没有隐藏或分组字段。暂可接受，作为第 2 步的遗留问题 |

## 验收标准

- alpha.5 原有的 `npm test`、`npm run typecheck`、`npm run build`、`npm run dev:host` 加 `npm run verify:host` 在 0.1.7 上全部通过。
- alpha.5 创建的旧会话能重新打开，并绑定原来的版本。
- 两个模式各自独立，旧会话仍绑定原版本；重启后版本与账号默认保持不变。

## 验证记录

以下全部在隔离账号上执行，不调用付费模型。真实账号 `~/Library/Application Support/DSH Workbench/` 没有被读取内容或修改；只核对过它仍是 schema 2、`settings.yaml` 未被改名。

1. `npm test`：13 项通过。覆盖四类基础行的编译和平台条件保留、基础行不被修改、极简补能力、创造的插件管理开关、Skill 根目录拼接、非法配置、schema 迁移、候选冲突、`isError` 观测、原子写入、版本定义只写一次与越界路径拒绝、alpha.5/alpha.1 目录迁移（保留 id、搬移 Skill、换用新创造 Skill、原目录不动）。
2. `npm run typecheck`：通过。
3. `npm run build`：通过，Client 中英文两处标语均为 `think different`。
4. `npm run dev:host` + `npm run verify:host`，三个账号分别通过全部 13 项：
   - 应用目录以外的新账号（`WORKBENCH_TEST_HOME` 指向系统临时目录）；
   - alpha.5 验证账号 `.local/modes-alpha5`（先打包备份为 `.local/modes-alpha5.before-017.tar.gz` 及 SHA-256）；
   - 默认账号 `.local/test-account`（alpha.1 时期的 schema 1 数据，先备份为 `.local/test-account.before-017.tar.gz`）。

   四个内置模式工具数：标准 26、PTC 26、极简 1、创造 29。
5. `npm run verify:restart`（重启 `dev:host` 后执行，`EXPECT_DEFAULT` 指定期望的默认版本）：
   - 新账号：6 个版本已注册，默认保持，7 个会话都按原版本打开；
   - alpha.5 账号首次启动：迁移 21 个目录，21 个版本全部注册且可用，旧 `settings.yaml` 中的默认 `wb-…433adea0` 保留，40 个旧会话全部打开（其中 21 个与产品记录的版本逐一比对），每个会话在 `session.v3.jsonl.zstd` 旁边生成 `session.v4.jsonl.zstd`；
   - 同一账号跑完 `verify:host` 再重启：27 个版本、47 个会话全部通过比对；
   - `.local/test-account`：7 个旧目录迁移，schema 1 转 schema 2，默认保留，6 个会话通过；跑完 `verify:host` 再重启后 10 个版本、16 个会话通过。
6. 打包：`npm run package` 第一次失败，electron-builder 把外层上游克隆识别为 pnpm 工作区，而本机没有 pnpm。加上 `"workspaces": []` 后，改用 `npx electron-builder --mac dir --arm64 --config.directories.output=…` 构建成功，产物放在 `dist/alpha6-dsh017/`。
7. 打包产物的 Host（包内 Node + 包内插件），跑在临时目录里的 alpha.5 备份副本上：`verify:restart` 通过（21 个版本、40 个会话、默认保留）；恢复到迁移来的自定义创造版本后发现 3 个创造 Skill、28 个工具。
8. 打包后的 Electron 应用用 `DSH_WORKBENCH_HOME` 指向新的临时目录启动：Host 和产品插件完成初始化（生成 `workbench/state.json` 与 `migrations.json`），发送 SIGTERM 后正常退出。没有做窗口内的手动操作。

未执行：升级清单第 6 步（真实模型最小任务，会产生费用）；真实账号的迁移。

## 数据迁移说明

- **单向。** 0.1.7 打开旧会话时写入 `session.v4.jsonl.zstd`，保留 v3 文件；alpha.5 应用读不了 v4。已经在 alpha.6 上继续产生的内容，回到 alpha.5 后看不到。
- **产品数据。** alpha.6 新增 `workbench/presets/`、`workbench/skills/`、`workbench/migrations.json`；原 `.agent-presets/` 目录不修改、不删除。DSH 把 `settings.yaml` 改名为 `settings.yaml.imported`，默认模式改存在 profile 的 `agent-preset-registry.selectedDefault`。
- **回退。** 回到 alpha.5 前，先退出应用，再用升级前的整目录备份恢复账号。只替换应用不恢复数据时，alpha.5 仍能读 v3 文件和 `.agent-presets/`，但看不到升级后的新内容和新版本，且旧 `settings.yaml` 已被改名，默认模式会回到标准。

## 结论与后续

第 1 步的工程目标已在隔离账号上达成，`main` 锁定 DSH 0.1.7-rc.2。遗留问题：

1. **真实账号迁移待用户决定。** 真实账号有 4 个 `wb-*` 版本、10 个 v3 会话。迁移前需要用户同意，并先整目录备份。
2. **`dist/mac-arm64` 被打包覆盖过。** 第一次 `npm run package` 覆盖了原来的 alpha.5 应用包。已从 `main` 上的 alpha.5 源码重新打包，放回 `dist/mac-arm64/`，另存一份在 `dist/alpha5-rollback/`；alpha.6 放在 `dist/alpha6-dsh017/`。今后打包要指定 `directories.output`，避免覆盖正在使用的应用。
3. **官方选择器列出全部版本。** 见技术验证结论，留到第 2 步处理。
4. **每个版本启动时都会激活。** 包括带 MCP 的历史版本（会启动 MCP 进程）。验证账号启动时间约 3～4 秒；版本多了需要改为只注册仍被引用的版本，或者向上游请求“延迟激活”。
5. **失败发布留下的检查会话。** MCP 没有发现工具这类检查，发生在检查会话创建之后；版本定义已删除，这个会话重启后打不开。
6. **全新克隆的安装脚本。** 在 npm 11.17 上执行 `npm ci`，由于 allow-scripts 限制不会运行 electron 等包的安装脚本，Electron 发行包需要另行准备；`allowScripts` 策略待定。
7. **rc 版本。** 正式 0.1.7 发布后需要再升级一次并复验。
