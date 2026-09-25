import './patch-creator.mjs';
/** Compile the out-of-tree client factory consumed by the official Web module loader. */
import './brand-upstream.mjs';
import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
await build({entryPoints:['plugin/src/client.tsx'],bundle:true,format:'cjs',platform:'browser',target:'chrome136',external:['react'],write:true,outfile:'plugin/client.js',jsx:'transform',loader:{'.css':'text'},define:{'process.env.NODE_ENV':'"production"'},banner:{js:'window.__ModuleLoader__.load({id:"@dsh-workbench/harness-ui",factory:(require)=>{var module={exports:{}};var exports=module.exports;'},footer:{js:'return module.exports;}});'}});
console.log('Focus Workspace client compiled');
