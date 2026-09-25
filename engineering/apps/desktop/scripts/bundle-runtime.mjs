/** Bundle the verified build-time Node binary; never depend on the user's PATH. */
import {copyFile,mkdir,writeFile,readFile,chmod} from 'node:fs/promises';
import {createHash} from 'node:crypto';
if(process.version!=='v24.19.0'||process.platform!=='darwin'||process.arch!=='arm64')throw Error('Build requires Node 24.19.0 on macOS arm64');
await mkdir('runtime',{recursive:true});await copyFile(process.execPath,'runtime/node');await chmod('runtime/node',0o755);
await writeFile('runtime/manifest.json',JSON.stringify({node:process.version,platform:process.platform,arch:process.arch,sha256:createHash('sha256').update(await readFile('runtime/node')).digest('hex')},null,2)+'\n');
