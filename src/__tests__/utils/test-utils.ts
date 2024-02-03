import { Point } from "../../point.ts";
import { Square } from "../../enums/square.ts";
import { screen } from "@testing-library/react";

const snakeHeadTypes = [
  Square.SnakeHeadUp,
  Square.SnakeHeadDown,
  Square.SnakeHeadLeft,
  Square.SnakeHeadRight,
];

const snakeBodyTypes = [
  Square.SnakeBodyVertical,
  Square.SnakeBodyHorizontal,
  Square.SnakeBodyBottomLeft,
  Square.SnakeBodyBottomRight,
  Square.SnakeBodyTopLeft,
  Square.SnakeBodyTopRight,
  Square.SnakeHeadUp,
  Square.SnakeHeadDown,
  Square.SnakeHeadLeft,
  Square.SnakeHeadRight,
  Square.SnakeTailUp,
  Square.SnakeTailDown,
  Square.SnakeTailLeft,
  Square.SnakeTailRight,
];

export const getSnakeHeadPosition = (): Point => {
  const snakeHead: HTMLElement | null | undefined = snakeHeadTypes
    .map((type) => screen.queryByAltText(type))
    .find((element) => element !== null);

  if (!snakeHead) {
    throw new Error("Snake not found in the grid");
  }

  const cell = snakeHead.closest("td")!;
  const row = (cell.parentNode as HTMLTableRowElement).rowIndex;
  const column = Array.from(cell.parentNode!.children).indexOf(cell);
  return { x: column, y: row };
};

export const getPickupPosition = (): Point => {
  const pickUp = screen
    .queryAllByAltText(Square.Pickup)
    .find((element) => element !== null);
  if (!pickUp) {
    throw new Error("Pickup not found");
  }
  const cell = pickUp.closest("td")!;
  const row = (cell.parentNode as HTMLTableRowElement).rowIndex;
  const column = Array.from(cell.parentNode!.children).indexOf(cell);
  return { x: column, y: row };
};
export const getSnakeSize = () => {
  let size = 0;
  for (const snakeType of snakeBodyTypes) {
    const squares = screen.queryAllByAltText(snakeType);
    size = size + squares.length;
  }
  return size;
};
