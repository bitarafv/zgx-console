import { bridgeLive, isAdmin, runtimeMode } from "@/lib/runtime";
export async function GET(){const [live,admin]=await Promise.all([bridgeLive(),isAdmin()]);return Response.json({mode:runtimeMode(),role:admin?"admin":"guest",state:live?(admin?"live-admin":"live-guest"):"static"},{headers:{"cache-control":"no-store"}})}
