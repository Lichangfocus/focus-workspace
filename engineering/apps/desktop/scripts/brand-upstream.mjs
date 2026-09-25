/** Brand the pinned upstream hero copy until DSH exposes a headline slot. */
import {readFile,writeFile} from 'node:fs/promises';
const root='node_modules/@deepseek-ai/dsh-client-ui-conversation/';
const pkg=JSON.parse(await readFile(root+'package.json','utf8'));
if(pkg.version!=='0.1.6-alpha.2')throw Error('Review Focus branding for the new DSH Client version');
const file=root+'lib/client.js';let source=await readFile(file,'utf8');
for(const text of ['探索未至之境','Into the Unknown'])source=source.replace(`"hero.headline": "${text}"`,'"hero.headline": "think different"');
if(source.split('"hero.headline": "think different"').length!==3)throw Error('Expected exactly two branded hero translations');
await writeFile(file,source);
