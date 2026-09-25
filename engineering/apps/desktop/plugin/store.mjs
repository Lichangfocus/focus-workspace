/** Atomic, owner-only product records. The DSH settings default owns activation. */
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';
export async function readJson(path,fallback){
  try{return JSON.parse(await readFile(path,'utf8'));}catch(error){if(error.code==='ENOENT')return fallback;throw error;}
}
export async function writeJson(path,value){
  await mkdir(dirname(path),{recursive:true,mode:0o700});
  const temp=`${path}.${randomUUID()}.tmp`;
  await writeFile(temp,JSON.stringify(value,null,2)+'\n',{mode:0o600,flag:'wx'});
  await rename(temp,path);
}
export function serialQueue(){let tail=Promise.resolve();return operation=>{const next=tail.then(operation);tail=next.catch(()=>{});return next;};}
