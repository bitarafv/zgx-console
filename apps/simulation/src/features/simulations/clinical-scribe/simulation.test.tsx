import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClinicalScribeSimulation } from "./simulation";
import type { Demo } from "@/lib/types";

const demo: Demo = {
  slug: "clinical-scribe", name: "Clinical Scribe", industry: "Healthcare", archetype: "copilot",
  problem: "Documentation burden", value: "Draft notes", workload: "Speech", concurrency: "Individual", dataSize: "Small",
  prompts: [], outcomes: [], personas: [], questions: [], painPoints: [], objections: [], platforms: ["nano"],
};

const advance = (milliseconds: number) => act(() => vi.advanceTimersByTime(milliseconds));
const renderSimulation = () => render(<ClinicalScribeSimulation demo={demo} platform="nano"/>);

describe("ClinicalScribeSimulation", () => {
  beforeEach(() => { vi.useFakeTimers(); Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } }); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("starts and progressively reveals the transcript", () => {
    renderSimulation();
    fireEvent.click(screen.getByRole("button", { name: "Start consultation" }));
    expect(screen.getByText(/Listening/)).toBeInTheDocument();
    advance(550);
    expect(screen.getByText(/Thanks for agreeing/)).toBeInTheDocument();
    expect(screen.queryByText(/dry cough and a blocked nose/)).not.toBeInTheDocument();
    advance(550);
    expect(screen.getByText(/dry cough and a blocked nose/)).toBeInTheDocument();
  });

  it("pauses and resumes without revealing lines while paused", () => {
    renderSimulation();
    fireEvent.click(screen.getByRole("button", { name: "Start consultation" }));
    advance(550);
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    advance(2000);
    expect(screen.queryByText(/dry cough and a blocked nose/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    advance(550);
    expect(screen.getByText(/dry cough and a blocked nose/)).toBeInTheDocument();
  });

  it("generates, switches templates, edits, and copies a note", async () => {
    renderSimulation();
    fireEvent.click(screen.getByRole("button", { name: "Start consultation" }));
    advance(550);
    fireEvent.click(screen.getByRole("button", { name: "Finish consultation" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate note" }));
    expect(screen.getByText("Generating draft note")).toBeInTheDocument();
    advance(450); advance(450); advance(450);
    const editor = screen.getByRole("textbox", { name: "Editable clinical note" });
    expect((editor as HTMLTextAreaElement).value).toContain("SUBJECTIVE");
    fireEvent.change(screen.getByLabelText("Consultation template"), { target: { value: "general" } });
    expect((editor as HTMLTextAreaElement).value).toContain("REASON FOR CONSULTATION");
    fireEvent.change(editor, { target: { value: "Clinician-edited draft" } });
    expect(editor).toHaveValue("Clinician-edited draft");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Copy note" })));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Clinician-edited draft");
  });

  it("handles an empty transcript", () => {
    renderSimulation();
    fireEvent.click(screen.getByRole("button", { name: "Show empty transcript" }));
    expect(screen.getByText("No transcript to summarize")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start over" })).toBeEnabled();
  });

  it("offers a safe retry after a simulated error", () => {
    renderSimulation();
    fireEvent.click(screen.getByRole("button", { name: "Start consultation" }));
    advance(550);
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(screen.getByRole("button", { name: "Simulate next error" }));
    fireEvent.click(screen.getByRole("button", { name: "Generate note" }));
    advance(450); advance(450);
    expect(screen.getByText("Draft generation was interrupted")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry generation" }));
    advance(450); advance(450); advance(450);
    expect(screen.getByRole("textbox", { name: "Editable clinical note" })).toBeInTheDocument();
  });

  it("reset restores the exact initial state and exposes keyboard-native controls", () => {
    renderSimulation();
    const start = screen.getByRole("button", { name: "Start consultation" });
    expect(start.tagName).toBe("BUTTON");
    fireEvent.keyDown(start, { key: "Enter" });
    fireEvent.click(start);
    advance(550);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("button", { name: "Start consultation" })).toBeInTheDocument();
    expect(screen.getByLabelText("Consultation template")).toHaveValue("soap");
    expect(screen.getByText("00:00 · Ready")).toBeInTheDocument();
    expect(screen.queryByText(/Thanks for agreeing/)).not.toBeInTheDocument();
  });
});
