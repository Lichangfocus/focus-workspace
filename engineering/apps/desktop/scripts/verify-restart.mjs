/** Restart and migration checks against an already running isolated Host; no paid model requests.
 * Run after `npm run dev:host` restarts on an account that `verify:host` or alpha.5 populated.
 * `EXPECT_DEFAULT=<presetId>` additionally asserts the account default survived.
 */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const url=new URL(await readFile('.local/test-url','utf8'));
const auth=await fetch(url,{redirect:'manual'}),cookie=auth.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
const post=(path,body)=>fetch(new URL(path,url),{method:'POST',headers:{'content-type':'application/json',cookie},body:JSON.stringify(body)}).then(r=>r.json());
async function call(action,payload={}){const r=await post(`/api/workbench/${action}`,payload);if(!r.ok)throw Error(r.error?.message);return r.value;}
/** Official Typert Remote call, the same wire the DSH Client uses. */
async function rpc(method,args){const r=(await post(`/api/${method}`,{type:'client-request',rpcId:crypto.randomUUID(),method,payload:{args}})).result;if(!r.ok)throw Error(`${method}: ${r.error.message}`);return r.value;}
const snapshot=await call('snapshot');
const owned=new Set(snapshot.state.modes.flatMap(m=>[...m.versions.map(v=>v.id),...m.candidates.map(c=>c.trialPresetId).filter(Boolean)]));
const roster=new Map((await rpc('agentPresets/list',{})).presets.map(p=>[p.id,p]));
for(const id of owned){assert(roster.has(id),`version ${id} is registered`);assert.equal(roster.get(id).broken,undefined,`version ${id} is usable`);}
console.log(`PASS ${owned.size} mode versions registered after restart (${roster.size} presets in the official roster)`);
for(const m of snapshot.state.modes.filter(m=>m.current))assert(roster.has(m.current),`current version of ${m.draft.label}`);
if(process.env.EXPECT_DEFAULT){assert.equal(snapshot.activeId,process.env.EXPECT_DEFAULT);console.log('PASS account default survived restart');}
// Versions each product-created session was created on; cold alpha.5 projections carry no preset field.
const expected=new Map(snapshot.state.modes.flatMap(m=>[...m.versions.filter(v=>v.inspectionSessionId).map(v=>[v.inspectionSessionId,v.id]),...m.candidates.filter(c=>c.trialSessionId).map(c=>[c.trialSessionId,c.trialPresetId])]));
const sessions=(await rpc('session/list',{_request:{}})).items;let bound=0;
for(const s of sessions){const recorded=expected.get(s.sessionId)??s.projections?.values?.agentPreset;const reopened=await rpc('session/create',{request:{sessionId:s.sessionId,cwd:s.cwd}});assert.equal(reopened.sessionId,s.sessionId);assert(roster.has(reopened.agentPreset)&&!roster.get(reopened.agentPreset).broken,`${s.sessionId} resolves a usable preset`);if(recorded){assert.equal(reopened.agentPreset,recorded,`${s.sessionId} keeps ${recorded}`);bound++;}}
assert(bound>0,'at least one session with a known recorded version');
console.log(`PASS ${sessions.length} existing sessions reopened; ${bound} checked against their recorded versions`);
