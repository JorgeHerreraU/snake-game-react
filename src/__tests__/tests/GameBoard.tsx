import "@testing-library/jest-dom";
import GameBoard from "../../GameBoard.tsx";
import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  ARROW_DOWN,
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  GAME_UPDATE_RATE,
} from "../../constants.ts";
import { DEFAULT_TIMEOUT } from "../utils/test-constants.ts";
import { getSnakeHeadPosition, getSnakeSize } from "../utils/test-utils.ts";
import { Point } from "../../point.ts";
import * as utils from "../../game-utils.ts";

describe("GameBoard initialization", () => {
  beforeEach(() => {});
  afterEach(() => {
    jest.useRealTimers();
  });

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
});

describe("GameBoard movements", () => {
  test("Should move snake up, left, down and right", async () => {
    // Setup vars
    jest.useFakeTimers();
    render(<GameBoard size={15} />);
    let initialPosition: Point;
    let finalPosition: Point;
    // Initial movement to the right
    act(() => {
      jest.advanceTimersByTime(GAME_UPDATE_RATE * 2);
    });
    initialPosition = getSnakeHeadPosition();
    act(() => {
      jest.advanceTimersByTime(GAME_UPDATE_RATE);
    });
    finalPosition = getSnakeHeadPosition();
    expect(finalPosition.x).toBeGreaterThan(initialPosition.x);
    // Move the snake up
    fireEvent.keyDown(window, { key: ARROW_UP });
    act(() => {
      jest.advanceTimersByTime(GAME_UPDATE_RATE);
    });
    await waitFor(
      () => {
        finalPosition = getSnakeHeadPosition();
        expect(finalPosition.y).toBeLessThan(initialPosition.y);
      },
      { timeout: DEFAULT_TIMEOUT },
    );
    // Move the snake left
    fireEvent.keyDown(window, { key: ARROW_LEFT });
    act(() => {
      jest.advanceTimersByTime(GAME_UPDATE_RATE);
    });
    await waitFor(
      () => {
        initialPosition = finalPosition;
        finalPosition = getSnakeHeadPosition();
        expect(finalPosition.x).toBeLessThan(initialPosition.x);
      },
      { timeout: DEFAULT_TIMEOUT },
    );
    // Move the snake down
    fireEvent.keyDown(window, { key: ARROW_DOWN });
    act(() => {
      jest.advanceTimersByTime(GAME_UPDATE_RATE);
    });
    await waitFor(
      () => {
        initialPosition = finalPosition;
        finalPosition = getSnakeHeadPosition();
        expect(finalPosition.y).toBeGreaterThan(initialPosition.y);
      },
      { timeout: DEFAULT_TIMEOUT },
    );
    // Move the snake right
    fireEvent.keyDown(window, { key: ARROW_RIGHT });
    act(() => {
      jest.advanceTimersByTime(GAME_UPDATE_RATE);
    });
    await waitFor(
      () => {
        initialPosition = finalPosition;
        finalPosition = getSnakeHeadPosition();
        expect(finalPosition.x).toBeGreaterThan(initialPosition.x);
      },
      { timeout: DEFAULT_TIMEOUT },
    );
  });
});

describe("GameBoard interactions", () => {
  test("Should handle food pickup", async () => {
    jest.useFakeTimers();
    jest.spyOn(utils, "addRandomPickup").mockReturnValue({ x: 4, y: 7 });
    render(<GameBoard size={15} />);
    const initialSnakeSize = getSnakeSize();
    const scoreText = screen.getByText(/SCORE: 0/i);
    expect(scoreText).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(GAME_UPDATE_RATE);
    });
    await waitFor(
      () => {
        const finalSnakeSize = getSnakeSize();
        expect(finalSnakeSize).toBeGreaterThan(initialSnakeSize);
        expect(scoreText).toHaveTextContent("SCORE: 1");
      },
      { timeout: DEFAULT_TIMEOUT },
    );
  });
});
