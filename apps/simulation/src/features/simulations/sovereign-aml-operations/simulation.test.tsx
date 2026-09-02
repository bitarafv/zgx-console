import { describe,expect,it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const source=readFileSync(resolve(process.cwd(),"src/features/simulations/sovereign-aml-operations/simulation.tsx"),"utf8");
describe("Sovereign AML experience",()=>{it("is deterministic and model-free",()=>{for(const label of ["Ingestion Triage (4B)","Rule Escalation","Forensic Chain-of-Thought (70B)","FinCEN SAR Generation"])expect(source).toContain(label);expect(source).toContain("models unloaded");expect(source).not.toContain("fetch(")})});
