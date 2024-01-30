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
import { Point } from "./point";
import { Direction } from "./direction.ts";

type BoardState = {
  snake: Point[];
  grid: Square[][];
  food: Point;
};

function GameBoard({ size = 10 }) {
  const [score, setScore] = useState(0);
  const [boardState, setBoardState] = useState<BoardState>(setupGame());
  const [direction, setDirection] = useState<Direction>(Direction.Right);
  const [isGameFinished, setIsGameFinished] = useState(false);

  // declaration to store the animation reference id
  const requestRef = useRef<number | null>();
  // declaration to store the timestamp of the last animation frame
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

  const getSquare = useCallback(
    (prev: Point, current: Point, next: Point): Square => {
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
    },
    [],
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
        newGrid[current.y][current.x] = getSquare(prev, current, next);
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

  /**
   * Define `animate` as a callback function that gets memoized by `useCallback` to prevent unnecessary re-creations
   * This function is designed to be passed to `requestAnimationFrame` for creating smooth animations
   * `time` parameter represents the current time (in milliseconds) when the callback is executed
   */
  const animate = useCallback(
    (time: number) => {
      // Check if `previousTimeRef.current` has been initialized
      // This is necessary because during the first call, `previousTimeRef.current` won't have a value yet
      if (previousTimeRef.current != undefined) {
        // Calculate `deltaTime` as the difference between the current time and the last recorded time
        // This measures how much time has passed since the last frame was rendered
        const deltaTime = time - previousTimeRef.current;

        // Check if `deltaTime` exceeds 150 milliseconds, the threshold for updating the game state
        // This condition ensures that the game logic updates at a controlled rate, not necessarily every frame
        // This is useful for throttling the game's update rate to make it independent of the frame rate
        if (deltaTime > 150) {
          // Call `gameLoop` to update the game state based on the current `deltaTime`
          // This includes moving the snake, checking for collisions, and possibly ending the game
          gameLoop();
          // Update `previousTimeRef.current` with the current time
          // This sets the baseline for calculating `deltaTime` in the next animation frame
          previousTimeRef.current = time;
        }
      } else {
        // Initialize `previousTimeRef.current` with the current time during the first animation frame
        // This is necessary for the `deltaTime` calculation in subsequent frames
        previousTimeRef.current = time;
      }
      // Check if the game is not finished to decide whether to continue the animation
      if (!isGameFinished) {
        // Request the next animation frame by calling `requestAnimationFrame` with `animate`
        // The returned request ID is stored in `requestRef.current` for potential cancellation
        // This creates a loop, with `animate` being called before the next repaint
        requestRef.current = requestAnimationFrame(animate);
      }
    },
    // Include `gameLoop` and `isGameFinished` in the dependency array of `useCallback`
    // This ensures that `animate` uses the latest state and functions
    // `useCallback` will create a new instance of `animate` only if these dependencies change
    [gameLoop, isGameFinished],
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
    const handleKey = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [handleKeyDown]);

  const renderedGrid = useMemo(
    () => renderGrid(boardState.grid),
    [boardState.grid],
  );

  return (
    <>
      <h1 className="score-text">SCORE: {score}</h1>
      <table className="game-board">
        <tbody>{renderedGrid}</tbody>
      </table>
    </>
  );
}

export default GameBoard;
