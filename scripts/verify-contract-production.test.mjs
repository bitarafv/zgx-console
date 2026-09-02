import assert from "node:assert/strict";
import test from "node:test";

import {
  CONTRACT_ORIGIN,
  verifyContractProduction,
} from "./verify-contract-production.mjs";

const env = {
  CF_ACCESS_CLIENT_ID: "test-id",
  CF_ACCESS_CLIENT_SECRET: "test-secret",
};

function response(body, init, path = "/") {
  const result = new Response(body, init);
  Object.defineProperty(result, "url", {
    value: new URL(path, CONTRACT_ORIGIN).href,
  });
  return result;
}

test("verifies anonymous protection, authenticated page, and health", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) return response("", { status: 302 });
    if (calls.length === 2) {
      return response("<title>Contract & Legal Auditor</title>", { status: 200 });
    }
    return response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }, "/health");
  };

  const result = await verifyContractProduction({ fetchImpl, env });

  assert.deepEqual(result, {
    anonymousStatus: 302,
    pageStatus: 200,
    healthStatus: 200,
    hostname: "contract.bncvc.com",
  });
  assert.equal(calls[0].options.headers, undefined);
  assert.equal(calls[1].options.headers["CF-Access-Client-Id"], "test-id");
  assert.equal(calls[1].options.headers["CF-Access-Client-Secret"], "test-secret");
  assert.equal(calls[1].options.redirect, "manual");
});

test("fails if anonymous traffic bypasses Access", async () => {
  await assert.rejects(
    verifyContractProduction({
      env,
      fetchImpl: async () => response("public", { status: 200 }),
    }),
    /must remain Access-protected/,
  );
});

test("rejects an authenticated Access login page", async () => {
  let call = 0;
  await assert.rejects(
    verifyContractProduction({
      env,
      fetchImpl: async () => {
        call += 1;
        if (call === 1) return response("", { status: 302 });
        return response("<title>Cloudflare Access</title>", { status: 200 });
      },
    }),
    /Cloudflare Access login page/,
  );
});

test("rejects redirects, query parameters, and unexpected hosts", async () => {
  for (const [url, message] of [
    ["https://login.example.com/", /left the approved host/],
    ["https://contract.bncvc.com/?demo=true", /must not use query parameters/],
  ]) {
    let call = 0;
    await assert.rejects(
      verifyContractProduction({
        env,
        fetchImpl: async () => {
          call += 1;
          if (call === 1) return response("", { status: 302 });
          return response("", { status: 302 }, url);
        },
      }),
      message,
    );
  }
});
