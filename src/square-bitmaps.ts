import { Square } from "./enums/square.ts";

const getAssetPath = (assetPath: string) =>
  `${import.meta.env.BASE_URL}${assetPath}`;

export type SquareBitmaps = {
  [key in Square]: string | null;
};
export const squareBitmaps: SquareBitmaps = {
  [Square.Empty]: null,
  [Square.Pickup]: getAssetPath("assets/apple.png"),
  [Square.Edge]: null,
  [Square.SnakeBodyVertical]: getAssetPath("assets/body_vertical.png"),
  [Square.SnakeBodyHorizontal]: getAssetPath("assets/body_horizontal.png"),
  [Square.SnakeBodyBottomLeft]: getAssetPath("assets/body_bottomleft.png"),
  [Square.SnakeBodyBottomRight]: getAssetPath("assets/body_bottomright.png"),
  [Square.SnakeBodyTopLeft]: getAssetPath("assets/body_topleft.png"),
  [Square.SnakeBodyTopRight]: getAssetPath("assets/body_topright.png"),
  [Square.SnakeHeadUp]: getAssetPath("assets/head_up.png"),
  [Square.SnakeHeadDown]: getAssetPath("assets/head_down.png"),
  [Square.SnakeHeadLeft]: getAssetPath("assets/head_left.png"),
  [Square.SnakeHeadRight]: getAssetPath("assets/head_right.png"),
  [Square.SnakeTailUp]: getAssetPath("assets/tail_up.png"),
  [Square.SnakeTailDown]: getAssetPath("assets/tail_down.png"),
  [Square.SnakeTailLeft]: getAssetPath("assets/tail_left.png"),
  [Square.SnakeTailRight]: getAssetPath("assets/tail_right.png"),
};
