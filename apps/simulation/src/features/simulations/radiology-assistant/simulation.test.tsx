import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Demo } from "@/lib/types";
import { RadiologyAssistantSimulation } from "./simulation";

const demo = { name: "Radiology Assistant" } as Demo;

function advance(ms: number) { act(() => { vi.advanceTimersByTime(ms); }); }
function open(patient = "Morgan, Avery") { fireEvent.click(screen.getByText(patient)); advance(400); }
function analyze() { fireEvent.click(screen.getByRole("button", { name: "Start AI analysis" })); advance(1600); }

describe("Radiology Assistant simulation", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { cleanup(); vi.runOnlyPendingTimers(); vi.useRealTimers(); });

  it("renders and filters the deterministic worklist with keyboard study selection", () => {
    render(<RadiologyAssistantSimulation demo={demo} platform="nano"/>);
    expect(screen.getByText("Chest radiography · 3 unread")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Priority"), { target: { value: "STAT" } });
    expect(screen.getByText("Morgan, Avery")).toBeInTheDocument();
    expect(screen.queryByText("Lee, Jordan")).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByText("Morgan, Avery").closest("tr")!, { key: "Enter" });
    advance(400);
    expect(screen.getByRole("button", { name: "Start AI analysis" })).toBeInTheDocument();
  });

  it("progresses analysis, reprioritizes the urgent case, and supports viewer controls", () => {
    render(<RadiologyAssistantSimulation demo={demo} platform="nano"/>); open();
    fireEvent.click(screen.getByRole("button", { name: "Start AI analysis" }));
    expect(screen.getByText("Processing synthetic images")).toBeInTheDocument();
    advance(1600);
    expect(screen.getByText("Suspected focal airspace opacity")).toBeInTheDocument();
    expect(screen.getByTestId("ai-overlay")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Toggle AI overlay" }));
    expect(screen.queryByTestId("ai-overlay")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByTestId("zoom-value")).toHaveTextContent("125%");
    fireEvent.change(screen.getByLabelText("Brightness"), { target: { value: "120" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset view" }));
    expect(screen.getByTestId("zoom-value")).toHaveTextContent("100%");
    fireEvent.click(screen.getByRole("button", { name: "Return to worklist" }));
    const row = screen.getByText("Morgan, Avery").closest("tr")!;
    expect(within(row).getByText("Attention")).toBeInTheDocument();
  });

  it.each([
    ["Confirm for draft", "New focal right upper lung airspace opacity."],
    ["Reject", "No simulated acute cardiopulmonary finding."],
    ["Uncertain", "Indeterminate right upper lung zone opacity."],
  ])("reflects %s disposition in the generated report", (action, expected) => {
    render(<RadiologyAssistantSimulation demo={demo} platform="nano"/>); open(); analyze();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(action, "i") }));
    fireEvent.click(screen.getByRole("button", { name: "Generate structured draft" }));
    const editor = screen.getByLabelText("Draft report editor");
    expect((editor as HTMLTextAreaElement).value).toContain(expected);
    fireEvent.change(editor, { target: { value: "Edited report text" } });
    expect(editor).toHaveValue("Edited report text");
    fireEvent.click(screen.getByText("Compare original findings context"));
    expect(screen.getByText(/Original scripted context/)).toBeInTheDocument();
  });

  it("handles the no-finding case and generates a review draft", () => {
    render(<RadiologyAssistantSimulation demo={demo} platform="nano"/>); open("Patel, Riley"); analyze();
    expect(screen.getByText("No suspected finding")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Generate no-finding draft" }));
    expect((screen.getByLabelText("Draft report editor") as HTMLTextAreaElement).value).toContain("No simulated acute cardiopulmonary finding.");
  });

  it("recovers from a simulated processing error and fully resets", () => {
    render(<RadiologyAssistantSimulation demo={demo} platform="nano"/>);
    fireEvent.click(screen.getByRole("button", { name: "Load recoverable error scenario" })); advance(400); analyze();
    expect(screen.getByText("Simulated processing error")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry analysis" })); advance(1600);
    expect(screen.getByText("Suspected focal airspace opacity")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("Chest radiography · 3 unread")).toBeInTheDocument();
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
  });
});
