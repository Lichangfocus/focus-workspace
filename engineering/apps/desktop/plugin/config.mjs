/** Validated mode definitions and compilation into official DSH compositions. */
import {z} from 'zod';
import {parseDocument,stringify} from 'yaml';
export const KINDS=[{id:'standard',label:'标准',description:'完整工具与上下文管理，适合日常任务。'},{id:'ptc',label:'PTC',description:'以代码组织工具调用，适合多步骤处理。'},{id:'minimal',label:'极简',description:'完整固定提示词与持久终端，可按需增加能力。'},{id:'cordis',label:'创造',description:'标准能力加配置编辑工具与 Cordis 技能。'}];
export const GROUPS=[{id:'files',label:'文件读写与搜索',rows:['tool-fs','tool-fs-search']},{id:'shell',label:'终端执行',rows:['tool-bash','tool-pwsh','persistent-shell']},{id:'web',label:'网页检索',rows:['tool-web']},{id:'subagent',label:'内置 Subagent',rows:['delegation']}];
const key=z.string().regex(/^[a-zA-Z0-9_-]{1,32}$/);
export const LegacyDraft=z.object({label:z.string().trim().min(1).max(64),tools:z.object({files:z.boolean(),shell:z.boolean(),web:z.boolean(),subagent:z.boolean()}).strict(),skills:z.array(z.object({id:key,path:z.string().min(1).max(2048),enabled:z.boolean()}).strict()).max(30),mcp:z.array(z.object({id:key,command:z.string().min(1).max(2048),args:z.array(z.string().max(2048)).max(50),enabled:z.boolean()}).strict()).max(20)}).strict();
export const Draft=LegacyDraft.extend({kind:z.enum(['standard','ptc','minimal','cordis']),instructions:z.string().max(20000).refine(x=>!x.includes('{{'),'附加指令请使用普通文本，不支持模板表达式'),presentation:z.enum(['native','ptc']),defaultSkills:z.boolean(),pluginManager:z.boolean(),observe:z.boolean(),evolution:z.object({enabled:z.boolean(),goal:z.string().max(4000)}).strict()}).strict().superRefine((v,c)=>{for(const group of ['skills','mcp'])if(new Set(v[group].map(x=>x.id)).size!==v[group].length)c.addIssue({code:'custom',message:`${group} 名称不能重复`});if(v.evolution.enabled&&!v.observe)c.addIssue({code:'custom',message:'开启自进化需要开启模式观测'});if(v.pluginManager&&v.kind!=='cordis')c.addIssue({code:'custom',message:'原生配置修改工具本版仅在创造类型启用'});});
/** Starting values reflect each shipped composition, including minimal's persistent shell. */
export function defaults(kind='standard'){return {label:KINDS.find(x=>x.id===kind)?.label??kind,kind,instructions:'',presentation:kind==='ptc'?'ptc':'native',tools:{files:kind!=='minimal',shell:true,web:kind!=='minimal',subagent:kind!=='minimal'},defaultSkills:kind!=='minimal',skills:[],mcp:[],pluginManager:kind==='cordis',observe:true,evolution:{enabled:false,goal:''}};}
export const DEFAULT_DRAFT=defaults();
const yamlOptions={customTags:[{tag:'tag:yaml.org,2002:js',resolve:value=>value}]};
/** Append validated optional capabilities without replacing native platform conditions or isolated service groups. */
export function composePreset(source,input,skillRoots=[],standardSource=source){
 const draft=Draft.parse(input);const doc=parseDocument(source,yamlOptions);const standard=parseDocument(standardSource,yamlOptions);
 if(doc.errors.length||standard.errors.length)throw doc.errors[0]??standard.errors[0];
 const rows=doc.contents;const get=id=>rows.items.find(r=>r.get('id')===id);
 const addFromStandard=id=>{if(!get(id)){const original=standard.contents.items.find(r=>r.get('id')===id);if(!original)throw Error(`缺少官方插件 ${id}`);rows.add(original.clone());}};
 for(const group of GROUPS){if(draft.tools[group.id]&&draft.kind==='minimal'&&group.id!=='shell')for(const id of group.rows)addFromStandard(id);for(const id of group.rows){const row=get(id);if(row&&!draft.tools[group.id])row.set('disabled',true);}}
 // Minimal keeps its complete prompt; appended instructions remain inside that complete prompt.
 const persona=get('persona');if(!persona)throw Error('模式缺少 persona');const config=persona.get('config');const field=draft.kind==='minimal'?'prefix':'suffix';if(draft.instructions)config.set(field,`${config.get(field)??''}\n\n${draft.instructions}`.trim());
 if(draft.kind==='minimal'&&(draft.defaultSkills||skillRoots.length)){addFromStandard('skill-filesystem');addFromStandard('tool-skill');}
 const skill=get('skill-filesystem');if(skill){let conf=skill.get('config');if(!conf){skill.set('config',doc.createNode({}));conf=skill.get('config');}conf.set('includeDefaultRoots',draft.defaultSkills);conf.set('watch',false);if(!draft.defaultSkills)conf.set('customSkillDirs',doc.createNode([]));if(!conf.get('customSkillDirs'))conf.set('customSkillDirs',doc.createNode([]));for(const root of skillRoots)conf.get('customSkillDirs').add(root);}
 const manager=get('tool-plugin-manager');if(manager)manager.set('disabled',!draft.pluginManager);
 const presentation=get('tool-presentation');if(presentation){presentation.set('config',{mode:draft.presentation});}else if(draft.presentation==='ptc')rows.add(doc.createNode({id:'tool-presentation',name:'@deepseek-ai/dsh-agent-tool-presentation',config:{mode:'ptc'}}));
 for(const server of draft.mcp.filter(x=>x.enabled))rows.add(doc.createNode({id:`workbench-mcp-${server.id}`,name:'@deepseek-ai/dsh-mcp-client',config:{serverName:server.id,transport:'stdio',command:server.command,args:server.args,failOnStartupError:true,reconnect:{enabled:true,initialDelayMs:500,maxDelayMs:30000,maxAttempts:3}}}));
 return String(doc);
}
/** Name each immutable preset version so the upstream selector can distinguish it. */
export function presetMetadata(label){return stringify({name:label,description:'Focus Workspace 固定版本；已有对话保持其实际配置。'});}
