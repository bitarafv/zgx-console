import { describe, expect, it } from "vitest";
import { demoModeUrl, productionModeUrl } from "./demo-mode";

describe("demoModeUrl", () => {
  it("enables demo mode on an application URL", () => {
    expect(demoModeUrl("https://notes.example.com/app")).toBe("https://notes.example.com/app?demo=true");
  });

  it("preserves an existing query and fragment", () => {
    expect(demoModeUrl("https://notes.example.com/app?tenant=demo#compose"))
      .toBe("https://notes.example.com/app?tenant=demo&demo=true#compose");
  });

  it("rejects missing and non-web application URLs", () => {
    expect(demoModeUrl(null)).toBeNull();
    expect(demoModeUrl("#")).toBeNull();
    expect(demoModeUrl("javascript:alert(1)")).toBeNull();
  });
});

describe("productionModeUrl", () => {
  it("explicitly disables demo mode while preserving URL state", () => {
    expect(productionModeUrl("https://qwen.example.com/app?tenant=acme#chat"))
      .toBe("https://qwen.example.com/app?tenant=acme#chat");
  });

  it("rejects missing and non-web application URLs", () => {
    expect(productionModeUrl(null)).toBeNull();
    expect(productionModeUrl("#")).toBeNull();
    expect(productionModeUrl("javascript:alert(1)")).toBeNull();
  });
});
