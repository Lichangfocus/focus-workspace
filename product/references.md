# 产品与技术参考

核对日期：2026-09-11。仅引用官方说明，本轮未登录竞品实测；以下不是体验评测或完整功能清单。

| 参考 | 核对到的事实 | 本项目的设计判断 |
| --- | --- | --- |
| [Cowork 项目](https://claude.com/docs/cowork/guide/projects) | 项目组织本地文件夹、指令、链接和项目记忆 | 工作空间承载反复工作的上下文 |
| [Cowork 插件](https://claude.com/docs/cowork/guide/plugins) | 插件可组合 Skills、连接器、Subagent 等能力 | 统一管理能力，各类型保留独立配置 |
| [Manus My Computer](https://help.manus.im/en/articles/14178443-what-is-the-my-computer-feature-capable-of) | 本地能力依赖命令行执行及用户授权目录 | 明确展示文件范围、执行过程和成果位置 |
| [Electron 进程模型](https://www.electronjs.org/docs/latest/tutorial/process-model) | 主进程管理桌面生命周期，渲染进程承载界面，preload 提供桥接 | 使用成熟桌面外壳，运行时与界面分离 |

Wiki 与图谱沉淀、任务驱动的 Harness 配置改进、本地账号归属和未来 Agent 网络是本项目待验证设计，不声称已由参考产品验证效果。

DSH 证据基于本地源码提交 b150a551b8d465e31e418e1b2eaf5e79bbb7d28e，不代表 npm 发布包已经具备相同接口；接入时核验实际安装版本。
