# 016 · 开源发布与上游跟进机制

日期：2026-09-25。状态：完成。

## 目标

项目以 Apache-2.0 公开到 GitHub `Lichangfocus/focus-workspace`，并建立每日与每次任务开始时检查 DSH 上游更新的机制，把开发范式写入 AGENTS.md。

## 依据与范围

关联 TASK：TASK-002、TASK-010、TASK-031。确认记录见 [approval.md](../product/approval.md#开源与开发范式2026-09-25)。不涉及产品功能与应用代码变更。

## 交付

- 首次 Git 提交；公开前从提交中去除真实姓名（方案、Demo 示例账号、设计稿提示词，以及 10 张设计稿与 QA 截图的侧栏账号区域）、第三方截图与本机绝对路径。
- `LICENSE`（Apache-2.0）、`NOTICE`（DSH MIT 归属）、公开版 README。
- `AGENTS.md` 开发范式：任务开始检查、方案先行链路、工程原则、上游跟进、Git 与公开仓库卫生。
- `engineering/scripts/check-upstream.mjs`：按 SemVer 比较锁定版本与 npm 发布，附 GitHub Release 链接，结果缓存于 `.local/upstream/`。
- `engineering/scripts/upstream-watch.mjs`：安装每日 09:30 的 launchd 任务，新版本发 macOS 通知。
- [上游接入记录](../engineering/upstream.md#跟进机制)：跟进原则、评估项、升级验证清单、本地补丁表、升级记录。

## 验证记录

- `node --test engineering/tests/*.test.mjs`：2 项通过（SemVer 排序含跨版本线补丁发布、非法输入）。
- `node engineering/scripts/check-upstream.mjs`：报告锁定 0.1.6-alpha.2，更新版本 0.1.7-alpha.1 至 0.1.7-rc.2；`0.1.5-rc.3` 虽发布时间更晚但正确排除。`--max-age 12h` 复用缓存。
- `upstream-watch.mjs install` 后 `plutil -lint` 通过，`launchctl kickstart` 实际触发一次，日志写入且退出码 0。
- 全部 Git 历史 `git grep` 未发现真实姓名。

## 结论与后续

上游已有 4 个更新版本，且 Session 格式升至 v4，升级评估列为 TASK-030；补丁上游化为 TASK-033；产品方案修订 13 为 TASK-032。
