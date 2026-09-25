# 009 · Focus Workspace 品牌更新

用户确认产品名 **Focus Workspace**、slogan **think different**，并要求字体先确认。对应 APP-01、HOME-01.1 与 HARNESS-01 的显示内容，功能范围保持 P1。版本 `0.1.0-alpha.2`。

应用包、菜单、窗口标题、启动页和侧栏统一名称，对话首页及 Harness 顶部使用指定 slogan，首页品牌图标与侧栏一致。字体家族未改动，等待用户选择。

为了继续使用既有账号，保留 `DSH Workbench` 本地数据目录、应用 ID、内部插件标识和环境变量；内部名称不作为显示品牌。无数据迁移。产品方案、确认记录和 Demo 对应表已更新，旧 Demo 和 alpha.1 迭代记录保留历史。

上游提供品牌图标 slot，但 headline 没有独立 slot。构建脚本对固定 DSH 0.1.6-alpha.2 Client 的中英文 headline 进行可重复替换，并验证版本和替换数量；不更改父仓库源码。升级依赖必须重新核对。Sidebar 与 Hero 图标使用正常插件 slot 注册。

验证：Client 类型检查和桌面打包通过。原生 UI 已确认新窗口与菜单显示 Focus Workspace，侧栏完整显示名称，对话首页和 Harness 均显示 think different，字号布局无截断。当前功能验收仍见[008](008-desktop-alpha.md)，本次不新增模型任务验收结果。

修改前归档：`custom-projects/.backups/dsh-product-before-focus-brand-20260920.tar.gz`。修改后：同目录 `focus-workspace-alpha2-20260920.tar.gz`，附 SHA-256，排除依赖目录、构建产物、运行数据和二进制。Git 作者信息待补，仍未创建提交或上传 GitHub。
