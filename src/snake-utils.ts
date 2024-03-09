import { Square } from "./enums/square.ts";
import { Point } from "./point.ts";
import { Direction } from "./direction.ts";

export function getSnakeBodySquare(
  prev: Point,
  current: Point,
  next: Point,
): Square {
  const isTopLeft =
    (prev.x === current.x &&
      prev.y < current.y &&
      next.x < current.x &&
      next.y === current.y) ||
    (prev.x < current.x &&
      prev.y === current.y &&
      next.x === current.x &&
      next.y < current.y);
  const isTopRight =
    (prev.x > current.x &&
      prev.y === current.y &&
      next.x === current.x &&
      next.y < current.y) ||
    (prev.x === current.x &&
      prev.y < current.y &&
      next.x > current.x &&
      next.y === current.y);
  const isBottomLeft =
    (prev.x < current.x &&
      prev.y === current.y &&
      next.x === current.x &&
      next.y > current.y) ||
    (prev.x === current.x &&
      prev.y > current.y &&
      next.x < current.x &&
      next.y === current.y);
  const isBottomRight =
    (prev.x === current.x &&
      prev.y > current.y &&
      next.x > current.x &&
      next.y === current.y) ||
    (prev.x > current.x &&
      prev.y === current.y &&
      next.x === current.x &&
      next.y > current.y);
  const isVertical =
    prev.y !== current.y &&
    next.y !== current.y &&
    prev.x === current.x &&
    next.x === current.x;
  const isHorizontal =
    prev.y === current.y &&
    next.y === current.y &&
    prev.x !== current.x &&
    next.x !== current.x;

  if (isTopLeft) return Square.SnakeBodyTopLeft;
  if (isTopRight) return Square.SnakeBodyTopRight;
  if (isBottomLeft) return Square.SnakeBodyBottomLeft;
  if (isBottomRight) return Square.SnakeBodyBottomRight;
  if (isVertical) return Square.SnakeBodyVertical;
  if (isHorizontal) return Square.SnakeBodyHorizontal;
  return Square.Empty;
}

export const getSnakeHeadSquare = (direction: Direction): Square => {
  switch (direction) {
    case Direction.Left:
      return Square.SnakeHeadLeft;
    case Direction.Right:
      return Square.SnakeHeadRight;
    case Direction.Up:
      return Square.SnakeHeadUp;
    case Direction.Down:
      return Square.SnakeHeadDown;
  }
  return Square.Empty;
};

export const getSnakeTailSquare = (snakeState: Point[]): Square => {
  const snakeTail = snakeState[snakeState.length - 1];
  const snakeTailPrev = snakeState[snakeState.length - 2];
  const deltaX = snakeTail.x - snakeTailPrev.x;
  const deltaY = snakeTail.y - snakeTailPrev.y;

  return deltaY === 1
    ? Square.SnakeTailDown
    : deltaY === -1
      ? Square.SnakeTailUp
      : deltaX === -1
        ? Square.SnakeTailLeft
        : deltaX === 1
          ? Square.SnakeTailRight
          : null!;
};
