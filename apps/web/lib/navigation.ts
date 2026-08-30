export type ConsoleTab = "simulation" | "node" | "insights" | "tco";

const hashes: Record<ConsoleTab, string> = {
  simulation: "experiences",
  node: "mvp-dashboard",
  insights: "enterprise-ai-insights",
  tco: "tco-calculator",
};
const legacy: Record<string, ConsoleTab> = { simulation: "simulation", node: "node", insights: "insights", tco: "tco" };

export function normalizeSimulationPath(value: string | undefined): string {
  if (!value) return "/";
  let path = value.split("?")[0].split("#")[0];
  if (path.startsWith("/simulation/")) path = path.slice("/simulation".length);
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("..")) return "/";
  return path.replace(/\/{2,}/g, "/");
}

export function consoleHash(tab: ConsoleTab, simulationPath = "/"): string {
  if (tab !== "simulation") return `#${hashes[tab]}`;
  const path = normalizeSimulationPath(simulationPath);
  return path === "/" ? "#experiences" : `#experiences=${encodeURI(path)}`;
}

export function parseConsoleHash(hash: string): { tab: ConsoleTab; simulationPath: string } {
  const value = hash.replace(/^#/, "");
  if (value.startsWith("experiences=")) return { tab: "simulation", simulationPath: normalizeSimulationPath(decodeURI(value.slice(12))) };
  if (value.startsWith("demo-display=")) return { tab: "simulation", simulationPath: normalizeSimulationPath(decodeURI(value.slice(13))) };
  const matched = (Object.entries(hashes) as [ConsoleTab, string][]).find(([, slug]) => slug === value);
  if (matched) return { tab: matched[0], simulationPath: "/" };
  if (legacy[value]) return { tab: legacy[value], simulationPath: "/" };
  return { tab: "simulation", simulationPath: "/" };
}
