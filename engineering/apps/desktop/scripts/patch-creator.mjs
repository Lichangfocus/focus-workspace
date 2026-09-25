/** Compatibility for the pinned DSH release: creator scopes share Host inspection providers. */
import {readFile,writeFile} from 'node:fs/promises';
const root='node_modules/@deepseek-ai/dsh-tool-cordis/';
const pkg=JSON.parse(await readFile(root+'package.json','utf8'));
if(pkg.version!=='0.1.6-alpha.2')throw Error('Review creator inspection compatibility for the new DSH version');
const path=root+'lib/index.js';let source=await readFile(path,'utf8');
const marker='// Focus Workspace: shared creator inspect providers';
const anchor='for (const provider of hostInspectProviders(ctx)) ctx.effect(() => ctx.cordisInspect.register(provider), `tool-cordis: inspect ${provider.manifest.id}`);';
if(!source.includes(marker)) {
  if(source.split(anchor).length!==2)throw Error('Pinned creator provider registration changed; review patch');
  const implementation=(await readFile('plugin/inspect-leases.mjs','utf8')).replace(/^export /gm,'');
  source=source.replace('const name = "tool-cordis";',`${marker}\n${implementation}\nconst name = "tool-cordis";`).replace(anchor,'ctx.effect(() => acquireInspectProviders(ctx.root, () => hostInspectProviders(ctx.root), provider => ctx.root.cordisInspect.register(provider)), "tool-cordis: shared Host inspection");');
  await writeFile(path,source);
}
if(source.split(marker).length!==2||source.includes(anchor))throw Error('Creator compatibility patch verification failed');
