import React, { useCallback, useEffect, useState } from "react";
import "./GameBoard.css";
import { Square } from "./enums/square";
import { Cell } from "./Cell";
import { Point } from "./point";
import { Direction } from "./direction.ts";

type BoardState = {
  snake: Point[];
  grid: Square[][];
  food: Point;
};

function GameBoard({ size = 20 }) {
  const [score, setScore] = useState(0);
  const [boardState, setBoardState] = useState<BoardState>(setupGame());
  const [direction, setDirection] = useState<Direction>(Direction.Right);
  const [isGameFinished, setIsGameFinished] = useState(false);

  function setupSnake(): Point[] {
    const newSnake: Point[] = [];
    const row = Math.floor(size / 2);
    for (let col = 1; col <= 3; col++) {
      newSnake.unshift({ x: col, y: row });
    }
    return newSnake;
  }

  function setupGrid(snakeState: Point[]): Square[][] {
    const newGrid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Square.Empty),
    );

    snakeState.forEach((point) => {
      newGrid[point.y][point.x] = Square.SnakeBodyHorizontal;
    });

    const snakeHead = snakeState[0];
    const snakeTail = snakeState[snakeState.length - 1];
    newGrid[snakeHead.y][snakeHead.x] = Square.SnakeHeadRight;
    newGrid[snakeTail.y][snakeTail.x] = Square.SnakeTailLeft;
    return newGrid;
  }

  function setupFood(gridState: Square[][]): Point {
    const emptyPositions = getAllEmptyPositions(gridState);
    const index = Math.floor(Math.random() * emptyPositions.length);
    const [row, col] = emptyPositions[index];
    gridState[row][col] = Square.Pickup;
    return { x: col, y: row };
  }

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          if (direction !== Direction.Right) setDirection(Direction.Left);
          break;
        case "ArrowRight":
          if (direction !== Direction.Left) setDirection(Direction.Right);
          break;
        case "ArrowUp":
          if (direction !== Direction.Down) setDirection(Direction.Up);
          break;
        case "ArrowDown":
          if (direction !== Direction.Up) setDirection(Direction.Down);
          break;
        default:
          break;
      }
    },
    [direction],
  );

  const moveSnake = useCallback(
    (snakeState: Point[]): Square[][] => {
      const newGrid = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Square.Empty),
      );

      const snakeHead = snakeState[0];
      const snakeTail = snakeState[snakeState.length - 1];

      for (let i = 1; i < snakeState.length - 1; i++) {
        const prev = snakeState[i - 1];
        const next = snakeState[i + 1];
        const current = snakeState[i];
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

        if (isTopLeft) {
          newGrid[current.y][current.x] = Square.SnakeBodyTopLeft;
        } else if (isTopRight) {
          newGrid[current.y][current.x] = Square.SnakeBodyTopRight;
        } else if (isBottomLeft) {
          newGrid[current.y][current.x] = Square.SnakeBodyBottomLeft;
        } else if (isBottomRight) {
          newGrid[current.y][current.x] = Square.SnakeBodyBottomRight;
        } else if (isVertical) {
          newGrid[current.y][current.x] = Square.SnakeBodyVertical;
        } else if (isHorizontal) {
          newGrid[current.y][current.x] = Square.SnakeBodyHorizontal;
        }
      }

      switch (direction) {
        case Direction.Left:
          newGrid[snakeHead.y][snakeHead.x] = Square.SnakeHeadLeft;
          break;
        case Direction.Right:
          newGrid[snakeHead.y][snakeHead.x] = Square.SnakeHeadRight;
          break;
        case Direction.Up:
          newGrid[snakeHead.y][snakeHead.x] = Square.SnakeHeadUp;
          break;
        case Direction.Down:
          newGrid[snakeHead.y][snakeHead.x] = Square.SnakeHeadDown;
          break;
      }

      const snakeTailPrev = snakeState[snakeState.length - 2];
      const tailDown =
        snakeTail.x === snakeTailPrev.x && snakeTail.y > snakeTailPrev.y;
      const tailUp =
        snakeTail.x === snakeTailPrev.x && snakeTail.y < snakeTailPrev.y;
      const tailLeft =
        snakeTail.x < snakeTailPrev.x && snakeTail.y === snakeTailPrev.y;
      const tailRight =
        snakeTail.x > snakeTailPrev.x && snakeTail.y === snakeTailPrev.y;

      if (tailDown) {
        newGrid[snakeTail.y][snakeTail.x] = Square.SnakeTailDown;
      } else if (tailUp) {
        newGrid[snakeTail.y][snakeTail.x] = Square.SnakeTailUp;
      } else if (tailLeft) {
        newGrid[snakeTail.y][snakeTail.x] = Square.SnakeTailLeft;
      } else if (tailRight) {
        newGrid[snakeTail.y][snakeTail.x] = Square.SnakeTailRight;
      }

      return newGrid;
    },
    [size, direction],
  );

  function setupGame() {
    const snakeState = setupSnake();
    const gridState = setupGrid(snakeState);
    const foodState = setupFood(gridState);
    return { snake: snakeState, grid: gridState, food: foodState };
  }

  function getAllEmptyPositions(gridState: Square[][]): number[][] {
    const emptyPositions = [];
    for (let row = 0; row < gridState.length; row++) {
      for (let col = 0; col < gridState[row].length; col++) {
        if (gridState[row][col] === Square.Empty) {
          emptyPositions.push([row, col]);
        }
      }
    }
    return emptyPositions;
  }

  function renderGrid(grid: Square[][]): React.ReactElement[] {
    return grid.map((row, r) => (
      <tr key={`row-${r}`}>
        {row.map((cell, c) => (
          <td key={`cell-${r}-${c}`} className="grid-cell">
            <Cell type={cell} />
          </td>
        ))}
      </tr>
    ));
  }

  const addPickup = useCallback(setupFood, []);

  const gameLoop = useCallback(() => {
    const newSnake = [...boardState.snake];
    const currentHead = newSnake[0];
    const newHead = direction.move(currentHead);

    const hitWall =
      newHead.x < 0 || newHead.x >= size || newHead.y < 0 || newHead.y >= size;
    const hitSelf = newSnake.some(
      (snakeBodySegment) =>
        snakeBodySegment.x === newHead.x && snakeBodySegment.y === newHead.y,
    );

    if (hitWall || hitSelf) {
      console.log("Game Over");
      setIsGameFinished(true);
      return;
    }

    newSnake.unshift(newHead);

    const pickedUpFood =
      newHead.x === boardState.food.x && newHead.y === boardState.food.y;
    if (pickedUpFood) {
      setScore((prev) => prev + 1);
      const newGrid = moveSnake(newSnake);
      const newFood = addPickup(newGrid);
      setBoardState({ snake: newSnake, grid: newGrid, food: newFood });
    } else {
      newSnake.pop();
      const newGrid = moveSnake(newSnake);
      newGrid[boardState.food.y][boardState.food.x] = Square.Pickup;
      setBoardState({ ...boardState, snake: newSnake, grid: newGrid });
    }
  }, [moveSnake, boardState, direction, size, addPickup]);

  useEffect(() => {
    if (isGameFinished) {
      return () => {};
    }
    const interval = setInterval(gameLoop, 200);
    return () => clearInterval(interval);
  }, [gameLoop, isGameFinished]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [handleKeyDown]);

  return (
    <>
      <h1 className="score-text">SCORE: {score}</h1>
      <table className="game-board">
        <tbody>{renderGrid(boardState.grid)}</tbody>
      </table>
    </>
  );
}

export default GameBoard;
