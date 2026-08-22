import { describe, expect, it } from "vitest";
import { parseStoredSelection } from "./selection";

describe("stored device selection", () => {
  it("migrates the legacy count-bearing shape", () => {
    expect(parseStoredSelection('{"platform":"nano","count":16}')).toEqual({ platform: "nano" });
  });
  it("rejects invalid and malformed selections", () => {
    expect(parseStoredSelection('{"platform":"unknown"}')).toBeUndefined();
    expect(parseStoredSelection("broken")).toBeUndefined();
  });
});
