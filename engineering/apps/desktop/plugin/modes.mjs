/** Account-owned independent drafts, immutable revisions and reviewed evolution candidates. */
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {KINDS,Draft,LegacyDraft,defaults} from './config.mjs';
const id=z.string().min(1).max(160);const text=z.string().trim().min(1).max(12000);
const Version=z.object({id,label:z.string(),createdAt:z.string(),config:Draft,inspectionSessionId:z.string().optional()});
const Candidate=z.object({id,feedbackId:id,basePreset:id,baseRevision:z.number().int(),config:Draft,createdAt:z.string(),evidence:z.object({baseline:text,candidate:text,sessionId:id}).nullable(),status:z.enum(['pending','adopted']),trialSessionId:z.string().optional(),trialPresetId:z.string().optional()});
const Feedback=z.object({id,sessionId:id,presetId:id,text,createdAt:z.string(),taskSessionId:z.string().optional()});
const Mode=z.object({id,builtin:z.boolean(),kind:z.enum(['standard','ptc','minimal','cordis']),archived:z.boolean(),draft:Draft,draftRevision:z.number().int().nonnegative(),current:z.string().nullable(),versions:z.array(Version),feedback:z.array(Feedback),candidates:z.array(Candidate),lastError:z.string().nullable()});
export const State=z.object({schema:z.literal(2),modes:z.array(Mode),audit:z.array(z.object({at:z.string(),modeId:id,action:z.string(),presetId:z.string().nullable()}))});
export const freshMode=(kind,builtin=false,label)=>({id:builtin?kind:`mode-${randomUUID()}`,builtin,kind,archived:false,draft:{...defaults(kind),...(label?{label}:{})},draftRevision:0,current:builtin?kind:null,versions:[],feedback:[],candidates:[],lastError:null});
/** Schema 1 is preserved as one legacy mode; original preset identifiers are never rewritten. */
export function migrate(raw,active){
 if(!raw)return {schema:2,modes:KINDS.map(k=>freshMode(k.id,true)),audit:[]};
 if(raw.schema===2)return State.parse(raw);
 if(raw.schema!==1)throw Error('不支持的 Workbench 数据版本');
 const convert=v=>Draft.parse({...defaults(),defaultSkills:false,...LegacyDraft.parse(v)});
 const state=migrate(null,active);const legacy=freshMode('standard',false);legacy.draft=convert(raw.draft);legacy.versions=raw.versions.map(v=>({...v,config:convert(v.config)}));legacy.current=legacy.versions.find(v=>v.id===active)?.id??legacy.versions[0]?.id??null;legacy.lastError=raw.lastError??null;state.modes.push(legacy);return State.parse(state);
}
export function modeById(state,id){const mode=state.modes.find(m=>m.id===id);if(!mode)throw Error('模式不存在');return mode;}
export function assertRevision(mode,revision){if(mode.draftRevision!==revision)throw Error('草稿已被其他窗口或操作更新，请刷新后合并修改');}
export function publishedConfig(mode){return mode.versions.find(v=>v.id===mode.current)?.config??(mode.builtin?defaults(mode.kind):null);}
/** Only known published revisions may be attributed to a mode. */
export function ownsPreset(mode,preset){return (mode.builtin&&preset===mode.kind)||mode.versions.some(v=>v.id===preset)||mode.candidates.some(c=>c.trialPresetId===preset);}
export function record(state,mode,action){state.audit.unshift({at:new Date().toISOString(),modeId:mode.id,action,presetId:mode.current});}
export function difference(before,after,path=''){const changes=[];for(const key of new Set([...Object.keys(before??{}),...Object.keys(after??{})])){const a=before?.[key],b=after?.[key],field=path?`${path}.${key}`:key;if(JSON.stringify(a)===JSON.stringify(b))continue;if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b))changes.push(...difference(a,b,field));else changes.push({field,before:a??null,after:b??null});}return changes;}
/** Candidates are adopted into a draft only after human comparison, never directly published. */
export function adoptCandidate(mode,candidateId){const candidate=mode.candidates.find(x=>x.id===candidateId);if(!candidate||candidate.status!=='pending')throw Error('候选不存在或已采用');if(!mode.draft.evolution.enabled)throw Error('当前模式未开启自进化');if(candidate.basePreset!==mode.current)throw Error('候选基准版本已变化，请重新生成候选');assertRevision(mode,candidate.baseRevision);if(!candidate.evidence)throw Error('请先记录基准与候选的对照验证证据');mode.draft=Draft.parse(candidate.config);mode.draftRevision++;candidate.status='adopted';}
