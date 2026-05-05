import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import RecommendationsPanel from "../../frontend/components/RecommendationsPanel";

describe("RecommendationsPanel", () => {
  it("renders each recommendation label", () => {
    const recs = [
      { label: "/llms.txt file", weight: 25 },
      { label: "sitemap.xml", weight: 10 },
    ];
    render(<RecommendationsPanel recommendations={recs} />);
    expect(screen.getByText("/llms.txt file")).toBeInTheDocument();
    expect(screen.getByText("sitemap.xml")).toBeInTheDocument();
  });

  it("shows point value for each recommendation", () => {
    const recs = [{ label: "JSON-LD structured data", weight: 15 }];
    render(<RecommendationsPanel recommendations={recs} />);
    expect(screen.getByText("+15 pts")).toBeInTheDocument();
  });

  it("shows all-passed message when empty", () => {
    render(<RecommendationsPanel recommendations={[]} />);
    expect(screen.getByText("✓ All checks passed")).toBeInTheDocument();
  });

  it("renders multiple recommendations in order", () => {
    const recs = [
      { label: "First", weight: 25 },
      { label: "Second", weight: 10 },
      { label: "Third", weight: 5 },
    ];
    render(<RecommendationsPanel recommendations={recs} />);
    const items = screen.getAllByText(/pts$/);
    expect(items).toHaveLength(3);
  });
});
