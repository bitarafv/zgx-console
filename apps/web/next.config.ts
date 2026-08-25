import path from "node:path";
import type { NextConfig } from "next";
const simulationOrigin=process.env.ZGX_SIMULATION_ORIGIN??"http://127.0.0.1:60371";
const analyticsOrigin=process.env.ZGX_ANALYTICS_ORIGIN??"http://127.0.0.1:60380";
const nextConfig:NextConfig={poweredByHeader:false,reactStrictMode:true,outputFileTracingRoot:path.join(process.cwd(),"../.."),turbopack:{root:path.join(process.cwd(),"../..")},transpilePackages:["@zgx/contracts"],async rewrites(){return[{source:"/api/telemetry/event",destination:`${analyticsOrigin}/api/telemetry/event`},{source:"/simulation",destination:`${simulationOrigin}/simulation`},{source:"/simulation/:path*",destination:`${simulationOrigin}/simulation/:path*`}]} };
export default nextConfig;
