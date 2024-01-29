import { Point } from "./point.ts";

export class Direction {
  public static readonly Left = new Direction(-1, 0);
  public static readonly Right = new Direction(1, 0);
  public static readonly Down = new Direction(0, 1);
  public static readonly Up = new Direction(0, -1);
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public move(point: Point): Point {
    return { x: point.x + this.x, y: point.y + this.y };
  }
}
