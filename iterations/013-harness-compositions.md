# 013 · 多组合设计与模型显示

2026-09-23。用户要求：明确模型选择中配的型号；解释模式区别和原理；设计自定义多种 Harness 组合。

方案修订 10 将多组合设计整合进产品主方案，同步专题、功能清单（新增 HARNESS-04.1～04.4）、Demo 映射和架构说明。设计覆盖独立草稿/版本、模板支持、装配资产、模型覆盖、默认、试跑发布、旧会话绑定、归档、冲突、迁移和自进化候选作用域。多组合尚未开发；继续遵循先确认后编程。

模型显示的局部改动已明确获准，先更新方案和确认记录，再将菜单名称改为模型名称与实际 ID，保留原 model ID 和选择，目标 alpha.4。

修改前源码归档为 `custom-projects/.backups/focus-workspace-before-compositions-20260923.tar.gz`。本轮实际验证与完成检查点在交付后补充。

## 交付验证

模型显示更新已打包为 alpha.4；`npm run package -- --config.directories.output=dist/model-id-update` 成功（含 build）。重启原生桌面后，通过可访问性树展开模型菜单确认“DeepSeek-V4.1-Flash · deepseek-flash”和“DeepSeek-V4-Pro · deepseek-v4-pro（兼容 → V4.1-Flash）”均显示，原 Pro 选择及已有会话保留；未发送模型请求。截图接口未返回截图，因此未宣称像素级视觉验收。

检查文档相对链接与结尾换行通过，功能清单有 53 个唯一 ID。与修改前归档比较，工程和 Demo 的非 Markdown 文件只改模型显示目录、应用 manifest 和锁文件版本；多组合代码未改。归档中的 AppleDouble 元数据文件不作为源码比较对象。

旧应用包保留在 `custom-projects/.backups/focus-workspace-alpha3-20260923/Focus Workspace.app`。完成源码归档为 `custom-projects/.backups/focus-workspace-compositions-alpha4-20260923.tar.gz`，附 SHA-256；包括修订 10 方案及 alpha.4 代码，不包含用户数据、依赖和打包产物。仍无 Git 提交，未上传 GitHub。
