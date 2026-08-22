import { describe, expect, it } from "vitest";
import { industries, platformIndustries } from "@/data/catalog";
import { furyExperienceConfigs } from "@/features/simulations/fury-experiences/config";
import { getCompetitiveLandscape, getWorkloadStack, hardwareProfiles } from "@/data/technology";

describe("customer-facing configuration", () => {
  const demos = industries.flatMap((industry) => industry.demos);

  it("resolves a technology stack and competitive landscape for every demo", () => {
    for (const demo of demos) {
      expect(getWorkloadStack(demo.archetype).models.length).toBeGreaterThan(0);
      expect(getCompetitiveLandscape(demo.slug, demo.archetype).products.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps hardware and market content sourced and review-dated", () => {
    for (const profile of Object.values(hardwareProfiles)) {
      expect(profile.sourceUrl).toMatch(/^https:\/\//);
      expect(profile.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    for (const demo of demos) {
      const landscape = getCompetitiveLandscape(demo.slug, demo.archetype);
      expect(landscape.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const product of landscape.products) expect(product.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it("retains a complete discussion guide for every demo", () => {
    for (const demo of demos) {
      expect(demo.personas.length).toBeGreaterThan(0);
      expect(demo.questions.length).toBeGreaterThan(0);
      expect(demo.painPoints.length).toBeGreaterThan(0);
      expect(demo.objections.length).toBeGreaterThan(0);
    }
  });

  it("gives every platform demo an explicit platform identity", () => {
    for (const platform of ["nano", "fury"] as const) {
      for (const demo of platformIndustries[platform].flatMap((industry) => industry.demos)) {
        expect(demo.platforms).toEqual([platform]);
        expect(demo.experienceScope?.[platform]).toBeTruthy();
      }
    }
  });

  it("provides a configured departmental workflow for every Fury demo", () => {
    for (const demo of platformIndustries.fury.flatMap((industry) => industry.demos)) {
      expect(furyExperienceConfigs[demo.slug]?.services.length).toBeGreaterThanOrEqual(4);
      expect(furyExperienceConfigs[demo.slug]?.queue.length).toBeGreaterThanOrEqual(3);
    }
  });
});
