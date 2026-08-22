import { describe, expect, it } from "vitest";
import { calculateTco } from "./tco";

describe("calculateTco", () => {
  it("uses selected annual hours for cloud and power", () => {
    const result = calculateTco({ hardwarePrice: 6000, watts: 100, licensePerYear: 0, includeLicense: false, cloudHourly: 1, gpuCount: 1, annualHours: 2080, years: 3, electricityRate: 0.15 });
    expect(result.cloudAnnual).toBe(2080);
    expect(result.powerAnnual).toBeCloseTo(31.2);
    expect(result.zgxTotal).toBeCloseTo(6093.6);
  });

  it("reports no break even when operating cost is not avoided", () => {
    const result = calculateTco({ hardwarePrice: 6000, watts: 1000, licensePerYear: 0, includeLicense: false, cloudHourly: 0.01, gpuCount: 1, annualHours: 1000, years: 3, electricityRate: 1 });
    expect(result.breakEvenMonths).toBeNull();
  });
});

