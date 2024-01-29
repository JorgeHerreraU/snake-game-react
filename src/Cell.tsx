import { Square } from "./enums/square.ts";
import { squareBitmaps } from "./square-bitmaps.ts";

export function Cell({ type }: { type: Square }) {
  const imgSrc = squareBitmaps[type];
  return <>{imgSrc && <img src={imgSrc} alt={type.toString()} />}</>;
}
