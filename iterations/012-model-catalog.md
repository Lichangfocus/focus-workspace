# 012 · DeepSeek 模型目录更新

关联 SETTINGS-01。用户授权对齐最新模型列表；开发前已更新产品方案和确认记录。官方 2026-09-10 公告确认 `deepseek-flash` 对应 V4.1-Flash，`deepseek-v4-pro` 自 2026-09-14 起转接同一模型，直到后续 Pro 发布。

将名称修正为 DeepSeek-V4.1-Flash，为旧 Pro 标注兼容转接。通过产品 profile overlay 提供模型目录，保留模型 ID 和原有能力参数，不修改 DSH 依赖源码、不修改用户凭证。桌面与开发入口共用目录；目标版本 0.1.0-alpha.3。

变更前源码归档：`custom-projects/.backups/focus-workspace-before-models-20260923.tar.gz`。实际验证及完成检查点在交付后补充。

## 交付与验证

已交付 alpha.3，DSH 依赖仍为 0.1.6-alpha.2。执行 `npm run build`、`npm run typecheck`、`npm run package -- --config.directories.output=dist/model-update` 均通过；另用固定版 DeepSeek adapter 的 `resolveAdapterOptions` 验证产品目录可解析且保持两个原始 ID。原生桌面启动后展开模型菜单，确认两个新名称均出现，原先 Pro 选择及已有会话列表保留。本轮未发送模型请求，不将目录验证视为模型任务验收。

当前应用仍位于 `engineering/apps/desktop/dist/mac-arm64/Focus Workspace.app`；旧 alpha.2 包保留在 `custom-projects/.backups/focus-workspace-alpha2-20260923/Focus Workspace.app`。完成源码归档为 `custom-projects/.backups/focus-workspace-models-alpha3-20260923.tar.gz`，附 SHA-256。恢复先在独立目录解压并比较；切换旧包前退出当前应用，保留当前包，不覆盖用户数据。当前仍未建立 Git 提交，也未推送 GitHub。

## 模式和 Harness 的核实结果

本包提供 standard、ptc、minimal、cordis 四种 preset，分别对应标准、PTC、极简、创造模式。它们改变 Agent 的指令、工具、工具呈现和上下文处理；模型选择与权限模式分别管理。创造模式包含运行时检查与插件管理能力，但不等于产品已实现反馈、评测、采用与回退的自进化闭环。

Harness 页读取新会话默认 preset，现有自定义版本均从 standard 复制。切换单个会话模式不会让该页自动追踪那个会话；已有会话保留自己的 preset。更新前读取 standard 的运行实例，显示 26 个可调用工具、0 个 Skill、136 个 active Host 插件及 0 个装配异常。中间箭头图是结构示意，实际插件清单和工具发现来自运行时；未提供完整模型/指令/权限关系与任务跟踪。
