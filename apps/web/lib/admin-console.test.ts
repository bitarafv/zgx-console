import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const consoleSource = readFileSync(new URL("../components/ConsoleShell.tsx", import.meta.url), "utf8");
const nodeSource = readFileSync(new URL("../components/NodeDashboard.tsx", import.meta.url), "utf8");

describe("admin console composition", () => {
  it("uses the native dashboard for authenticated admins", () => {
    expect(consoleSource).not.toContain("SivaAdminFrame");
    expect(consoleSource).toContain("<NodeDashboard adminView={adminView} adminBookingData={adminBookingData}/>" );
    expect(nodeSource).toContain("Advanced Siva Diagnostics");
    expect(nodeSource).toContain("<DemoBookingAdmin initialData={adminBookingData}/>" );
  });

  it("passes the authorization state through the shared Device dashboard", () => {
    expect(consoleSource).toContain("adminView={adminView}");
    expect(nodeSource).toContain("disabled={!admin || Boolean(state)}");
  });

  it("keeps Siva diagnostics as an explicit route instead of an iframe", () => {
    expect(nodeSource).toContain('href="/admin/siva"');
    expect(consoleSource).not.toContain("<iframe");
  });
});
