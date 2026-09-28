# 工程入口

当前应用为 [Focus Workspace 0.1.0-alpha.6](apps/desktop/README.md)，基于 DSH 0.1.7-rc.2。结构是一个独立的 Electron 桌面壳，包内带 Node，启动官方 DSH Web profile，再加上产品自己的 Harness 插件；不修改上游源码。对话复用官方 Client；产品插件负责模式版本、观测与受控改进，这些数据归账号所有。

| 文档 | 内容 |
| --- | --- |
| [技术架构](architecture.md) | 当前技术框架：进程与平面、代码模块、账号数据布局、关键流程、支柱到组件的对应 |
| [上游接入记录](upstream.md) | 跟进流程、当前锁定、升级记录、本地补丁与依赖的上游接口 |
| [进化对象与实现约束](evolution-foundation.md) | 自进化的数据对象与约束 |
| [架构研究](architecture-proposal.md) | 早期选型研究与历史实现记录 |

实现在 `apps/desktop/`，脚本在 `scripts/`（上游检查、文档链接检查），脚本测试在 `tests/`。
