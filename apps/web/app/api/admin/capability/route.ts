import { bridgeLive, isAdmin, runtimeMode } from "@/lib/runtime";
export async function GET(){const admin=await isAdmin();if(!admin)return Response.json({error:"Admin access required"},{status:403,headers:{"cache-control":"no-store"}});const live=await bridgeLive();return Response.json({mode:runtimeMode(),role:"admin",state:live?"live-admin":"static"},{headers:{"cache-control":"no-store"}})}
