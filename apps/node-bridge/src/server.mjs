import http from "node:http";
const host=process.env.ZGX_BRIDGE_HOST??"127.0.0.1", port=Number(process.env.ZGX_BRIDGE_PORT??60372);
const sivaOrigin=new URL(process.env.ZGX_NODE_ORIGIN??"http://127.0.0.1:18000"), bridgeToken=process.env.ZGX_BRIDGE_TOKEN??"", adminSecret=process.env.ZGX_ADMIN_BRIDGE_SECRET??"";
const publicHostname=(process.env.ZGX_PUBLIC_HOSTNAME??"zgxconsole.bncvc.com").replace(/^https?:\/\//,"").split("/")[0];
const publicReads=new Set(["/api/resources","/api/workloads","/api/policy"]), safeId="[A-Za-z0-9-]+";
export function allowedMutation(path){return path==="/api/transitions"||new RegExp(`^/api/workloads/${safeId}/(?:stop|restart|emergency-stop)$`).test(path)}
export function allowedAdminRead(path){return path==="/"||new RegExp(`^/launch/${safeId}$`).test(path)||path==="/api/transitions"||new RegExp(`^/api/transitions/${safeId}(?:/(?:events|report))?$`).test(path)||new RegExp(`^/api/workloads/${safeId}/logs$`).test(path)}
export function externalize(path,value){
 const residencyStates=new Set(["resident","warm-shared","unmapped","unknown"]), retentionStates=new Set(["retained","releasing","released","unknown"]);
 const clean=item=>({...item,browser_url:typeof item.external_browser_url==="string"&&item.external_browser_url.startsWith("https://")?item.external_browser_url:typeof item.browser_url==="string"&&item.browser_url.startsWith("https://")?item.browser_url:null,model_residency:residencyStates.has(item.model_residency)?item.model_residency:undefined,idle_retention:retentionStates.has(item.idle_retention)?item.idle_retention:undefined});
 if(path==="/api/workloads"&&Array.isArray(value))return value.map(clean);
 if(/^\/api\/transitions\//.test(path)&&value&&typeof value==="object")return clean(value);
 return value;
}
function authorized(req){const supplied=req.headers.authorization?.replace(/^Bearer\s+/i,"")??"";return bridgeToken.length>=24&&supplied===bridgeToken}
function adminAuthorized(req){return Boolean(adminSecret)&&req.headers["x-zgx-admin-secret"]===adminSecret}
function json(res,status,value){res.writeHead(status,{"content-type":"application/json","cache-control":"no-store"});res.end(JSON.stringify(value))}
function readBody(req){return new Promise((resolve,reject)=>{const chunks=[];let size=0;req.on("data",chunk=>{size+=chunk.length;if(size>65536)reject(new Error("Body too large"));else chunks.push(chunk)});req.on("end",()=>resolve(Buffer.concat(chunks)));req.on("error",reject)})}
export function upstreamHeaders(isMutation,body){
 const localHost=sivaOrigin.host;
 return {host:isMutation?localHost:publicHostname,...(isMutation?{origin:`${sivaOrigin.protocol}//${localHost}`}:{}) ,...(body?{"content-type":"application/json","content-length":String(body.length)}:{})};
}
async function proxy(req,res,path){
 const isPublicRead=req.method==="GET"&&publicReads.has(path), isAdminRead=req.method==="GET"&&allowedAdminRead(path), isMutation=req.method==="POST"&&allowedMutation(path);
 if(!isPublicRead&&!isAdminRead&&!isMutation)return json(res,404,{error:"Route not allowed"});
 if(!authorized(req))return json(res,401,{error:"Bridge authentication required"});
 if((isAdminRead||isMutation)&&!adminAuthorized(req))return json(res,403,{error:"Admin authorization required"});
 try{
  const body=isMutation?await readBody(req):undefined;
  const upstreamReq=http.request({hostname:sivaOrigin.hostname,port:sivaOrigin.port||80,path,method:req.method,headers:upstreamHeaders(isMutation,body)},upstream=>{
   const contentType=upstream.headers["content-type"]??"application/octet-stream";
   const sanitize=contentType.includes("application/json")&&(path==="/api/workloads"||/^\/api\/transitions\//.test(path));
   if(!sanitize){res.writeHead(upstream.statusCode??502,{"content-type":contentType,"cache-control":"no-store"});upstream.pipe(res);return}
   const chunks=[];upstream.on("data",chunk=>chunks.push(chunk));upstream.on("end",()=>{try{json(res,upstream.statusCode??502,externalize(path,JSON.parse(Buffer.concat(chunks).toString("utf8"))))}catch{json(res,502,{error:"Invalid Siva response"})}});
  });
  upstreamReq.on("error",()=>json(res,503,{error:"Siva runtime unavailable"}));
  if(!path.endsWith("/events"))upstreamReq.setTimeout(12000,()=>upstreamReq.destroy(new Error("Siva request timed out")));
  if(body)upstreamReq.end(body);else upstreamReq.end();
 }catch{json(res,503,{error:"Siva runtime unavailable"})}
}
if(process.env.NODE_ENV!=="test")http.createServer((req,res)=>{const path=new URL(req.url??"/",`http://${req.headers.host??"localhost"}`).pathname;if(req.method==="GET"&&path==="/health")return json(res,200,{status:"live"});void proxy(req,res,path)}).listen(port,host,()=>console.log(`ZGX node bridge listening on http://${host}:${port}`));
