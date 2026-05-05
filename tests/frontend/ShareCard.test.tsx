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
  it("renders domain and score", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("stripe.com")).toBeInTheDocument();
    expect(screen.getByText("55")).toBeInTheDocument();
  });

  it("renders grade badge", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("renders passing count", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    expect(screen.getByText(/4 of 8 checks passing/)).toBeInTheDocument();
  });

  it("renders all check labels", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("/llms.txt")).toBeInTheDocument();
    expect(screen.getByText("JSON-LD")).toBeInTheDocument();
    expect(screen.getByText("robots.txt")).toBeInTheDocument();
    expect(screen.getByText("sitemap.xml")).toBeInTheDocument();
  });

  it("renders share buttons", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    expect(screen.getByText("Share on X")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Copy link")).toBeInTheDocument();
  });

  it("copy link button shows copied state", async () => {
    jest.useFakeTimers();
    render(<ShareCard {...DEFAULT_PROPS} />);
    const copyBtn = screen.getByText("Copy link");
    await act(async () => { fireEvent.click(copyBtn); });
    expect(screen.getByText("✓ Copied")).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(2100); });
    expect(screen.getByText("Copy link")).toBeInTheDocument();
    jest.useRealTimers();
  });

  it("X button opens twitter intent", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByText("Share on X"));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("twitter.com/intent/tweet"),
      "_blank",
      "noopener"
    );
  });

  it("LinkedIn button opens linkedin share", () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByText("LinkedIn"));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("linkedin.com/sharing"),
      "_blank",
      "noopener"
    );
  });

  it("copy link writes share URL to clipboard", async () => {
    render(<ShareCard {...DEFAULT_PROPS} />);
    await act(async () => { fireEvent.click(screen.getByText("Copy link")); });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("/score?url=stripe.com")
    );
  });
});
