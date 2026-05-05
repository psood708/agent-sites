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
    expect(screen.getByText("/llms.txt file")).toBeInTheDocument();
    expect(screen.getByText("robots.txt AI rules")).toBeInTheDocument();
    expect(screen.getByText("sitemap.xml")).toBeInTheDocument();
    expect(screen.getByText("JSON-LD structured data")).toBeInTheDocument();
    expect(screen.getByText("OpenGraph tags")).toBeInTheDocument();
    expect(screen.getByText("Title + meta description")).toBeInTheDocument();
    expect(screen.getByText("Canonical URL")).toBeInTheDocument();
    expect(screen.getByText("Clean content (Jina Reader)")).toBeInTheDocument();
  });

  it("shows PASS badges for passing checks", () => {
    render(<ScoreTable checks={CHECKS} />);
    const passBadges = screen.getAllByText("PASS");
    expect(passBadges.length).toBe(5);
  });

  it("shows FAIL badges for failing checks", () => {
    render(<ScoreTable checks={CHECKS} />);
    const failBadges = screen.getAllByText("FAIL");
    expect(failBadges.length).toBe(3);
  });

  it("shows +weight for passing checks", () => {
    render(<ScoreTable checks={CHECKS} />);
    expect(screen.getByText("+25")).toBeInTheDocument();
    // both json_ld and clean_content are 15pts — getAllByText handles multiples
    expect(screen.getAllByText("+15").length).toBeGreaterThanOrEqual(1);
  });

  it("shows 0 for failing checks", () => {
    render(<ScoreTable checks={CHECKS} />);
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });
});
