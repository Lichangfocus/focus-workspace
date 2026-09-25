# 版本与恢复约定

## 开发流程

正式产品方案与 Demo 确认并更新后，建立对应版本检查点，再启动正式工程。用户单独授权的对齐 Demo 可提前制作，代码与资源保存在 demo/，其版本不等于正式产品发布。main 保留已验收结果，迭代使用 codex/002-desktop-kernel 等分支。草案可以提交，提交不等于用户批准。

一次提交围绕一个可解释的变更，关联迭代、方案及实际验证。阶段验收保留 checkpoint/002-kernel 等标签，可用发布使用 v0.1.0 等版本，锁定依赖并保留构建包和发布清单。

已共享历史用补充提交或 git revert 修正，不默认重写 main，不使用 hard reset 清理用户变更。查看旧版本先保存当前工作，再在独立目录检出检查点。

## 三种恢复

| 对象 | 恢复方式 | 限制 |
| --- | --- | --- |
| 代码和文档 | Git 提交、标签及独立检出 | 不包含凭证、用户资料或数据库 |
| Harness 配置 | 保存版本及任务绑定，选旧版本用于新任务 | 不改变已执行任务或撤销外部动作 |
| 账号及知识 | 迁移前一致性备份，校验后在独立目录恢复 | 须兼容应用及数据格式，凭证可能需重新授权 |

没有可用备份时不继续数据迁移。每个可用版本至少演练一次恢复，核对账号、会话、成果索引、知识和配置，证据写入迭代记录。

## Git 与 GitHub（2026-09-25 起）

