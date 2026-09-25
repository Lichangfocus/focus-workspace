# 008 · DSH Workbench 桌面 alpha.1

日期：2026-09-20。依据：方案修订 7、用户“基于这个开发一个版本的桌面端”的明确授权。目标：交付 macOS Apple Silicon 可运行桌面版本，对话复用 DSH，提供 Tool/Skill/MCP 管理与真实装配视图。版本 `0.1.0-alpha.1`，不等于全部 P1 或正式 v0.1 验收通过。

## 交付

源码与锁文件：`engineering/apps/desktop/`。应用：`engineering/apps/desktop/dist/mac-arm64/DSH Workbench.app`。[使用说明](../engineering/apps/desktop/README.md)说明模型配置、管理操作、构建与限制。无 GitHub 远端或推送。

采用 Electron 43.2.0 + 包内 Node 24.19.0 + 官方 DSH 0.1.6-alpha.2。独立壳管理生命周期及本地账号目录；官方 Web Client 承担对话与设置；产品 Host/Client 插件承担真实清单、草稿、不可变配置版本和回退。DSH 插件架构保持完整，不修改上游执行循环。

每次应用从上游标准 preset 创建独立版本，复制已启用 Skill，实际加载并发现 MCP 工具后才切换新对话默认。旧会话保留原 preset。失败候选不会成为默认。检查会话和测试账号分别可追溯。

## 实际验证

| 验证 | 结果 |
| --- | --- |
| `npm test` | 4 项通过：配置组合保留 YAML JS 标签、不影响无关项、MCP 配置与非法输入、原子保存及串行队列错误恢复 |
| `npm run typecheck` | 通过，Client 严格类型检查 |
| `npm run build` | 通过，Client 使用上游共享 React 模块 |
| `npm run dev:host` + `npm run verify:host` | 在隔离账号实际启动官方 profile；文件/终端/网页/Subagent 装配开关、Skill 发现、真实 stdio MCP 工具发现、两版切换、回退、非法 Skill 应用失败保留旧版本、无鉴权访问拒绝通过 |
| `npm run package` | 构建 macOS arm64 `.app`，运行时与生产依赖已包含 |
| 原生 UI | 独立 `.app` 打开对话首页与 Harness 页；点击检查后看到 26 个实际工具、137 个 Host 插件及各模块加载状态；不是模拟列表 |

Electron 43.2.0 内嵌 Node 被 DSH 原生加载器明确拒绝，已改为随包附带独立 Node。还修复了 Electron 模块初始化等待就绪的启动阻塞，以及 Subagent 装配组映射。最终包保留标准原生标题栏，避免窗口按钮与侧栏重叠。

## 功能对应与未完成验收

- APP-01、ACCOUNT-01.1：桌面启动与首个本地账号已实现；安装包未签名、公证或跨机器验证。
- HOME-01.1、CHAT-01/02、TASK-01.1/2、ARTIFACT-01.1、SETTINGS-01：官方真实 Client/Host 已接入，尚未取得 API Key，未完成真实模型任务、审批/停止/失败继续及成果修改验收。
- CAP-01.1/2：Skill 本地目录导入、版本复制、启停，以及 MCP stdio 配置、加载与工具发现已验证。Skill 真正参与模型任务和 MCP 由模型调用仍待验收；HTTP/OAuth/凭证编辑暂未实现。
- CAP-01.3.1、CAP-03：内置能力组启停与实际工具清单已实现。Subagent 的完整职责、模型详情与每工具权限详情尚待补齐。
- CAP-02.1、HARNESS-02.2：草稿、实际加载后应用、历史版本和回退已验证；配置差异预览和回退后的真实模型任务未验收。
- HARNESS-01：当前 preset、Host/Agent 插件状态、工具及 Skill 实际数量已实现。图示表示固定执行结构，不表示完整依赖图；模型、系统指令、权限的详细关系视图未完成。
- ACCOUNT-02.1：已提供退出后同路径备份恢复步骤；跨路径数据迁移和完整账号恢复仍未验收，不把源码归档恢复当作用户数据恢复。

## 版本保存

开发前归档：`custom-projects/.backups/dsh-product-before-desktop-dev-20260920.tar.gz`。交付源码归档：同目录 `dsh-product-desktop-alpha1-20260920.tar.gz`，包含产品文档、Demo、工程源码和依赖锁文件，排除 node_modules、dist、.local、运行时二进制与 .git；附 SHA-256。应用包单独位于 dist。归档恢复到独立临时目录比较后再采用，不覆盖当前工作。

产品 Git 已初始化，但作者姓名/邮箱尚未提供，本次仍无 Git 提交，不将归档表述为 Git 历史。待作者信息后保存首次提交及标签；上传 GitHub 继续等待用户明确指令。
