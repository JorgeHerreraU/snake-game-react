import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./GameBoard.css";
import { Square } from "./enums/square";
import { Cell } from "./Cell";
import { Direction } from "./direction.ts";
import {
  GAME_OVER_TITLE,
  GAME_SCORE_TITLE,
  GAME_UPDATE_RATE,
  MAX_NEXT_MOVEMENTS,
  RESTART_TEXT,
} from "./constants.ts";
import { SquareBitmaps, squareBitmaps } from "./square-bitmaps.ts";
import {
  addRandomPickup,
  getDirectionByKey,
  refreshPage,
  setupGrid,
  setupSnake,
} from "./game-utils.ts";
import {
  getSnakeBodySquare,
  getSnakeHeadSquare,
  getSnakeTailSquare,
} from "./snake-utils.ts";
import { Point } from "./point.ts";

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
  const accumulatorRef = useRef(0);

  useEffect(() => {
    const preloadImages = (imageMap: SquareBitmaps) => {
      Object.values(imageMap).forEach((url) => {
        if (url) {
          const img = new Image();
          img.src = url;
        }
      });
    };
    preloadImages(squareBitmaps);
  }, []);

  const moveSnake = useCallback(
    (snakeState: Point[]): Square[][] => {
      const grid: Square[][] = boardState.grid;

      // Clear grid rows
      grid.forEach((row) => row.fill(Square.Empty));

      // Set snake head
      const snakeHead = snakeState[0];
      grid[snakeHead.y][snakeHead.x] = getSnakeHeadSquare(direction);

      // Set snake body
      for (let i = 1; i < snakeState.length - 1; i++) {
        const prev = snakeState[i - 1];
        const next = snakeState[i + 1];
        const current = snakeState[i];
        grid[current.y][current.x] = getSnakeBodySquare(prev, current, next);
      }

      // Set snake tail
      const snakeTail = snakeState[snakeState.length - 1];
      grid[snakeTail.y][snakeTail.x] = getSnakeTailSquare(snakeState);

      return grid;
    },
    [boardState.grid, direction],
  );

  function setupGame(): BoardState {
    const snake = setupSnake(size);
    const grid = setupGrid(size);
    const food = addRandomPickup(grid);
    return { snake, grid, food };
  }

  const CellMemo = memo(Cell);

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

  const addPickup = useCallback(addRandomPickup, []);

  const hitWall = useCallback(
    (newHead: Point): boolean =>
      newHead.x < 0 || newHead.x >= size || newHead.y < 0 || newHead.y >= size,
    [size],
  );

  const hitSelf = (newSnake: Point[], newHead: Point): boolean =>
    newSnake.some(
      (snakeBodySegment: Point) =>
        snakeBodySegment.x === newHead.x && snakeBodySegment.y === newHead.y,
    );

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
      const grid = moveSnake(newSnake);
      const newFood = addPickup(grid);
      setBoardState({ snake: newSnake, grid: grid, food: newFood });
    } else {
      newSnake.pop();
      const grid = moveSnake(newSnake);
      grid[boardState.food.y][boardState.food.x] = Square.Pickup;
      setBoardState({ ...boardState, snake: newSnake, grid: grid });
    }
  }, [boardState, direction, hitWall, hasPickedUpFood, moveSnake, addPickup]);

  const animate = useCallback(
    (time: number) => {
      if (!previousTimeRef.current) {
        // Initialize on the first animation frame.
        previousTimeRef.current = time;
      }

      // Calculate the time elapsed since the last frame was rendered
      const deltaTime = time - previousTimeRef.current;

      // Update the previous time reference for the next frame calculation
      previousTimeRef.current = time;

      // Request the next animation frame to ensure smooth rendering
      if (!isGameFinished) {
        requestRef.current = requestAnimationFrame(animate);
      }

      // Accumulate the elapsed time to track how much time has passed in total
      accumulatorRef.current += deltaTime;

      // Continuously update the game state at a fixed rate (GAME_UPDATE_RATE)
      while (accumulatorRef.current >= GAME_UPDATE_RATE) {
        // Execute game logic updates
        gameLoop();
        // Consumes the fixed update rate from the accumulated time
        accumulatorRef.current -= GAME_UPDATE_RATE;
      }
    },
    [gameLoop, isGameFinished],
  );

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
      if (
        nextMove &&
        canSetDirection(nextMove) &&
        nextMoves.current.length < MAX_NEXT_MOVEMENTS
      ) {
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
          ? `${GAME_OVER_TITLE}: ${score}`
          : `${GAME_SCORE_TITLE}: ${score}`}
      </div>
      <table className="game-board">
        <tbody>{renderedGrid}</tbody>
      </table>
      <div>
        <button
          onClick={refreshPage}
          className="btn-board"
          disabled={!isGameFinished}
        >
          {RESTART_TEXT}
        </button>
      </div>
    </>
  );
}

export default GameBoard;
