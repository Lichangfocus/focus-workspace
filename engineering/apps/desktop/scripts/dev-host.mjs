import './patch-creator.mjs';
/** Isolated official-profile launch for reproducible product integration checks. */
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {DEEPSEEK_MODELS} from '../plugin/model-catalog.mjs';
const home=resolve(process.env.WORKBENCH_TEST_HOME||'.local/test-account');
await mkdir(home,{recursive:true,mode:0o700});
await mkdir(join(home,'workspace'),{recursive:true});
await writeFile(join(home,'account.json'),JSON.stringify({id:'test-account',name:'本地验证账号'}),{mode:0o600});
const patch=join(home,'overlay.yml');
await writeFile(patch,JSON.stringify([{id:'llm-deepseek',config:{models:DEEPSEEK_MODELS}},{id:'ui-plugin-manager',disabled:true},{id:'ui-brand-official',disabled:true},{id:'hmr',disabled:true},{insert:[{id:'workbench',name:resolve('plugin/host.mjs')}]}]),{mode:0o600});
const child=spawn(process.execPath,['--expose-internals',resolve('node_modules/@deepseek-ai/dsh/lib/bin.js'),'--profile','web','--patch',patch,'--no-open','--host','127.0.0.1','--port','0'],{cwd:join(home,'workspace'),env:{...process.env,DSH_HOME:home,DSH_AGENTS_HOME:join(home,'agents'),DSH_WORKBENCH_WORKSPACE:join(home,'workspace')},stdio:['ignore','pipe','pipe']});
let output='';
child.stdout.on('data',async b=>{output+=b.toString();const m=output.match(/dsh web: (http:\/\/[^\s]+)/);if(m){await writeFile(resolve('.local/test-url'),m[1],{mode:0o600});console.log('READY: authenticated URL saved to .local/test-url');}else console.log(b.toString().replace(/([?&]token=)[^\s&]+/g,'$1[hidden]'));});
child.stderr.on('data',b=>console.error(b.toString()));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill('SIGTERM'));
child.on('exit',code=>process.exit(code??1));
