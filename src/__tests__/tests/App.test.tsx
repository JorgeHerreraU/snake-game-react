import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import App from "../../App.tsx";

describe("App component", () => {
  test("Renders the main app component", () => {
    render(<App />);
  });
});
