/** Deterministic stdio protocol fixture, never installed into the user account. */
import {createInterface} from 'node:readline';
for await (const line of createInterface({input:process.stdin})){
  const message=JSON.parse(line);if(message.id===undefined)continue;
  let result;
  switch(message.method){
    case 'initialize':result={protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:'workbench-test',version:'1.0.0'}};break;
    case 'ping':result={};break;
    case 'tools/list':result={tools:[{name:'ping',description:'Local validation tool',inputSchema:{type:'object',properties:{}}}]};break;
    case 'tools/call':result={content:[{type:'text',text:'workbench-mcp-ok'}]};break;
    default:process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:message.id,error:{code:-32601,message:'Unknown method'}})+'\n');continue;
  }
  process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:message.id,result})+'\n');
}
