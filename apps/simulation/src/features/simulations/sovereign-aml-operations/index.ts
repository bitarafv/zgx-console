import type { SimulationModule } from "../contracts";
import { competitive,discussion,workload } from "./content";
import { SovereignAmlSimulation } from "./simulation";
const simulationModule:SimulationModule={platform:"nano",slug:"sovereign-aml-operations",name:"Sovereign AML Operations",industrySlug:"financial-services",version:1,Component:SovereignAmlSimulation,content:{competitive,discussion,workload},validation:{supportsReset:true,states:["initial","processing","success","empty","error"],reviewedAt:"2026-08-30"}};
export default simulationModule;
