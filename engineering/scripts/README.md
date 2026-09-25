# 工程脚本

存放需要重复执行的开发、检查或部署操作。每个脚本说明前提、输入和输出；失败时返回非零状态，便于本地和 CI 共用。脚本只依赖 Node 24 内置模块。

| 脚本 | 用途 | 常用命令 |
| --- | --- | --- |
| `check-upstream.mjs` | 比较桌面应用锁定的 `@deepseek-ai/dsh` 与 npm / GitHub Release 最新发布，结果写入 `.local/upstream/last-check.json` | `node engineering/scripts/check-upstream.mjs --max-age 12h` |
| `check-doc-links.mjs` | 检查所有 Markdown 相对链接的目标文件与标题锚点 | `node engineering/scripts/check-doc-links.mjs` |
| `upstream-watch.mjs` | 安装、查看、移除每日运行上述检查的 macOS launchd 任务（默认 09:30，发现新版本发系统通知） | `node engineering/scripts/upstream-watch.mjs install\|status\|uninstall` |

`check-upstream.mjs` 的退出码：0 表示检查完成（有无新版本都是 0），2 表示检查失败。测试：`node --test engineering/tests/*.test.mjs`。

跟进新版本的完整流程见[上游接入记录](../upstream.md#跟进机制)。
