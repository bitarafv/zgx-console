import { describe, expect, it } from "vitest";
import { schedulerActivity } from "./scheduler-activity";
import type { DemoBooking } from "./bookings-types";
import type { Workload } from "./types";

const workload = (ready: boolean): Workload => ({ id: "dossierai", name: "DossierAI", active: ready, description: "", browser_url: null, model_names: [], intelligence_services: [], expected_cold_load_seconds: 600, runtime_status: { ready } });
const booking = (values: Partial<DemoBooking>): DemoBooking => ({ id: "guest", name: "Guest", email: "guest@example.com", workloadId: "dossierai", workloadName: "DossierAI", start: "2026-08-30T01:00:00Z", end: "2026-08-30T01:15:00Z", blockedUntil: "2026-08-30T01:30:00Z", timezone: "UTC", status: "approved", createdAt: "2026-08-29T00:00:00Z", updatedAt: "2026-08-29T00:00:00Z", ...values });

describe("scheduled guest activity", () => {
  it("reports loading, running, and cleanup without exposing booking identity", () => {
    expect(schedulerActivity(workload(false), [booking({ lifecycleAction: "launching" })])).toEqual({ state: "loading" });
    expect(schedulerActivity(workload(true), [booking({ launchedAt: "2026-08-30T00:45:00Z" })])).toEqual({ state: "running" });
    expect(schedulerActivity(workload(true), [booking({ lifecycleAction: "stopping", launchedAt: "2026-08-30T00:45:00Z" })])).toEqual({ state: "cleaning_up" });
  });

  it("does not label workloads without an active scheduled booking", () => {
    expect(schedulerActivity(workload(true), [])).toBeNull();
    expect(schedulerActivity(workload(true), [booking({ status: "cancelled" })])).toBeNull();
  });
});
