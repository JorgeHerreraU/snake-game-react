import { useState } from "react";
import GameBoard from "./GameBoard";
import { Difficulty } from "./difficulty";

function GameMenu() {
    const [startGame, setStartGame] = useState(false);
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
    const [size, setSize] = useState(10);

    const highScore = localStorage.getItem('highScore') || '0';

    const handleDifficulty = (difficulty: Difficulty) => {
        const gridSize: Record<Difficulty, number> = {
            [Difficulty.Easy]: 10,
            [Difficulty.Medium]: 12,
            [Difficulty.Hard]: 14
        };
        setSize(gridSize[difficulty]);
        setDifficulty(difficulty);

    };

    if (startGame) {
        return <GameBoard size={size} difficulty={difficulty} />;
    } else {
        return (
            <>
                <h1 className="snake-title">Snake Game</h1>
                <h2>High Score: {highScore}</h2>
                <img src="assets/snake-start-logo.svg" className="snake-logo" alt="Game Logo" />
                <h2>Choose Difficulty</h2>
                <div className="difficulty-buttons">
                    <button
                        className="cartoon-button color-red"
                        onClick={() => handleDifficulty(Difficulty.Easy)}
                        style={{ opacity: difficulty === Difficulty.Easy ? 1.0 : 0.5 }}>
                        Easy
                    </button>
                    <button
                        className="cartoon-button color-blue"
                        onClick={() => handleDifficulty(Difficulty.Medium)}
                        style={{ opacity: difficulty === Difficulty.Medium ? 1.0 : 0.5 }}>
                        Medium
                    </button>
                    <button
                        className="cartoon-button color-cyan"
                        onClick={() => handleDifficulty(Difficulty.Hard)}
                        style={{ opacity: difficulty === Difficulty.Hard ? 1.0 : 0.5, }}>
                        Hard
                    </button>
                </div>
                <div className="game-hint">
                    <h2>Control the snake with the arrow keys!</h2>
                    <div className="arrow-keys"> ← ↑ ↓ →</div>
                </div>
                <h2>Press <button onClick={() => setStartGame(true)} disabled={difficulty === null}>Start</button> To Play</h2>
            </>
        );
    }
}

export default GameMenu;