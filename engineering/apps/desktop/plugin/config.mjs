/** Validated mode definitions and compilation into official DSH compositions. */
import {z} from 'zod';
import {parseDocument} from 'yaml';
export const KINDS=[{id:'standard',label:'标准',description:'完整工具与上下文管理，适合日常任务。'},{id:'ptc',label:'PTC',description:'以代码组织工具调用，适合多步骤处理。'},{id:'minimal',label:'极简',description:'完整固定提示词与持久终端，可按需增加能力。'},{id:'cordis',label:'创造',description:'标准能力加配置编辑工具与 Cordis 技能。'}];
export const GROUPS=[{id:'files',label:'文件读写与搜索',rows:['tool-fs','tool-fs-search']},{id:'shell',label:'终端执行',rows:['tool-bash','tool-pwsh','persistent-shell']},{id:'web',label:'网页检索',rows:['tool-web']},{id:'subagent',label:'内置 Subagent',rows:['delegation']}];
const key=z.string().regex(/^[a-zA-Z0-9_-]{1,32}$/);
export const LegacyDraft=z.object({label:z.string().trim().min(1).max(64),tools:z.object({files:z.boolean(),shell:z.boolean(),web:z.boolean(),subagent:z.boolean()}).strict(),skills:z.array(z.object({id:key,path:z.string().min(1).max(2048),enabled:z.boolean()}).strict()).max(30),mcp:z.array(z.object({id:key,command:z.string().min(1).max(2048),args:z.array(z.string().max(2048)).max(50),enabled:z.boolean()}).strict()).max(20)}).strict();
export const Draft=LegacyDraft.extend({kind:z.enum(['standard','ptc','minimal','cordis']),instructions:z.string().max(20000).refine(x=>!x.includes('{{'),'附加指令请使用普通文本，不支持模板表达式'),presentation:z.enum(['native','ptc']),defaultSkills:z.boolean(),pluginManager:z.boolean(),observe:z.boolean(),evolution:z.object({enabled:z.boolean(),goal:z.string().max(4000)}).strict()}).strict().superRefine((v,c)=>{for(const group of ['skills','mcp'])if(new Set(v[group].map(x=>x.id)).size!==v[group].length)c.addIssue({code:'custom',message:`${group} 名称不能重复`});if(v.evolution.enabled&&!v.observe)c.addIssue({code:'custom',message:'开启自进化需要开启模式观测'});if(v.pluginManager&&v.kind!=='cordis')c.addIssue({code:'custom',message:'原生配置修改工具本版仅在创造类型启用'});});
/** Starting values reflect each shipped composition, including minimal's persistent shell. */
export function defaults(kind='standard'){return {label:KINDS.find(x=>x.id===kind)?.label??kind,kind,instructions:'',presentation:kind==='ptc'?'ptc':'native',tools:{files:kind!=='minimal',shell:true,web:kind!=='minimal',subagent:kind!=='minimal'},defaultSkills:kind!=='minimal',skills:[],mcp:[],pluginManager:kind==='cordis',observe:true,evolution:{enabled:false,goal:''}};}
export const DEFAULT_DRAFT=defaults();
const yamlOptions={customTags:[{tag:'tag:yaml.org,2002:js',resolve:value=>({__jsExpr:value})}]};
/** Parse Loader entry-list YAML; `!!js` nodes become the Loader's serialized `{__jsExpr}` form. */
export function parseRows(text){const doc=parseDocument(text,yamlOptions);if(doc.errors.length)throw doc.errors[0];const rows=doc.toJS();if(!Array.isArray(rows))throw Error('preset 配置必须是插件行列表');return rows;}
const find=(rows,id)=>rows.find(r=>r?.id===id);
/** Compile a draft onto a base preset's plugin rows; platform conditions and isolated groups stay as declared.
 * @param baseRows Plugin rows of the starting built-in preset.
 * @param input Draft to apply.
 * @param skillCount Number of frozen product Skill roots the registered definition will add.
 * @param standardRows Rows of the standard preset, the source of capabilities minimal lacks.
 * @returns New plugin rows; product Skill roots are added when the definition is materialized.
 */
export function composePlugins(baseRows,input,skillCount=0,standardRows=baseRows){
 const draft=Draft.parse(input);const rows=structuredClone(baseRows);
 const addFromStandard=id=>{if(!find(rows,id)){const original=find(standardRows,id);if(!original)throw Error(`缺少官方插件 ${id}`);rows.push(structuredClone(original));}};
 for(const group of GROUPS){if(draft.tools[group.id]&&draft.kind==='minimal'&&group.id!=='shell')for(const id of group.rows)addFromStandard(id);for(const id of group.rows){const row=find(rows,id);if(row&&!draft.tools[group.id])row.disabled=true;}}
 // Minimal keeps its complete prompt; appended instructions remain inside that complete prompt.
 const persona=find(rows,'persona');if(!persona)throw Error('模式缺少 persona');persona.config??={};const field=draft.kind==='minimal'?'prefix':'suffix';if(draft.instructions)persona.config[field]=`${persona.config[field]??''}\n\n${draft.instructions}`.trim();
 if(draft.kind==='minimal'&&(draft.defaultSkills||skillCount)){addFromStandard('skill-filesystem');addFromStandard('tool-skill');}
 const skill=find(rows,'skill-filesystem');if(skill){skill.config??={};skill.config.includeDefaultRoots=draft.defaultSkills;skill.config.watch=false;if(!draft.defaultSkills||!Array.isArray(skill.config.customSkillDirs))skill.config.customSkillDirs=[];}
 const manager=find(rows,'tool-plugin-manager');if(manager&&!draft.pluginManager)manager.disabled=true;
 const presentation=find(rows,'tool-presentation');if(presentation)presentation.config={mode:draft.presentation};else if(draft.presentation==='ptc')rows.push({id:'tool-presentation',name:'@deepseek-ai/dsh-agent-tool-presentation',config:{mode:'ptc'}});
 for(const server of draft.mcp.filter(x=>x.enabled))rows.push({id:`workbench-mcp-${server.id}`,name:'@deepseek-ai/dsh-mcp-client',config:{serverName:server.id,transport:'stdio',command:server.command,args:server.args,failOnStartupError:true,reconnect:{enabled:true,initialDelayMs:500,maxDelayMs:30000,maxAttempts:3}}});
 return rows;
}
/** Add account-local Skill roots to a stored row list without mutating it.
 * @param plugins Stored plugin rows.
 * @param roots Absolute Skill root directories.
 * @returns Rows ready for registration.
 */
export function withSkillRoots(plugins,roots){const rows=structuredClone(plugins);if(!roots.length)return rows;const skill=find(rows,'skill-filesystem');if(!skill)throw Error('版本定义缺少 skill-filesystem，无法装配 Skill');skill.config??={};skill.config.customSkillDirs=[...(skill.config.customSkillDirs??[]),...roots];return rows;}
