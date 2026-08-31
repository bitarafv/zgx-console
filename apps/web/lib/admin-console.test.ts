import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const consoleSource = readFileSync(new URL("../components/ConsoleShell.tsx", import.meta.url), "utf8");
const sivaSource = readFileSync(new URL("../components/SivaAdminFrame.tsx", import.meta.url), "utf8");

describe("admin console composition", () => {
  it("restores Siva and booking management for an authenticated admin", () => {
    expect(consoleSource).toContain('import { SivaAdminFrame } from "./SivaAdminFrame"');
    expect(consoleSource).toContain('import { DemoBookingAdmin } from "./DemoBookingAdmin"');
    expect(consoleSource).toContain("adminView?<><SivaAdminFrame/><DemoBookingAdmin initialData={adminBookingData}/></>:<NodeDashboard/>");
  });

  it("keeps the public Device surface on the read-only dashboard", () => {
    expect(consoleSource).toContain(":<NodeDashboard/>");
    expect(consoleSource).not.toContain("<NodeDashboard adminView={adminView}");
  });

  it("preserves Siva connection checking, retry, and iframe states", () => {
    expect(sivaSource).toContain('fetch("/admin/siva/api/policy", { cache: "no-store" })');
    expect(sivaSource).toContain('setState("unavailable")');
    expect(sivaSource).toContain('setState("checking")');
    expect(sivaSource).toContain('<iframe src="/admin/siva"');
  });
});
