/** Official API catalog checked on 2026-09-23; retain IDs for existing selections.
 * Source: https://api-docs.deepseek.com/news/news260910/
 * Capability limits stay aligned with the pinned DSH adapter.
 */
export const DEEPSEEK_MODELS = [
  {
    id: 'deepseek-flash',
    name: 'DeepSeek-V4.1-Flash · deepseek-flash',
    description: '当前官方主推模型，支持文本与图像输入。',
    contextWindow: 1000000,
    inputModalities: ['text', 'image'],
    systemPromptUpdate: 'in-history',
  },
  {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek-V4-Pro · deepseek-v4-pro（兼容 → V4.1-Flash）',
    description: '旧模型兼容入口；官方自 2026-09-14 起转接至 V4.1-Flash，直到后续 Pro 发布。',
    contextWindow: 1000000,
  },
];
