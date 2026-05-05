import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ScoreTable from "../../frontend/components/ScoreTable";

const makeCheck = (pass: boolean, weight: number, label: string) => ({
  pass, detail: pass ? "Found" : "Missing", weight, label, data: null,
});

const CHECKS = {
  llms_txt:     makeCheck(true,  25, "/llms.txt file"),
  robots_txt:   makeCheck(false, 10, "robots.txt AI rules"),
  sitemap:      makeCheck(false, 10, "sitemap.xml"),
  json_ld:      makeCheck(true,  15, "JSON-LD structured data"),
  opengraph:    makeCheck(true,  10, "OpenGraph tags"),
  meta:         makeCheck(true,  10, "Title + meta description"),
  canonical:    makeCheck(false,  5, "Canonical URL"),
  clean_content:makeCheck(true,  15, "Clean content (Jina Reader)"),
};

describe("ScoreTable", () => {
  it("renders all 8 check labels", () => {
    render(<ScoreTable checks={CHECKS} />);
    expect(screen.getByText(/\/llms\.txt file/)).toBeInTheDocument();
    expect(screen.getByText(/robots\.txt AI rules/)).toBeInTheDocument();
    expect(screen.getByText(/sitemap\.xml/)).toBeInTheDocument();
    expect(screen.getByText(/JSON-LD structured data/)).toBeInTheDocument();
    expect(screen.getByText(/OpenGraph tags/)).toBeInTheDocument();
    expect(screen.getByText(/Title \+ meta description/)).toBeInTheDocument();
    expect(screen.getByText(/Canonical URL/)).toBeInTheDocument();
    expect(screen.getByText(/Clean content/)).toBeInTheDocument();
  });

  it("shows Credited section with passing count", () => {
    render(<ScoreTable checks={CHECKS} />);
    expect(screen.getByText(/Credited — 5 items/)).toBeInTheDocument();
  });

  it("shows Forfeited section with failing count", () => {
    render(<ScoreTable checks={CHECKS} />);
    expect(screen.getByText(/Forfeited — 3 items/)).toBeInTheDocument();
  });

  it("shows +weight.00 for passing checks", () => {
    render(<ScoreTable checks={CHECKS} />);
    expect(screen.getAllByText("+25.00").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("+15.00").length).toBeGreaterThanOrEqual(1);
  });

  it("shows -weight.00 for failing checks", () => {
    render(<ScoreTable checks={CHECKS} />);
    expect(screen.getAllByText("−10.00").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("−5.00")).toBeInTheDocument();
  });

  it("shows Subtotal and Available uplift lines", () => {
    render(<ScoreTable checks={CHECKS} />);
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
    expect(screen.getByText("Available uplift")).toBeInTheDocument();
  });

  it("shows foot rule with methodology", () => {
    render(<ScoreTable checks={CHECKS} />);
    expect(screen.getByText(/Methodology/)).toBeInTheDocument();
  });
});
