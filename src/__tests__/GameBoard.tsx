import "@testing-library/jest-dom";
import GameBoard from "../GameBoard.tsx";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";

describe("GameBoard component", () => {
  test("Renders the GameBoard component", () => {
    render(<GameBoard />);
    const scoreText = screen.getByText(/SCORE:/i);
    expect(scoreText).toBeInTheDocument();
    const gameBoard = screen.getByRole("table");
    expect(gameBoard).toBeInTheDocument();
    const restartButton = screen.getByText(/RESTART/i);
    expect(restartButton).toBeInTheDocument();
  });
  test("Should initialize with the correct state", () => {
    render(<GameBoard />);
    const scoreText = screen.getByText(/SCORE: 0/i);
    expect(scoreText).toBeInTheDocument();
    const gameOverText = screen.queryByText(/GAME OVER - FINAL SCORE:/i);
    expect(gameOverText).not.toBeInTheDocument();
    const restartButton = screen.getByText(/RESTART/i);
    expect(restartButton).toBeDisabled();
  });
  test("Should move snake in the correct direction", () => {
    render(<GameBoard />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    act(() => {
      jest.useFakeTimers({});
    });
  });
});
