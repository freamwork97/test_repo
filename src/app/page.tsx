
"use client";

import GameBoard from '../components/GameBoard';
import GameInfo from '../components/GameInfo';
import ResetButton from '../components/ResetButton';
import GameTitle from '../components/GameTitle';
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
                <div id="mode-selection">
                    <h2>게임 모드 선택</h2>
                    <button onClick={() => startGame('ai')}>플레이어 vs AI</button>
                    <button onClick={() => startGame('human')}>플레이어 vs 플레이어</button>
                    <div className="rule-selection">
                        <label>
                            <input
                                type="checkbox"
                                checked={renjuRule}
                                onChange={() => setRenjuRule(!renjuRule)}
                            />
                            렌주룰 적용
                        </label>
                    </div>
                </div>
            ) : (
                <div id="game-container">
                    <GameInfo statusMessage={statusMessage} gameOver={gameOver} />
                    <GameBoard board={board} handleCellClick={handleCellClick} lastMove={lastMove} />
                    <button id="undo-button" onClick={handleUndo} disabled={history.length === 0}>
                        무르기
                    </button>
                    <ResetButton onClick={initializeBoard} />
                </div>
            )}
        </main>
    );
}
