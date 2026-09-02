import { spawn } from "node:child_process";
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const common = { stdio: "inherit", shell: false };
console.log("ZGX Console local: http://localhost:60370");
console.log("Demo Display direct: http://localhost:60371/simulation");
console.log("Public tunnel: https://zgxconsole.bncvc.com");
const children = [
  spawn(npm, ["--prefix", "apps/simulation", "run", "dev"], { ...common, env: { ...process.env, NEXT_PUBLIC_BASE_PATH: "/simulation" } }),
  spawn(npm, ["--prefix", "apps/web", "run", "dev"], { ...common, env: { ...process.env, ZGX_RUNTIME_MODE: "mock", ZGX_SIMULATION_ORIGIN: "http://127.0.0.1:60371", NEXT_PUBLIC_ZGX_SIMULATION_URL: "/simulation" } }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill("SIGTERM");
  setTimeout(() => process.exit(code), 250).unref();
}
for (const child of children) {
  child.on("error", (error) => { console.error(error.message); stop(1); });
  child.on("exit", (code, signal) => { if (!stopping) stop(signal ? 1 : (code ?? 1)); });
}
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
