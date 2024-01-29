import { Square } from "./enums/square.ts";

export const squareBitmaps = {
  [Square.Empty]: null,
  [Square.Pickup]: "/assets/apple.png",
  [Square.Edge]: null,
  [Square.SnakeBodyVertical]: "/assets/body_vertical.png",
  [Square.SnakeBodyHorizontal]: "/assets/body_horizontal.png",
  [Square.SnakeBodyBottomLeft]: "/assets/body_bottomleft.png",
  [Square.SnakeBodyBottomRight]: "/assets/body_bottomright.png",
  [Square.SnakeBodyTopLeft]: "/assets/body_topleft.png",
  [Square.SnakeBodyTopRight]: "/assets/body_topright.png",
  [Square.SnakeHeadUp]: "/assets/head_up.png",
  [Square.SnakeHeadDown]: "/assets/head_down.png",
  [Square.SnakeHeadLeft]: "/assets/head_left.png",
  [Square.SnakeHeadRight]: "/assets/head_right.png",
  [Square.SnakeTailUp]: "/assets/tail_up.png",
  [Square.SnakeTailDown]: "/assets/tail_down.png",
  [Square.SnakeTailLeft]: "/assets/tail_left.png",
  [Square.SnakeTailRight]: "/assets/tail_right.png",
};
