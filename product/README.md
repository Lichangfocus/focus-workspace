# 产品文档

产品文档分两层，思路与设计分开维护：

```text
product/
├── outline.md          第一层 · 产品大纲：定位、用户、原则、六大支柱与各模块进度、分期
├── features/           第二层 · 功能设计：每个模块一份，含功能项与进度表和具体设计（索引见 features/README.md）
├── approval.md         确认记录：每次用户确认的范围，工程开工的依据
├── demo-map.md         方案与历史 Demo 的对应表
└── references.md       产品与技术参考
```

## 怎么用

- **调整方向、支柱与模块划分**：改 [outline.md](outline.md)，只写定位、基础描述和当前进度。
- **增删功能、细化怎么做、更新状态**：改 [features/](features/README.md) 下对应模块文档的「功能项与进度」表和正文，再同步大纲里该模块的进度一句话。
- **确认后开工**：在 [approval.md](approval.md) 记录确认范围，再建迭代文档与工程任务；链路见 [AGENTS.md](../AGENTS.md#方案先行产品与工程的关联)。
- **技术架构**：在[工程架构](../engineering/architecture.md)维护，与大纲第四节“为什么以 DSH 为底座”对应。
