# Focus Workspace 桌面预览版

版本 `0.1.0-alpha.6`，适用于 macOS Apple Silicon。本地 Electron 应用启动包内 Node 24.19.0 和官方 DSH 0.1.7-rc.2，复用真实对话界面，通过独立插件增加 Harness 管理。无需云账号，首个本地账号自动建立。

## 打开与使用

打开构建出的 `Focus Workspace.app`。首次启动可能需要数十秒初始化。**alpha.6 首次打开账号时会把会话单向迁移到 DSH 0.1.7 的格式，打开前先按下文备份账号数据目录。**应用内进入设置，添加自己的 DeepSeek API Key；密钥只在应用中输入，不发到聊天或写进项目。随后添加工作区，新建会话。桌面包自带 Node，不要求安装开发工具；外部 MCP 命令所依赖的程序仍需由用户安装。

左侧 Harness → 选择标准、PTC、极简、创造，或新建/复制模式。编辑页提供表单和高级 JSON，支持附加指令、工具呈现、工具组、Skill 和 MCP。保存草稿 → 检查并发布，只改变该模式；“设为默认”单独操作。“以此模式开始对话”会创建绑定该发布版本的真实会话，模型继续在对话选择器中配置。历史会话不自动升级。

运行观测 → 加载检查，查看该模式当前发布版本的真实能力；选择会话可读取它自己的实际模型与工具结果。每模式可开启受控自进化：记录来源反馈 → 生成建议对话 → 导入配置 JSON 候选 → 打开候选试跑 → 记录基准/候选证据 → 采用到草稿 → 发布。建议生成真实调用用户配置的模型；基准和候选会话均须已有模型回复才能记录验证。对照质量由用户判断，不伪装成自动评测。

版本与恢复 → 比较已保存草稿、恢复历史或内置原版并填写原因。模式卡片是逻辑模式，官方新会话模式选择器仍列出每个已注册的底层版本（DSH 默认开启“编程工具”设置时可见）；按逻辑模式合并后续补齐。默认 Skill 目录遵循 DSH 动态加载规则，只有明确导入的 Skill 会在发布时复制冻结。

工具停用控制本配置提供给 Agent 的能力，不等于操作系统级权限撤销；例如保留终端时仍能通过命令访问文件。系统权限和工具审批沿用官方 DSH 设置。

## 本版范围与限制

已接入真实对话、会话历史、工作区、文件引用、工具审批及成果界面；这些通用交互复用官方 Client。已验证桌面独立启动、实际插件/工具清单、Skill 导入发现、MCP 工具发现、配置版本切换、失败保留与手动回退。隔离验收不调用付费模型；桌面使用已配置模型完成基准回答、Agent 建议生成、候选对照、采用发布和回退的真实样例。Skill 参与复杂任务、MCP 经模型调用、审批/停止/成果完整链路仍待专项验收。

MCP 首版只提供 stdio 的命令与参数配置，尚无 HTTP/OAuth 或凭证字段；需要授权的服务使用其已有本地登录方式。展示工具发现数量，不将发现工具当作健康检查或调用成功。Subagent 首版提供内置组启停与插件明细，完整职责/模型/能力详情后续补齐。已实现配置差异和附加指令；每模式固定模型、权限编辑、完整指令关系图及账号迁移仍后置。加载失败的新目录会清理，错误记录保留。

这是本地预览包，尚未签名、公证或完成 v0.1 验收，没有自动更新和云同步。保留官方上游版权、协议及依赖文件；分发前另行检查签名、公证与第三方许可。

## 本地数据和恢复

### alpha.6 的数据变化（DSH 0.1.7）

- 会话：DSH 打开旧会话时在 `session.v3.jsonl.zstd` 旁写入 `session.v4.jsonl.zstd`。迁移是单向的，alpha.5 读不了 v4。
- 模式版本：每个版本保存为账号内 `workbench/presets/<presetId>.json`，冻结的 Skill 副本在 `workbench/skills/<presetId>/`；启动时全部重新注册。首次启动把 `.agent-presets/wb-*` 目录转换为定义并保留原 id，原目录保留不删；结果记录在 `workbench/migrations.json`。
- 默认模式：写在 profile 的 `agent-preset-registry.selectedDefault`；旧 `settings.yaml` 由 DSH 改名为 `settings.yaml.imported`，其中的默认模式由产品迁移一次。
- 回退到 alpha.5：退出应用，把升级前的整目录备份放回原位，再打开 alpha.5；只换应用不恢复数据时，看不到升级后产生的内容，默认模式回到标准。

