import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./components/ui/darkveil", () => () => (
  <div data-testid="dark-veil" />
));

jest.mock("./components/ReviewWorkspace", () => () => (
  <div>Review workspace</div>
));

jest.mock("./helper/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useAuth: () => ({
    status: { authenticated: false },
    loading: false,
    checkAuth: jest.fn(),
    logout: jest.fn(),
  }),
}));

test("renders review workspace", () => {
  render(<App />);
  expect(screen.getByText("Review workspace")).toBeInTheDocument();
  expect(screen.getByTestId("dark-veil")).toBeInTheDocument();
});
