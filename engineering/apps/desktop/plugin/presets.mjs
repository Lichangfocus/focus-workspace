/** Account-owned immutable preset definitions; the DSH registry holds only in-memory revisions. */
import {readFile,readdir,mkdir,cp,rm,lstat,writeFile} from 'node:fs/promises';
import {join,relative,resolve,sep,isAbsolute} from 'node:path';
import {z} from 'zod';
import {parseRows,withSkillRoots} from './config.mjs';
import {parse} from 'yaml';
import {readJson} from './store.mjs';

const PresetId=z.string().regex(/^wb-[0-9]+-[0-9a-f]{6,32}$/);
/** Relative directory under the product data directory; never escapes it. */
const Root=z.string().min(1).max(512).refine(v=>!isAbsolute(v)&&!v.split(/[\\/]/).includes('..'),'Skill 根目录必须位于产品数据目录内');
export const Record=z.object({schema:z.literal(1),id:PresetId,name:z.string().min(1).max(200),description:z.string().max(1000),kind:z.enum(['standard','ptc','minimal','cordis']).nullable(),createdAt:z.string(),dshVersion:z.string(),origin:z.enum(['published','migrated-alpha5']),plugins:z.array(z.record(z.string(),z.unknown())).min(1),skillRoots:z.array(Root).max(30)}).strict();

/**
 * Open the preset store rooted at the product data directory.
 * @param data Product data directory (`$DSH_HOME/workbench`).
 * @returns Store operations; every record file is written once and never rewritten.
 */
export function presetStore(data){
 const dir=join(data,'presets'),skills=join(data,'skills');
 const file=id=>join(dir,`${PresetId.parse(id)}.json`);
 return {
  skillDir:id=>join(skills,PresetId.parse(id)),
  /** @returns Every stored record ordered by id. */
  async list(){let names;try{names=await readdir(dir);}catch(error){if(error.code==='ENOENT')return [];throw error;}const records=[];for(const name of names.filter(n=>n.endsWith('.json')).sort())records.push(Record.parse(await readJson(join(dir,name))));return records;},
  async has(id){try{await lstat(file(id));return true;}catch(error){if(error.code==='ENOENT')return false;throw error;}},
  /** Persist one record; an existing file with the same id is an error. */
  async save(record){await mkdir(dir,{recursive:true,mode:0o700});const value=Record.parse(record);await writeFile(file(value.id),JSON.stringify(value,null,2)+'\n',{mode:0o600,flag:'wx'});},
  /** Remove a record and its Skill copies; only used for a definition that never became a version. */
  async discard(id){await rm(file(id),{force:true});await rm(join(skills,PresetId.parse(id)),{recursive:true,force:true});},
  /**
   * Registry definition for a record; Skill roots become absolute under this account.
   * @param record Stored record.
   * @returns PresetDefinition accepted by `agentPresets.register`.
   */
  definition(record){return {id:record.id,name:record.name,description:record.description,plugins:withSkillRoots(record.plugins,record.skillRoots.map(r=>join(data,r)))};},
 };
}

/**
 * Convert alpha.5 preset directories into stored records while keeping their ids.
 * The directories are left untouched as the pre-migration copy.
 * @param options.home DSH_HOME of the account.
 * @param options.data Product data directory.
 * @param options.store Preset store.
 * @param options.creatorSkillDirs `customSkillDirs` of the installed creator preset, replacing directory-relative expressions.
 * @param options.dshVersion Installed DSH version recorded on each converted record.
 * @returns Ids converted in this call.
 */
export async function migrateLegacyDirectories({home,data,store,creatorSkillDirs,dshVersion}){
 const legacy=join(home,'.agent-presets');let names;
 try{names=await readdir(legacy);}catch(error){if(error.code==='ENOENT')return [];throw error;}
 const converted=[];
 for(const id of names.filter(n=>PresetId.safeParse(n).success).sort()){
  if(await store.has(id))continue;
  const source=join(legacy,id);let text;
  try{text=await readFile(join(source,'agent.cordis.yml'),'utf8');}catch(error){if(error.code==='ENOENT')continue;throw error;}
  const plugins=parseRows(text);
  let meta={};try{meta=parse(await readFile(join(source,'preset.yml'),'utf8'))??{};}catch(error){if(error.code!=='ENOENT')throw error;}
  const skillRoots=[];
  const skill=plugins.find(r=>r?.id==='skill-filesystem');
  if(Array.isArray(skill?.config?.customSkillDirs)){
   const dirs=[];
   for(const entry of skill.config.customSkillDirs){
    // alpha.5 creator versions resolved their bundled skills relative to the preset directory; 0.1.7 ships them with the package.
    if(entry?.__jsExpr?.includes("new URL('skills/'")){dirs.push(...structuredClone(creatorSkillDirs));continue;}
    if(typeof entry==='string'){const inside=relative(resolve(source),resolve(entry));if(!inside.startsWith('..')&&!isAbsolute(inside)&&inside.split(sep)[0]==='workbench-skills'){const target=join(store.skillDir(id),...inside.split(sep).slice(1));await cp(entry,target,{recursive:true,errorOnExist:true,force:false});skillRoots.push(relative(data,target));continue;}}
    dirs.push(entry);
   }
   skill.config.customSkillDirs=dirs;
  }
  await store.save({schema:1,id,name:String(meta.name??id),description:String(meta.description??''),kind:null,createdAt:new Date().toISOString(),dshVersion,origin:'migrated-alpha5',plugins,skillRoots});
  converted.push(id);
 }
 return converted;
}
