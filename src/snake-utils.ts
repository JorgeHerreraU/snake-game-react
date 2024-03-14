import { Square } from "./enums/square.ts";
import { Point } from "./point.ts";
import { Direction } from "./direction.ts";

export function getSnakeBodySquare(
  prev: Point,
  current: Point,
  next: Point,
): Square {
  // Check for horizontal and vertical
  if (prev.x === current.x && current.x === next.x) {
    return Square.SnakeBodyVertical;
  }
  if (prev.y === current.y && current.y === next.y) {
    return Square.SnakeBodyHorizontal;
  }

  // Diagonal checks
  if (prev.x === current.x && prev.y < current.y && next.x > current.x) {
    return Square.SnakeBodyTopRight;
  }
  if (prev.x === current.x && prev.y < current.y && next.x <= current.x) {
    return Square.SnakeBodyTopLeft;
  }
  if (prev.x === current.x && prev.y >= current.y && next.x > current.x) {
    return Square.SnakeBodyBottomRight;
  }
  if (prev.x === current.x && prev.y >= current.y && next.x <= current.x) {
    return Square.SnakeBodyBottomLeft;
  }
  if (prev.y === current.y && prev.x < current.x && next.y > current.y) {
    return Square.SnakeBodyBottomLeft;
  }
  if (prev.y === current.y && prev.x < current.x && next.y <= current.y) {
    return Square.SnakeBodyTopLeft;
  }
  if (prev.y === current.y && prev.x >= current.x && next.y > current.y) {
    return Square.SnakeBodyBottomRight;
  }
  if (prev.y === current.y && prev.x >= current.x && next.y <= current.y) {
    return Square.SnakeBodyTopRight;
  }

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

export const hitWall = (snakeHead: Point, size: number): boolean =>
  snakeHead.x < 0 ||
  snakeHead.x >= size ||
  snakeHead.y < 0 ||
  snakeHead.y >= size;

export const hitSelf = (newSnake: Point[], newHead: Point): boolean =>
  newSnake.some(
    (snakeBodySegment: Point) =>
      snakeBodySegment.x === newHead.x && snakeBodySegment.y === newHead.y,
  );
