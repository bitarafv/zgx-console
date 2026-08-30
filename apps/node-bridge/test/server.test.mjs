import test from "node:test";
import assert from "node:assert/strict";
process.env.NODE_ENV="test";
const {allowedAdminRead,allowedMutation,allowedTerminalMutation,allowedTerminalRead,externalize,safeAppPath,upstreamHeaders}=await import("../src/server.mjs");
test("only allowlisted mutations pass",()=>{
  assert.equal(allowedMutation("/api/transitions"),true);
  assert.equal(allowedMutation("/api/workloads/noteai/stop"),true);
  assert.equal(allowedMutation("/api/workloads/../../stop"),false);
  assert.equal(allowedMutation("/api/resources"),false);
  assert.equal(allowedMutation("/apps/aml-fraud-agent/api/demo"),true);
  assert.equal(allowedMutation("/apps/aml-fraud-agent/api/cases/case-1/review"),true);
});
test("privileged mutations use Siva's exact loopback origin",()=>{
  const headers=upstreamHeaders(true,Buffer.from("{}"));
  assert.equal(headers.host,"127.0.0.1:18000");
  assert.equal(headers.origin,"http://127.0.0.1:18000");
  assert.equal(headers["content-type"],"application/json");
});
test("public reads retain the public hostname",()=>{
  const headers=upstreamHeaders(false);
  assert.equal(headers.host,"zgxconsole.bncvc.com");
  assert.equal(headers.origin,undefined);
});
test("only allowlisted admin reads pass",()=>{
  assert.equal(allowedAdminRead("/"),true);
  assert.equal(allowedAdminRead("/launch/pending"),true);
  assert.equal(allowedAdminRead("/api/transitions/abc-123"),true);
  assert.equal(allowedAdminRead("/api/transitions/abc-123/events"),true);
  assert.equal(allowedAdminRead("/api/resources"),false);
  assert.equal(allowedAdminRead("/debug"),false);
  assert.equal(allowedAdminRead("/apps/aml-fraud-agent/"),true);
  assert.equal(allowedAdminRead("/apps/aml-fraud-agent/api/cases/case-1"),true);
});
test("rejects application proxy traversal",()=>{
  assert.equal(safeAppPath("/apps/aml-fraud-agent/../secret"),false);
  assert.equal(safeAppPath("/apps/aml-fraud-agent/%2e%2e/secret"),false);
  assert.equal(safeAppPath("/apps/aml-fraud-agent/%2E/secret"),false);
  assert.equal(safeAppPath("/apps/aml-fraud-agent/path with spaces"),false);
});
test("only allows the Hermes browser terminal surface",()=>{
  assert.equal(allowedTerminalRead("/terminal/hermes"),true);
  assert.equal(allowedTerminalRead("/assets/xterm-addon-fit.js"),true);
  assert.equal(allowedTerminalRead("/api/workloads/hermes/download"),true);
  assert.equal(allowedTerminalRead("/api/terminals/hermes/events"),true);
  assert.equal(allowedTerminalMutation("/api/terminals/hermes/sessions"),true);
  assert.equal(allowedTerminalMutation("/api/terminals/hermes/close"),true);
  assert.equal(allowedTerminalRead("/terminal/noteai"),false);
  assert.equal(allowedTerminalRead("/assets/unknown.js"),false);
  assert.equal(allowedTerminalMutation("/api/terminals/noteai/sessions"),false);
  assert.equal(allowedTerminalMutation("/api/terminals/hermes/delete"),false);
});
test("externalizes or redacts browser URLs",()=>{
  const workloads=externalize("/api/workloads",[
    {id:"noteai",browser_url:"http://localhost:8001",external_browser_url:"https://notes.bncvc.com"},
    {id:"dietplan",browser_url:"http://localhost:3001",external_browser_url:null},
  ]);
  assert.equal(workloads[0].browser_url,"https://notes.bncvc.com");
  assert.equal(workloads[1].browser_url,null);
  assert.equal(externalize("/api/transitions/id",{browser_url:"http://localhost:8001"}).browser_url,null);
  assert.equal(externalize("/api/transitions/id",{browser_url:"http://localhost:8005",open_url:"/apps/aml-fraud-agent/"}).open_url,"/apps/aml-fraud-agent/");
});

test("normalizes lifecycle telemetry from Siva",()=>{
  const [valid,invalid]=externalize("/api/workloads",[
    {id:"noteai",browser_url:null,model_residency:"warm-shared",idle_retention:"retained"},
    {id:"dietplan",browser_url:null,model_residency:"hot",idle_retention:"forever"},
  ]);
  assert.equal(valid.model_residency,"warm-shared");
  assert.equal(valid.idle_retention,"retained");
  assert.equal(invalid.model_residency,undefined);
  assert.equal(invalid.idle_retention,undefined);
});
