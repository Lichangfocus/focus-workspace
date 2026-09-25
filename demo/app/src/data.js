/** Demo fixtures. No model, filesystem or connector calls are made. */
export const DEMO_VERSION = 'demo-0.1.0';
export const STORAGE_KEY = 'dsh-workbench-demo-v1';
export const initialCapabilities = [
  {id:'writing', type:'Skill', name:'方案写作', description:'从资料到结构清晰、有依据的产品方案。', icon:'PenNib', enabled:true, scope:'当前工作空间', instructions:'先给结论，再说明依据。保留原始来源，未确认的内容标为假设。'},
  {id:'research', type:'Skill', name:'资料调研', description:'收集证据，整理观点与待验证的问题。', icon:'MagnifyingGlass', enabled:true, scope:'当前工作空间', instructions:'优先查阅已授权资料，区分事实、推测和建议。'},
  {id:'files', type:'连接器', name:'本地文件', description:'让 Agent 在你指定的项目目录中工作。', icon:'Folder', enabled:true, scope:'当前工作空间', instructions:'演示路径：/workspace/个人工作台'},
  {id:'notes', type:'连接器', name:'笔记空间', description:'连接个人笔记，按授权范围获取上下文。', icon:'BookOpen', enabled:false, scope:'当前工作空间', instructions:'演示连接；不读取任何真实笔记。'},
  {id:'reviewer', type:'Subagent', name:'方案审阅员', description:'独立检查论证、遗漏和交付标准。', icon:'UserFocus', enabled:true, scope:'当前工作空间', instructions:'指出证据不足的结论，输出可执行的修改建议。'},
  {id:'organizer', type:'Subagent', name:'知识整理员', description:'从任务中提炼可追溯的事实与决策。', icon:'Graph', enabled:false, scope:'当前工作空间', instructions:'每条知识关联来源，不将推测当作已确认事实。'},
];
export const wikiBody = '# 个人 Agent 工作台\n\n## 产品目标\n提升个人使用 Agent 完成真实工作的能力。通过对话发起任务，在工作台管理成果，用知识库和能力配置支撑持续工作。\n\n## 首期范围\n- 首页：对话输入与桌面对象管理\n- 能力广场：Skills、连接器、Subagent\n- Harness 设置：配置可视化、试跑与回退\n- 知识库：来源、Wiki 与可追溯关系\n- 本地账号：资料和配置的归属\n\n## 下一步行动\n1. 对齐产品方案与交互 Demo。\n2. 确认正式工程的验收场景。\n3. 通过后接入真实 DSH 运行时。\n\n本内容为演示成果，不代表 Agent 实际执行结果。';
export function createAccount(id, name, populated = true) {
  return { id, name, items: populated ? [
    {id:'workspace',name:'个人工作台',kind:'folder',meta:'6 个项目',group:'工作'},
    {id:'research',name:'产品调研',kind:'folder',meta:'3 个项目',group:'工作'},
    {id:'learning',name:'学习笔记',kind:'folder',meta:'12 个项目',group:'学习'},
    {id:'brief',name:'产品方案.md',kind:'document',meta:'9 月 15 日 16:20',group:'工作',content:wikiBody},
    {id:'actions',name:'下一步行动',kind:'tasks',meta:'9 月 15 日 14:05',group:'工作',content:'# 下一步行动\n\n- 对齐界面布局和主要操作流程\n- 确认首期范围与验收标准\n- 准备 DSH 内核接入验证\n\n演示数据。'},
    {id:'wiki',name:'待审阅知识',kind:'knowledge',meta:'2 条待审阅',group:'学习'}
  ] : [], capabilities: structuredClone(initialCapabilities), task:null,
  sources: populated ? [{id:'s1',name:'产品方案.md',kind:'工作空间',status:'已索引',snippet:'首期账号只在本机创建，无需云端注册。'},{id:'s2',name:'产品规划讨论',kind:'会话',status:'已索引',snippet:'首页包含对话式输入与像电脑桌面一样管理的工作台。'}] : [],
  wiki: populated ? [{id:'w1',title:'个人工作台的产品定位',body:'以 DeepSeek Harness 为内核，帮助个人调动工具、知识与 Agent 完成工作。',status:'已收录',source:'s1'}, {id:'w2',title:'本地账号与数据归属',body:'个人知识、会话、凭证和配置归属于本地账号；首期无需云注册。',status:'待审阅',source:'s1'}, {id:'w3',title:'桌面式首页',body:'对话发起任务，桌面组织项目、任务和成果。',status:'待审阅',source:'s2'}] : [],
  harness:{version:'v1',context:'项目优先',model:'DeepSeek',history:[{version:'v1',note:'初始配置',context:'项目优先'}],experiment:null},
  contacts: populated ? [{id:'c1',name:'产品协作伙伴',role:'方案讨论与反馈',status:'仅本地记录'}] : [], drafts:[] };
}
export function initialState(){return {schema:1,active:'local-owner',accounts:[createAccount('local-owner','我的账号'),createAccount('local-guest','体验账号',false)]};}
export function readState(){try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return initialState();const state=JSON.parse(raw);if(state.schema!==1||!Array.isArray(state.accounts)||!state.accounts.some(a=>a.id===state.active)||state.accounts.some(a=>!Array.isArray(a.items)||!Array.isArray(a.capabilities)||!Array.isArray(a.sources)||!Array.isArray(a.wiki)||!a.harness||!Array.isArray(a.drafts)||!Array.isArray(a.contacts)))return initialState();state.accounts.forEach(a=>{if(a.task&&['running','waiting','approved'].includes(a.task.status))a.task.status='interrupted';});return state;}catch{return initialState();}}
export const makeId = () => crypto.randomUUID();
export const statusText={running:'正在整理',waiting:'等待你的确认',approved:'正在生成成果',complete:'已完成',stopped:'已停止',rejected:'已拒绝',interrupted:'已中断'};
export const features={
 home:[['HOME-01','任务输入','选择工作空间与能力，开始一轮演示任务。'],['HOME-02','桌面对象','选择、排序、分组、搜索及列表视图。'],['TASK-01','任务控制','演示进度、审批、停止及重试。'],['ARTIFACT-01','成果管理','预览、继续修改及保存到演示桌面。']],
 capabilities:[['CAP-01','能力管理','Skill、连接器和 Subagent 的配置与启停。']],
 harness:[['HARNESS-01','配置可视化','查看模块、参数及来源。'],['HARNESS-02','配置优化','示例对比、应用新版本及回退。']],
 knowledge:[['KNOW-01','知识积累','选择示例来源、生成候选知识、审阅入库。'],['KNOW-02','来源与图谱','检索、查看原文、关系依据及撤销来源。']],
 collaboration:[['COLLAB-01','协作草稿','Agent 名片、协作对象、共享范围及草稿。']],
 account:[['ACCOUNT-01','本地账号','体验账号切换与演示状态隔离。']]
};
