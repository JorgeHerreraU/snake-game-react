import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./GameBoard.css";
import { Square } from "./enums/square";
import { Cell } from "./Cell";
import { getSquareByPoint, Point } from "./point";
import { Direction } from "./direction.ts";

type BoardState = {
  snake: Point[];
  grid: Square[][];
  food: Point;
};

function GameBoard({ size = 15 }) {
  const [score, setScore] = useState(0);
  const [boardState, setBoardState] = useState<BoardState>(setupGame());
  const [direction, setDirection] = useState<Direction>(Direction.Right);
  const [isGameFinished, setIsGameFinished] = useState(false);

  const nextMoves = useRef<Direction[]>([]);
  const requestRef = useRef<number | null>();
  const previousTimeRef = useRef<number | null>();

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

  const getSquare = useCallback(getSquareByPoint, []);

  const moveSnake = useCallback(
    (snakeState: Point[]): Square[][] => {
      const newGrid: Square[][] = new Array(size)
        .fill(null)
        .map(() => new Array(size).fill(Square.Empty));

      const snakeHead = snakeState[0];
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

      for (let i = 1; i < snakeState.length - 1; i++) {
        const prev = snakeState[i - 1];
        const next = snakeState[i + 1];
        const current = snakeState[i];
        newGrid[current.y][current.x] = getSquare(prev, current, next);
      }

      const snakeTail = snakeState[snakeState.length - 1];
      const snakeTailPrev = snakeState[snakeState.length - 2];
      const deltaX = snakeTail.x - snakeTailPrev.x;
      const deltaY = snakeTail.y - snakeTailPrev.y;

      const tailDirection =
        deltaY === 1
          ? Square.SnakeTailDown
          : deltaY === -1
            ? Square.SnakeTailUp
            : deltaX === -1
              ? Square.SnakeTailLeft
              : deltaX === 1
                ? Square.SnakeTailRight
                : null;

      newGrid[snakeTail.y][snakeTail.x] = tailDirection!;

      return newGrid;
    },
    [direction, getSquare, size],
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
  const CellMemo = React.memo(Cell);

  const renderGrid = useCallback(
    (grid: Square[][]): React.ReactElement[] =>
      grid.map((row, r) => (
        <tr key={`row-${r}`}>
          {row.map((cell, c) => (
            <td key={`cell-${r}-${c}`} className="grid-cell">
              <CellMemo type={cell} />
            </td>
          ))}
        </tr>
      )),
    [CellMemo],
  );

  const addPickup = useCallback(setupFood, []);

  const hitWall = useCallback(
    (newHead: Point): boolean =>
      newHead.x < 0 || newHead.x >= size || newHead.y < 0 || newHead.y >= size,
    [size],
  );

  function hitSelf(newSnake: Point[], newHead: Point): boolean {
    return newSnake.some(
      (snakeBodySegment) =>
        snakeBodySegment.x === newHead.x && snakeBodySegment.y === newHead.y,
    );
  }

  const hasPickedUpFood = useCallback(
    (newHead: Point) =>
      newHead.x === boardState.food.x && newHead.y === boardState.food.y,
    [boardState.food.x, boardState.food.y],
  );

  const gameLoop = useCallback(() => {
    if (nextMoves.current.length > 0) {
      setDirection(nextMoves.current.shift()!);
    }
    const newSnake = [...boardState.snake];
    const currentHead = newSnake[0];
    const newHead = direction.move(currentHead);

    if (hitWall(newHead) || hitSelf(newSnake, newHead)) {
      setIsGameFinished(true);
      return;
    }

    newSnake.unshift(newHead);

    if (hasPickedUpFood(newHead)) {
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
  }, [boardState, direction, hitWall, hasPickedUpFood, moveSnake, addPickup]);

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current) {
        const deltaTime = time - previousTimeRef.current;
        if (deltaTime > 75) {
          gameLoop();
          previousTimeRef.current = time;
        }
      } else {
        previousTimeRef.current = time;
      }
      if (!isGameFinished) {
        requestRef.current = requestAnimationFrame(animate);
      }
    },
    [gameLoop, isGameFinished],
  );
  const getDirectionByKey = (key: string): Direction | null => {
    switch (key) {
      case "ArrowLeft":
        return Direction.Left;
      case "ArrowRight":
        return Direction.Right;
      case "ArrowUp":
        return Direction.Up;
      case "ArrowDown":
        return Direction.Down;
      default:
        return null;
    }
  };
  const canSetDirection = useCallback(
    (nextMove: Direction) => {
      if (nextMoves.current.length > 0) {
        const lastDirection = nextMoves.current[nextMoves.current.length - 1];
        return (
          !lastDirection.isOpposite(nextMove) && nextMove !== lastDirection
        );
      }
      return !direction.isOpposite(nextMove) && nextMove !== direction;
    },
    [direction],
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const nextMove = getDirectionByKey(event.key);
      if (nextMove && canSetDirection(nextMove)) {
        nextMoves.current.push(nextMove);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canSetDirection]);

  const renderedGrid = useMemo(
    () => renderGrid(boardState.grid),
    [boardState.grid, renderGrid],
  );

  return (
    <>
      <div className="score-text">
        {isGameFinished
          ? `GAME OVER - FINAL SCORE: ${score}`
          : `SCORE: ${score}`}
      </div>
      <table className="game-board">
        <tbody>{renderedGrid}</tbody>
      </table>
    </>
  );
}

export default GameBoard;
