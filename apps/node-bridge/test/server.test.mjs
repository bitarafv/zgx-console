import test from "node:test"; import assert from "node:assert/strict"; process.env.NODE_ENV="test";
const {allowedMutation}=await import("../src/server.mjs");
test("only allowlisted mutations pass",()=>{assert.equal(allowedMutation("/api/transitions"),true);assert.equal(allowedMutation("/api/workloads/noteai/stop"),true);assert.equal(allowedMutation("/api/workloads/../../stop"),false);assert.equal(allowedMutation("/api/resources"),false)});
