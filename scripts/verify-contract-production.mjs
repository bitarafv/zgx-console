#!/usr/bin/env node
import { pathToFileURL } from "node:url";

export const CONTRACT_ORIGIN = "https://contract.bncvc.com";

function required(env, name) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function assertContractUrl(response, path) {
  const url = new URL(response.url || new URL(path, CONTRACT_ORIGIN));
  if (url.protocol !== "https:" || url.hostname !== "contract.bncvc.com") {
    throw new Error(`Contract verification left the approved host: ${url.origin}`);
  }
  if (url.search) throw new Error("Contract verification must not use query parameters");
}

function accessHeaders(env) {
  return {
    "CF-Access-Client-Id": required(env, "CF_ACCESS_CLIENT_ID"),
    "CF-Access-Client-Secret": required(env, "CF_ACCESS_CLIENT_SECRET"),
  };
}

export async function verifyContractProduction({
  fetchImpl = fetch,
  env = process.env,
} = {}) {
  const anonymous = await fetchImpl(`${CONTRACT_ORIGIN}/`, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  if (![301, 302, 303, 307, 308, 401, 403].includes(anonymous.status)) {
    throw new Error(
      `Anonymous Contract request must remain Access-protected; received HTTP ${anonymous.status}`,
    );
  }

  const headers = accessHeaders(env);
  const page = await fetchImpl(`${CONTRACT_ORIGIN}/`, {
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  assertContractUrl(page, "/");
  if (page.status !== 200) {
    throw new Error(`Authenticated Contract page returned HTTP ${page.status}`);
  }
  const html = await page.text();
  if (/cloudflareaccess\.com|cloudflare access/i.test(html)) {
    throw new Error("Authenticated Contract request returned a Cloudflare Access login page");
  }
  if (!/<title>Contract (?:&|&amp;) Legal Auditor<\/title>/i.test(html)) {
    throw new Error("Authenticated Contract page marker was not found");
  }

  const health = await fetchImpl(`${CONTRACT_ORIGIN}/health`, {
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  assertContractUrl(health, "/health");
  if (health.status !== 200) {
    throw new Error(`Authenticated Contract health check returned HTTP ${health.status}`);
  }
  let payload;
  try {
    payload = await health.json();
  } catch {
    throw new Error("Authenticated Contract health check returned invalid JSON");
  }
  if (payload?.status !== "ok") {
    throw new Error("Authenticated Contract health check did not report status ok");
  }

  return {
    anonymousStatus: anonymous.status,
    pageStatus: page.status,
    healthStatus: health.status,
    hostname: "contract.bncvc.com",
  };
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === invokedPath) {
  verifyContractProduction()
    .then(result => {
      console.log(
        `Contract production verification passed (anonymous ${result.anonymousStatus}, authenticated page ${result.pageStatus}, health ${result.healthStatus}).`,
      );
    })
    .catch(error => {
      console.error(`Contract production verification failed: ${error.message}`);
      process.exitCode = 1;
    });
}