首次 Git 提交于 2026-09-25 完成，提交身份为 GitHub 账号 `Lichangfocus` 的 noreply 邮箱。用户同日明确要求推送并开源，仓库为公开的 `Lichangfocus/focus-workspace`，许可证 Apache-2.0；此前“v0.1 后再上传”的安排作废。分支、提交与公开仓库卫生规则见 [AGENTS.md](../AGENTS.md#git-与-github)。

公开前已从首次提交中移除真实姓名、第三方截图和本机绝对路径；原始截图仅保留在本地 `custom-projects/.backups/`。以下 2026-09-11 至 09-23 的检查点是 Git 之前的本地归档，只存在于作者本机，作为历史恢复点保留。

## Demo 0.1.0 检查点（2026-09-16）

- 编程前：`custom-projects/.backups/dsh-product-before-demo-build-20260916.tar.gz`。
- 本轮完成：`custom-projects/.backups/dsh-product-demo-0.1.0-20260916.tar.gz`，同目录 `.tar.gz.sha256` 文件保存校验值。
- 完成归档包括方案、Demo 源码、锁文件、视觉稿、截图及迭代记录；排除 node_modules、dist 和 .git。依赖可在恢复后用 npm ci 重建。浏览器演示状态不包含在源码归档中，可用“重置演示”恢复内置样例。
- 已将归档解压到临时独立目录，核对关键源码、产品方案及锁文件一致，避免直接覆盖当前目录。
- 当前仍无 Git 提交，未配置远端；不把归档称为 Git 历史。取得作者身份后再补首次提交和标签。

## 首页方案修订 4 检查点（2026-09-16）

修改前归档：`custom-projects/.backups/dsh-product-before-home-revision4-20260916.tar.gz`。修改后归档：同目录 `dsh-product-home-revision4-20260916.tar.gz`，配套 `.sha256` 文件记录校验值。归档排除 node_modules、dist 和 .git；Demo 源码未变。恢复时先解压到独立目录再比较，不覆盖现有工作。

## 首页方案修订 5 检查点（2026-09-16）

变更前参考修订 4 归档。补充后归档：`custom-projects/.backups/dsh-product-home-revision5-20260916.tar.gz`，同目录 `.tar.gz.sha256` 文件保存校验值。归档排除 node_modules、dist 和 .git；本轮仅补充文档，应用源码保持不变。恢复时解压到独立目录比较。

## 上游与架构研究检查点（2026-09-20）

上游更新前的提交、指令文件及差异已单独备份，定位见[上游记录](../engineering/upstream.md)。产品修改前可参考修订 5 归档；修改后归档为 `custom-projects/.backups/dsh-product-architecture-20260920.tar.gz`，配套 `.tar.gz.sha256` 记录校验值，排除 node_modules、dist 和 .git。恢复时先解压到独立目录比较。该归档保存产品文档与已有 Demo，不包含整份上游源码或运行数据；上游版本通过固定提交另行检出。当前仍无产品 Git 提交或远端，不把归档称为 Git 历史。

## 对话优先与方案修订 6 检查点（2026-09-20）

修改前参考同日 `dsh-product-architecture-20260920.tar.gz`；修改后归档为 `custom-projects/.backups/dsh-product-conversation-first-rev6-20260920.tar.gz`，同目录 `.tar.gz.sha256` 保存校验值。归档排除 node_modules、dist 和 .git，仅更新产品及管理文档，Demo 源码不变。恢复先解压到独立目录比较；当前仍未形成 Git 提交，不将临时归档称为 Git 历史。P1/v0.1 范围按修订 6 收敛为对话闭环，不再沿用旧版五模块完整交付的门槛。

## 对话与 Harness 管理修订 7 检查点（2026-09-20）

修改前参考 `dsh-product-conversation-first-rev6-20260920.tar.gz`；修改后归档为 `custom-projects/.backups/dsh-product-conversation-harness-rev7-20260920.tar.gz`，同目录 `.tar.gz.sha256` 保存校验值。归档排除 node_modules、dist 和 .git，仅更改方案及管理文档。恢复先在独立目录校验并比较；当前仍无产品 Git 提交，不将归档称为 Git 历史。P1 当前范围以修订 7 的对话与 Harness 管理为准。

## 桌面 alpha.1 检查点（2026-09-20）

开发前归档为 `dsh-product-before-desktop-dev-20260920.tar.gz`；开发后源码归档为 `dsh-product-desktop-alpha1-20260920.tar.gz`，均在 `custom-projects/.backups/`。交付归档附 SHA-256，排除依赖目录、运行数据和构建产物；Node 二进制通过固定环境重新构建。应用产物独立保存于 `engineering/apps/desktop/dist/mac-arm64/DSH Workbench.app`。详见[008](008-desktop-alpha.md)。Git 作者待补，当前仍无提交；Harness 配置版本由应用独立管理，已验证手动回退。

## 双目标方案修订 8（2026-09-20）

修改前为 `focus-workspace-before-revision8-20260920.tar.gz`，修改后为 `focus-workspace-revision8-20260920.tar.gz`，均位于 `custom-projects/.backups/`，配套 SHA-256。此次仅改文档，应用仍为 alpha.2；新增进化能力尚未开发。恢复先在独立目录比较，不能把文档版本回退当作 Harness 或用户数据恢复。详见[010](010-dual-goals-evolution.md)。

## 整合方案修订 9（2026-09-20）

以修订 8 归档为修改前检查点，修改后保存 `custom-projects/.backups/focus-workspace-revision9-20260920.tar.gz` 及 SHA-256。此次仅整合文档，桌面版本仍为 alpha.2，新增能力未实现。统一审阅入口为[产品方案](../product/outline.md)，用户确认后继续开发，见[011](011-integrated-proposal.md)。

## 模型目录 alpha.3（2026-09-23）

前后源码归档分别为 `custom-projects/.backups/focus-workspace-before-models-20260923.tar.gz`、`custom-projects/.backups/focus-workspace-models-alpha3-20260923.tar.gz`，附 SHA-256；旧应用包独立保留在 `.backups/focus-workspace-alpha2-20260923/Focus Workspace.app`。本次未迁移用户数据。验证见[012](012-model-catalog.md)。

## 多组合方案与模型显示 alpha.4（2026-09-23）

修改前源码归档为 `custom-projects/.backups/focus-workspace-before-compositions-20260923.tar.gz`，完成归档为 `custom-projects/.backups/focus-workspace-compositions-alpha4-20260923.tar.gz`，均附 SHA-256。alpha.3 应用保留在 `.backups/focus-workspace-alpha3-20260923/Focus Workspace.app`。修订 10 的多组合功能只有设计；应用代码仅更新模型名称、请求 ID 的显示及版本号。见[013](013-harness-compositions.md)。

## 统一模式设计修订 11（2026-09-23）

修改前归档 `custom-projects/.backups/focus-workspace-before-modes-rev11-20260923.tar.gz`，完成归档 `custom-projects/.backups/focus-workspace-modes-rev11-20260923.tar.gz`，均附 SHA-256。本轮仅方案与解释文档，应用仍为 alpha.4；恢复先在独立目录比较，不覆盖运行数据。详见[014](014-mode-design.md)。

## alpha.5 模式管理检查点（2026-09-23）

开发前源码：`../.backups/focus-workspace-before-alpha5-20260923.tar.gz`；最终源码：`../.backups/focus-workspace-alpha5-20260923.tar.gz`，均配套 SHA-256。旧应用完整保留于 `../.backups/focus-workspace-alpha4-before-modes-20260923/Focus Workspace.app`。最终包位于桌面工程 `dist/mac-arm64/Focus Workspace.app`。源码归档已在临时目录展开核对关键文件，不包含用户会话、密钥、依赖或运行时二进制。

数据 schema 2 与 alpha.4 不兼容；回退应用时需另存当前数据，再恢复 schema 1 备份，详见桌面 README。当前仍没有 Git 提交或远端；版本恢复依赖这些归档与独立应用包。
