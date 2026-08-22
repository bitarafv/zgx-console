import test from "node:test";
import assert from "node:assert/strict";
process.env.NODE_ENV="test";
const {allowedAdminRead,allowedMutation,externalize}=await import("../src/server.mjs");
test("only allowlisted mutations pass",()=>{
  assert.equal(allowedMutation("/api/transitions"),true);
  assert.equal(allowedMutation("/api/workloads/noteai/stop"),true);
  assert.equal(allowedMutation("/api/workloads/../../stop"),false);
  assert.equal(allowedMutation("/api/resources"),false);
});
test("only allowlisted admin reads pass",()=>{
  assert.equal(allowedAdminRead("/"),true);
  assert.equal(allowedAdminRead("/launch/pending"),true);
  assert.equal(allowedAdminRead("/api/transitions/abc-123"),true);
  assert.equal(allowedAdminRead("/api/transitions/abc-123/events"),true);
  assert.equal(allowedAdminRead("/api/resources"),false);
  assert.equal(allowedAdminRead("/debug"),false);
});
test("externalizes or redacts browser URLs",()=>{
  const workloads=externalize("/api/workloads",[
    {id:"noteai",browser_url:"http://localhost:8001",external_browser_url:"https://notes.bncvc.com"},
    {id:"dietplan",browser_url:"http://localhost:3001",external_browser_url:null},
  ]);
  assert.equal(workloads[0].browser_url,"https://notes.bncvc.com");
  assert.equal(workloads[1].browser_url,null);
  assert.equal(externalize("/api/transitions/id",{browser_url:"http://localhost:8001"}).browser_url,null);
});
