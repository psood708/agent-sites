import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ScoreGauge from "../../frontend/components/ScoreGauge";

describe("ScoreGauge", () => {
  it("renders score and grade", () => {
    render(<ScoreGauge score={65} grade="Good" />);
    expect(screen.getByText("65")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("renders /100 label", () => {
    render(<ScoreGauge score={42} grade="Needs work" />);
    expect(screen.getByText("/ 100")).toBeInTheDocument();
  });

  it("renders 0 score", () => {
    render(<ScoreGauge score={0} grade="Poor" />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Poor")).toBeInTheDocument();
  });

  it("renders perfect score", () => {
    render(<ScoreGauge score={100} grade="Excellent" />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("Excellent")).toBeInTheDocument();
  });
});
