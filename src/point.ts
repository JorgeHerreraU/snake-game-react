import { Square } from "./enums/square.ts";

export interface Point {
  x: number;
  y: number;
}

export function getSquareByPoint(
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
