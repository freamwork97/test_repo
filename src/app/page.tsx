
"use client";

import GameBoard from '../components/GameBoard';
import GameInfo from '../components/GameInfo';
import ResetButton from '../components/ResetButton';
import GameTitle from '../components/GameTitle';
import ModeSelection from '../components/ModeSelection';
import UndoButton from '../components/UndoButton';
import { useOmokGame, GameMode } from '../hooks/useOmokGame';

export default function Home() {
    const {
        board,
        gameMode,
        statusMessage,
        gameOver,
        lastMove,
        renjuRule,
        history,
        startGame,
        handleCellClick,
        handleUndo,
        initializeBoard,
        setRenjuRule
    } = useOmokGame();

    return (
        <main>
            <GameTitle />

            {!gameMode ? (
                <ModeSelection startGame={startGame} renjuRule={renjuRule} setRenjuRule={setRenjuRule} />
            ) : (
                <div id="game-container">
                    <GameInfo statusMessage={statusMessage} gameOver={gameOver} />
                    <GameBoard board={board} handleCellClick={handleCellClick} lastMove={lastMove} />
                    <UndoButton onClick={handleUndo} disabled={history.length === 0} />
                    <ResetButton onClick={initializeBoard} />
                </div>
            )}
        </main>
    );
}
