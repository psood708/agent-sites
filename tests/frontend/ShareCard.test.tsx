import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ShareCard from "../../frontend/components/ShareCard";

const CHECKS = {
  llms_txt: { pass: true, label: "/llms.txt file", weight: 25 },
  json_ld: { pass: true, label: "JSON-LD", weight: 15 },
  clean_content: { pass: false, label: "Clean content", weight: 15 },
  opengraph: { pass: true, label: "OpenGraph tags", weight: 10 },
  meta: { pass: false, label: "Meta tags", weight: 10 },
  canonical: { pass: true, label: "Canonical URL", weight: 5 },
  robots_txt: { pass: false, label: "robots.txt AI rules", weight: 10 },
  sitemap: { pass: false, label: "sitemap.xml", weight: 10 },
};

const DEFAULT_PROPS = {
  url: "https://stripe.com/",
  domain: "stripe.com",
  score: 55,
  grade: "Good",
  checks: CHECKS,
};

beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
  jest.spyOn(window, "open").mockImplementation(() => null);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("ShareCard", () => {
  it("renders score in challenge headline", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    expect(screen.getAllByText(/55\/100/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders domain in header", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    expect(screen.getAllByText(/stripe\.com/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders passing count in score box", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    expect(screen.getByText(/4\/8 passing/)).toBeInTheDocument();
  });

  it("renders check short labels in grid", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("/llms.txt")).toBeInTheDocument();
    expect(screen.getByText("JSON-LD")).toBeInTheDocument();
    expect(screen.getByText("robots.txt")).toBeInTheDocument();
  });

  it("renders post & challenge button", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    expect(screen.getByText(/Post.*challenge/i)).toBeInTheDocument();
  });

  it("renders linkedin and copy buttons", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("in")).toBeInTheDocument();
    expect(screen.getByText("⧉")).toBeInTheDocument();
  });

  it("copy button shows check mark when clicked", async () => {
    jest.useFakeTimers();
    render(<ShareCard {...DEFAULT_PROPS} />);
    const copyBtn = screen.getByTestId("copy-btn");
    await act(async () => { fireEvent.click(copyBtn); });
    expect(copyBtn).toHaveTextContent("✓");
    act(() => { jest.advanceTimersByTime(2100); });
    expect(copyBtn).toHaveTextContent("⧉");
    jest.useRealTimers();
  });

  it("post & challenge opens twitter intent", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByText(/Post.*challenge/i));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("twitter.com/intent/tweet"),
      "_blank",
      "noopener"
    );
  });

  it("linkedin button opens linkedin share", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByText("in"));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("linkedin.com/sharing"),
      "_blank",
      "noopener"
    );
  });

  it("copy writes share URL to clipboard", async () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    await act(async () => { fireEvent.click(screen.getByTestId("copy-btn")); });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("/score?url=stripe.com")
    );
  });
});
