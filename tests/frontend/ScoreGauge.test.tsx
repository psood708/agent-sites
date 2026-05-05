import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ScoreGauge from "../../frontend/components/ScoreGauge";

describe("ScoreGauge", () => {
  it("renders score number", () => {
    render(<ScoreGauge score={65} grade="Good" />);
    expect(screen.getByText("65")).toBeInTheDocument();
  });

  it("renders grade badge", () => {
    render(<ScoreGauge score={65} grade="Good" />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("renders out of 100 label", () => {
    render(<ScoreGauge score={42} grade="Needs work" />);
    expect(screen.getByText("out of 100")).toBeInTheDocument();
  });

  it("renders The Score and Where you sit labels", () => {
    render(<ScoreGauge score={70} grade="Excellent" />);
    expect(screen.getByText("The Score")).toBeInTheDocument();
    expect(screen.getByText("Where you sit")).toBeInTheDocument();
  });

  it("renders domain in header when provided", () => {
    render(<ScoreGauge score={80} grade="Excellent" domain="stripe.com" />);
    expect(screen.getAllByText(/stripe\.com/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders editorial headline", () => {
    render(<ScoreGauge score={65} grade="Good" />);
    expect(screen.getByText(/mostly readable/)).toBeInTheDocument();
  });

  it("renders correct headline for low score", () => {
    render(<ScoreGauge score={20} grade="Poor" />);
    expect(screen.getByText(/largely invisible/)).toBeInTheDocument();
  });

  it("renders correct headline for high score", () => {
    render(<ScoreGauge score={90} grade="Excellent" />);
    expect(screen.getByText(/fully prepared/)).toBeInTheDocument();
  });
});
