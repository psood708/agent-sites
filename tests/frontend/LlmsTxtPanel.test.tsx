import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LlmsTxtPanel from "../../frontend/components/LlmsTxtPanel";

const CONTENT = "# My Site\n\n> A great site\n\n## About\n- URL: https://mysite.com\n";
const DOMAIN = "mysite.com";

Object.assign(navigator, {
  clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
});

describe("LlmsTxtPanel", () => {
  it("renders the llms.txt content", () => {
    render(<LlmsTxtPanel content={CONTENT} domain={DOMAIN} />);
    expect(screen.getByText(/# My Site/)).toBeInTheDocument();
  });

  it("shows the domain", () => {
    render(<LlmsTxtPanel content={CONTENT} domain={DOMAIN} />);
    expect(screen.getAllByText(/mysite\.com/).length).toBeGreaterThan(0);
  });

  it("renders Copy and Download buttons", () => {
    render(<LlmsTxtPanel content={CONTENT} domain={DOMAIN} />);
    expect(screen.getByText("Copy")).toBeInTheDocument();
    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  it("calls clipboard on copy click", () => {
    render(<LlmsTxtPanel content={CONTENT} domain={DOMAIN} />);
    fireEvent.click(screen.getByText("Copy"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(CONTENT);
  });
});
