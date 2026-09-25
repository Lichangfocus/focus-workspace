/** Thin desktop owner. Official dsh web profile owns execution and authenticated UI. */
import {app,BrowserWindow,dialog,Menu,shell} from 'electron';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {DEEPSEEK_MODELS} from '../plugin/model-catalog.mjs';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
app.setName('Focus Workspace');
app.commandLine.appendSwitch('lang','zh-CN');
// Keep the existing account location across the display-name change.
const appData=process.env.DSH_WORKBENCH_HOME || join(app.getPath('appData'),'DSH Workbench');
app.setPath('userData',join(appData,'browser'));
let child,win,stopping=false,origin,logTail='';
if(!app.requestSingleInstanceLock()){app.quit();}else{
  app.on('second-instance',()=>{win?.show();win?.focus();});
  app.on('window-all-closed',()=>app.quit());
  app.on('before-quit',event=>{if(child&&!stopping){event.preventDefault();stopping=true;void shutdown().finally(()=>app.quit());}});
  app.whenReady().then(async()=>{
  Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'Focus Workspace',submenu:[{role:'about'},{type:'separator'},{label:'打开本地数据目录',click:()=>shell.openPath(appData)},{role:'quit'}]},{label:'编辑',submenu:[{role:'undo'},{role:'redo'},{type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'},{role:'selectAll'}]},{label:'视图',submenu:[{role:'reload'},{role:'toggleDevTools'},{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'}]}]));
  win=new BrowserWindow({width:1400,height:920,minWidth:980,minHeight:680,title:'Focus Workspace',backgroundColor:'#f7f7f5',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
  await win.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent('<html lang="zh"><body style="background:#f7f7f5;color:#202522;font:15px -apple-system;padding:70px"><h1>Focus Workspace</h1><p>正在启动你的本地工作台…</p><p>think different</p></body></html>'));
  try{
    const accountRoot=join(appData,'accounts','local');const workspace=join(appData,'workspace');
    await mkdir(accountRoot,{recursive:true,mode:0o700});await mkdir(workspace,{recursive:true});
    try{await readFile(join(accountRoot,'account.json'));}catch(error){if(error.code!=='ENOENT')throw error;await writeFile(join(accountRoot,'account.json'),JSON.stringify({id:randomUUID(),name:'我的本地账号',createdAt:new Date().toISOString()}),{mode:0o600});}
    const patch=join(accountRoot,'workbench.patch.yml');
    await writeFile(patch,JSON.stringify([{id:'llm-deepseek',config:{models:DEEPSEEK_MODELS}},{id:'ui-plugin-manager',disabled:true},{id:'ui-brand-official',disabled:true},{id:'hmr',disabled:true},{insert:[{id:'workbench',name:join(root,'plugin','host.mjs')}]}],null,2),{mode:0o600});
    const cli=join(root,'node_modules','@deepseek-ai','dsh','lib','bin.js');
    const env={...process.env,DSH_HOME:accountRoot,DSH_AGENTS_HOME:join(accountRoot,'agents'),DSH_WORKBENCH_WORKSPACE:workspace,DSH_TELEMETRY_DISABLED:'1'};
    delete env.NODE_OPTIONS;delete env.ELECTRON_RUN_AS_NODE;
    child=spawn(join(root,'runtime','node'),['--expose-internals',cli,'--profile','web','--patch',patch,'--no-open','--host','127.0.0.1','--port','0'],{cwd:workspace,env,stdio:['ignore','pipe','pipe']});
    const url=await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error('运行时启动超时。'+logTail)),90000);
      const listen=chunk=>{const value=chunk.toString();logTail=(logTail+value).slice(-10000);const found=logTail.match(/dsh web: (http:\/\/[^\s]+)/);if(found){clearTimeout(timeout);resolve(found[1]);}};
      child.stdout.on('data',listen);child.stderr.on('data',listen);
      child.once('error',error=>{clearTimeout(timeout);reject(error);});child.once('exit',code=>{clearTimeout(timeout);reject(new Error(`运行时退出 (${code})。${logTail}`));});
    });
    origin=new URL(url).origin;
    win.webContents.setWindowOpenHandler(({url:target})=>{if(/^https?:/.test(target))void shell.openExternal(target);return {action:'deny'};});
    win.webContents.on('will-navigate',(event,target)=>{if(new URL(target).origin!==origin){event.preventDefault();if(/^https?:/.test(target))void shell.openExternal(target);}});
    win.webContents.session.setPermissionRequestHandler((_contents,_permission,callback)=>callback(false));
    win.webContents.on('page-title-updated',event=>{event.preventDefault();win.setTitle('Focus Workspace');});
    await win.loadURL(url);
    child.once('exit',code=>{if(!stopping)void dialog.showMessageBox(win,{type:'error',message:'本地内核已停止',detail:`退出代码：${code}。关闭并重新打开应用可重试，已保存会话保留。`});});
  }catch(error){console.error(String(error.message??error).replace(/([?&]token=)[^\s&]+/g,'$1[hidden]'));await dialog.showMessageBox(win,{type:'error',message:'工作台启动失败',detail:String(error.message??error).replace(/([?&]token=)[^\s&]+/g,'$1[hidden]')});}
  }).catch(error=>{console.error(error);app.quit();});
}
async function shutdown(){
  const process=child;if(!process||process.exitCode!==null)return;
  await new Promise(resolve=>{const timer=setTimeout(()=>process.kill('SIGKILL'),8000);process.once('exit',()=>{clearTimeout(timer);resolve();});process.kill('SIGTERM');});child=undefined;
}
