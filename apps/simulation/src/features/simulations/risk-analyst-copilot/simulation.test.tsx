import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDemo } from "@/data/catalog";
import { RiskAnalystSimulation } from "./simulation";

const demo = getDemo("risk-analyst-copilot")!;
const renderSimulation = () => render(<RiskAnalystSimulation demo={demo}/>);
const finish = () => act(() => vi.advanceTimersByTime(400));

describe("Risk Analyst Copilot simulation", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("renders the morning overview and selects an alert", () => {
    renderSimulation();
    expect(screen.getByText("$4.812bn")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Asteron exposure nearing threshold"));
    expect(screen.getAllByText("$184m").length).toBeGreaterThan(0);
  });

  it("generates a deterministic cited explanation", () => {
    renderSimulation();
    fireEvent.click(screen.getByText("Why did this limit breach occur?"));
    expect(screen.getByText("Reviewing approved evidence…")).toBeInTheDocument();
    finish();
    expect(screen.getByText("Facts")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Inspect 3 cited sources"));
    expect(screen.getByText("Internal Concentration Risk Policy")).toBeInTheDocument();
  });

  it("filters positions and exposes the empty state", () => {
    renderSimulation();
    fireEvent.change(screen.getByLabelText("Search positions"), { target: { value: "no such position" } });
    expect(screen.getByText("No matching positions. Clear or change the filters.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search positions"), { target: { value: "Kestrel" } });
    expect(screen.getByText("Kestrel Industrial Finance 5.2")).toBeInTheDocument();
  });

  it("runs a configured scenario and shows contributors", () => {
    renderSimulation();
    fireEvent.click(screen.getByText("Scenario lab"));
    fireEvent.change(screen.getByRole("slider", { name: "Credit-spread widening" }), { target: { value: "300" } });
    fireEvent.click(screen.getByText("Run stress scenario"));
    finish();
    expect(screen.getByText("Top risk contributors")).toBeInTheDocument();
    expect(screen.getByText("Baseline vs stress")).toBeInTheDocument();
  });

  it("acknowledges, escalates, generates and edits a memo", () => {
    renderSimulation();
    fireEvent.click(screen.getByText("Acknowledge"));
    expect(screen.getByText("Acknowledged")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Mark for escalation"));
    expect(screen.getByText("Escalated")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Committee memo"));
    fireEvent.click(screen.getByText("Generate cited draft"));
    finish();
    const editor = screen.getByLabelText("Risk committee memo");
    fireEvent.change(editor, { target: { value: "Analyst-edited draft" } });
    expect(editor).toHaveValue("Analyst-edited draft");
  });

  it("shows a data warning, recovers from an error, and completely resets", () => {
    renderSimulation();
    expect(screen.getByRole("alert")).toHaveTextContent("Data-quality warning");
    fireEvent.click(screen.getByText("Scenario lab"));
    fireEvent.click(screen.getByText("Simulate risk-run error"));
    expect(screen.getByRole("alert")).toHaveTextContent("Simulated risk-run error");
    fireEvent.click(screen.getByText("Retry safely"));
    finish();
    expect(screen.getByText("Top risk contributors")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Reset"));
    expect(screen.getAllByText("Industrial credit concentration breach").length).toBeGreaterThan(0);
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("uses native keyboard-accessible controls", () => {
    renderSimulation();
    const scenarioButton = screen.getByRole("button", { name: "Scenario lab" });
    expect(scenarioButton.tagName).toBe("BUTTON");
    scenarioButton.focus();
    expect(scenarioButton).toHaveFocus();
  });
});
