# 工程入口

当前应用为 [Focus Workspace 0.1.0-alpha.2](apps/desktop/README.md)。采用独立 Electron 桌面壳、包内 Node、官方 DSH Web profile 与产品 Harness 插件；不修改上游核心源码。真实对话复用官方 Client，产品插件管理账号范围内的配置、装配与版本。

[架构方案](architecture-proposal.md)记录设计，[上游记录](upstream.md)固定依赖，[迭代 008](../iterations/008-desktop-alpha.md)记录实际验证与未完成验收。实现位于 `apps/desktop/`，其他目录暂保留后续扩展职责。

修订 8 新增[自进化基础设计](evolution-foundation.md)：在现有执行与版本机制上补齐任务证据、反馈、候选、独立验证及采用记录。当前是方案，未在 alpha.2 实现；不要求重建整个桌面端。