产品已更名为 Focus Workspace，slogan 为 `think different`；界面字体仍沿用原设置，待用户确认。为继续读取原账号，默认数据位于 `~/Library/Application Support/DSH Workbench/`。`accounts/local/account.json` 是账号 ID，DSH 会话、模型设置与装配位于该账号目录；`workspace/` 为默认检查工作区，用户选择的外部工作目录不会被复制。浏览器偏好位于 `browser/`。应用菜单可打开数据目录。

备份前退出应用，复制整个数据目录到受控位置；备份可能包含凭证，不放入 Git 或公开分享。恢复时退出应用，先另存当前目录，再将备份放回原路径，使用相同应用版本。alpha.6 起 Skill 快照在版本定义中保存为账号内相对路径；alpha.5 版本迁移时引用的原账号外路径保持原样；整目录迁移到其他位置仍未专项验收；恢复不会撤销外部文件修改。测试账号与正式账号隔离，测试数据不进入安装包。

## 开发和验证

在本目录、macOS arm64 的 Node 24.19.0 环境下执行：

```sh
npm ci
node scripts/bundle-runtime.mjs
npm start
npm test
npm run typecheck
npm run package
```

Electron 43.2.0、DSH 0.1.7-rc.2 均精确锁定。`package.json` 的 `"workspaces": []` 让 electron-builder 以本目录为 npm 项目，不把外层上游克隆识别为 pnpm 工作区。`npm run package` 默认输出到 `dist/mac-arm64/`，会覆盖同位置的应用；保留旧包时加 `-- --config.directories.output=dist/<目录>`。npm 11.17 的 allow-scripts 默认不运行依赖安装脚本，全新 `npm ci` 后需要确认 `node_modules/electron/dist` 存在。首次依赖安装需下载 Electron 官方发行包。本次使用本机官方缓存并核对 npm 包附带 SHA-256；`runtime/manifest.json` 保存构建用 Node 版本及校验值。打包使用独立 Node，避免 DSH 原生加载器对 Electron 特定 V8 小版本的限制。

集成验证使用两个终端，均在本目录执行：

```sh
npm run dev:host
npm run verify:host
# 重启 dev:host 后：版本、默认与旧会话在重启后保持
EXPECT_DEFAULT=<presetId> npm run verify:restart
```

验证默认只操作 `.local/test-account`，创建测试会话、Skill 和 MCP 服务，不调用外部模型。`WORKBENCH_TEST_HOME` 指定 `dev:host` 的测试账号（建议再用一个应用目录以外的临时目录，排除上层 `node_modules` 碰巧可解析的情况）；`DSH_WORKBENCH_HOME` 指定桌面应用的数据目录。`verify:restart` 通过官方 Remote 接口检查所有模式版本已注册、按记录的版本重新打开全部会话。迁移验证先把账号目录打包备份。产品实现和验收状态见 [迭代 008](../../../iterations/008-desktop-alpha.md)；完整需求仍以 [功能清单](../../../product/outline.md) 为准。

品牌变更见[迭代 009](../../../iterations/009-focus-brand.md)。构建脚本对固定版上游 Client 的两种语言首页标语进行可重复替换；DSH 当前只开放图标 slot，未开放 headline slot，升级时需复核该适配。其他品牌显示通过产品插件完成，不修改父级上游源码。

## 模型目录（2026-09-23）

模型选择器直接显示“DeepSeek-V4.1-Flash · deepseek-flash”及“DeepSeek-V4-Pro · deepseek-v4-pro（兼容 → V4.1-Flash）”；前者是名称，后者是实际请求 model ID，原有选择不变。按[官方公告](https://api-docs.deepseek.com/news/news260910/)，旧 Pro 当前已转接 Flash；不再将其标注为能力更强的独立型号。目录由 `plugin/model-catalog.mjs` 经启动 overlay 提供，开发与桌面入口共用；不改动用户密钥、端点、模型 ID 或已有会话。用户若在 DSH 设置中显式自定义 models，仍按上游设置优先级覆盖产品默认目录。

本版模式基于四个官方 preset 的插件行编译，不改上游循环；独立草稿与版本列表保存在账号 `workbench/state.json`（schema 2），版本定义见上文。升级先备份 schema 1，再保留旧 presetId 迁移为独立模式。回退应用到 alpha.4 时先退出两版应用，另存当前 state.json，再恢复 `workbench/state.schema1.backup.json` 或升级前检查点中的 state.before-alpha5.json；不会撤销期间产生的文件与会话。

实际验证记录与本地检查点见[迭代 015](../../../iterations/015-mode-editor.md)。

迁移到 DSH 0.1.7 的实现与验证见[迭代 019](../../../iterations/019-dsh-017-migration.md)。alpha.5 的多创造模式兼容补丁已随上游修复删除。
