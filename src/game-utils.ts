import { Square } from "./enums/square.ts";
import { Point } from "./point.ts";
import { Direction } from "./direction.ts";
import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP } from "./constants.ts";

export const addRandomPickup = (gridState: Square[][]): Point => {
  const emptyPositions = getAllEmptyPositions(gridState);
  const index = Math.floor(Math.random() * emptyPositions.length);
  const [row, col] = emptyPositions[index];
  gridState[row][col] = Square.Pickup;
  return { x: col, y: row };
};

export const getDirectionByKey = (key: string): Direction | null => {
  switch (key) {
    case ARROW_LEFT:
      return Direction.Left;
    case ARROW_RIGHT:
      return Direction.Right;
    case ARROW_UP:
      return Direction.Up;
    case ARROW_DOWN:
      return Direction.Down;
    default:
      return null;
  }
};

const getAllEmptyPositions = (gridState: Square[][]): number[][] => {
  const emptyPositions = [];
  for (let row = 0; row < gridState.length; row++) {
    for (let col = 0; col < gridState[row].length; col++) {
      if (gridState[row][col] === Square.Empty) {
        emptyPositions.push([row, col]);
      }
    }
  }
  return emptyPositions;
};
