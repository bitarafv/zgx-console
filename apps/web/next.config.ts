import path from "node:path";
import type { NextConfig } from "next";
const simulationOrigin=process.env.ZGX_SIMULATION_ORIGIN??"http://127.0.0.1:60371";
const analyticsOrigin=process.env.ZGX_ANALYTICS_ORIGIN??"http://127.0.0.1:60380";
const nextConfig:NextConfig={poweredByHeader:false,skipTrailingSlashRedirect:true,env:{NEXT_PUBLIC_DEFAULT_ELECTRICITY_RATE:process.env.DEFAULT_ELECTRICITY_RATE??"0.15",NEXT_PUBLIC_DEFAULT_SOC_POWER_WATTS:process.env.DEFAULT_SOC_POWER_WATTS??"35.0"},reactStrictMode:true,outputFileTracingRoot:path.join(process.cwd(),"../.."),turbopack:{root:path.join(process.cwd(),"../..")},transpilePackages:["@zgx/contracts"],async rewrites(){return[{source:"/api/telemetry/event",destination:`${analyticsOrigin}/api/telemetry/event`},{source:"/simulation",destination:`${simulationOrigin}/simulation`},{source:"/simulation/:path*",destination:`${simulationOrigin}/simulation/:path*`}]} };
export default nextConfig;
