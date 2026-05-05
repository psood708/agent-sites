import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Footer from "../../frontend/components/Footer";

describe("Footer", () => {
  it("renders footer element", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("shows creator attribution", () => {
    render(<Footer />);
    expect(screen.getByText("Parth Sood")).toBeInTheDocument();
    expect(screen.getByText(/Created by/)).toBeInTheDocument();
  });
});
