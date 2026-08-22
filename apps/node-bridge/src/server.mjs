import http from "node:http";
const host=process.env.ZGX_BRIDGE_HOST??"127.0.0.1", port=Number(process.env.ZGX_BRIDGE_PORT??60372);
const sivaOrigin=process.env.ZGX_NODE_ORIGIN??"http://127.0.0.1:18000", bridgeToken=process.env.ZGX_BRIDGE_TOKEN??"", adminSecret=process.env.ZGX_ADMIN_BRIDGE_SECRET??"";
const reads=new Set(["/api/resources","/api/workloads","/api/policy"]);
export function allowedMutation(path){return path==="/api/transitions"||/^\/api\/workloads\/[a-z0-9-]+\/stop$/.test(path)}
function authorized(req){const supplied=req.headers.authorization?.replace(/^Bearer\s+/i,"")??"";return bridgeToken.length>=24&&supplied===bridgeToken}
function json(res,status,value){res.writeHead(status,{"content-type":"application/json","cache-control":"no-store"});res.end(JSON.stringify(value))}
function readBody(req){return new Promise((resolve,reject)=>{const chunks=[];let size=0;req.on("data",chunk=>{size+=chunk.length;if(size>65536)reject(new Error("Body too large"));else chunks.push(chunk)});req.on("end",()=>resolve(Buffer.concat(chunks)));req.on("error",reject)})}
async function proxy(req,res,path){
 const isRead=req.method==="GET"&&reads.has(path), isMutation=req.method==="POST"&&allowedMutation(path);
 if(!isRead&&!isMutation)return json(res,404,{error:"Route not allowed"});
 if(!authorized(req))return json(res,401,{error:"Bridge authentication required"});
 if(isMutation&&(!adminSecret||req.headers["x-zgx-admin-secret"]!==adminSecret))return json(res,403,{error:"Admin authorization required"});
 try{const body=isMutation?await readBody(req):undefined;const upstream=await fetch(new URL(path,sivaOrigin),{method:req.method,body,signal:AbortSignal.timeout(8000),headers:body?{"content-type":"application/json"}:undefined});res.writeHead(upstream.status,{"content-type":upstream.headers.get("content-type")??"application/json","cache-control":"no-store"});res.end(await upstream.text())}catch{json(res,503,{error:"Siva runtime unavailable"})}
}
if(process.env.NODE_ENV!=="test")http.createServer((req,res)=>{const path=new URL(req.url??"/",`http://${req.headers.host??"localhost"}`).pathname;if(req.method==="GET"&&path==="/health")return json(res,200,{status:"live"});void proxy(req,res,path)}).listen(port,host,()=>console.log(`ZGX node bridge listening on http://${host}:${port}`));
