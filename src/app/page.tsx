"use client";

import { useState, useEffect } from 'react';

const BOARD_SIZE = 15;

type Player = 'black' | 'white';
type GameMode = 'ai' | 'human' | null;

export default function Home() {
    const [board, setBoard] = useState<(Player | null)[][]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
    const [gameOver, setGameOver] = useState(false);
    const [gameMode, setGameMode] = useState<GameMode>(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [lastMove, setLastMove] = useState<{ row: number, col: number } | null>(null);
    const [renjuRule, setRenjuRule] = useState(true);

    useEffect(() => {
        if (gameMode) {
            initializeBoard();
        }
    }, [gameMode, renjuRule]);

    useEffect(() => {
        if (gameOver) return;
        if (gameMode === 'ai' && currentPlayer === 'white') {
            const timer = setTimeout(() => makeAIMove(), 500);
            return () => clearTimeout(timer);
        }
    }, [currentPlayer, gameOver, gameMode]);

    const startGame = (mode: GameMode) => {
        setGameMode(mode);
    };

    const initializeBoard = () => {
        const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        setBoard(newBoard);
        setCurrentPlayer('black');
        setGameOver(false);
        setStatusMessage('현재 플레이어: 흑');
        setLastMove(null);
    };

    const handleCellClick = (row: number, col: number) => {
        if (gameOver || board[row][col] !== null) return;
        if (gameMode === 'ai' && currentPlayer === 'white') return;

        if (renjuRule && currentPlayer === 'black') {
            if (isForbiddenMove(board, row, col, 'black')) {
                setStatusMessage('금수입니다! 다른 곳에 두세요.');
                return;
            }
        }

        placeStone(row, col, currentPlayer);
    };

    const placeStone = (row: number, col: number, player: Player) => {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = player;
        setBoard(newBoard);
        setLastMove({ row, col });

        if (checkWin(newBoard, row, col)) {
            setStatusMessage(`${player === 'black' ? '흑' : '백'} 승리!`);
            setGameOver(true);
        } else if (isBoardFull(newBoard)) {
            setStatusMessage("무승부!");
            setGameOver(true);
        } else {
            const nextPlayer = player === 'black' ? 'white' : 'black';
            setCurrentPlayer(nextPlayer);
            setStatusMessage(`현재 플레이어: ${nextPlayer === 'black' ? '흑' : '백'}`);
        }
    };

    const checkWin = (currentBoard: (Player | null)[][], row: number, col: number): boolean => {
        const player = currentBoard[row][col];
        if (!player) return false;

        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];

        for (const [dr, dc] of directions) {
            let count = 1;
            // 한 방향으로 개수 세기
            for (let i = 1; i < BOARD_SIZE; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && currentBoard[r][c] === player) {
                    count++;
                } else {
                    break;
                }
            }
            // 반대 방향으로 개수 세기
            for (let i = 1; i < BOARD_SIZE; i++) {
                const r = row - dr * i;
                const c = col - dc * i;
                if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && currentBoard[r][c] === player) {
                    count++;
                } else {
                    break;
                }
            }

            // 승리 조건 확인
            if (count === 5) {
                return true; // 5목은 항상 승리입니다.
            }
            if (count > 5) {
                // 렌주룰이 켜져 있을 때, 백돌만 6목 이상으로 승리할 수 있습니다.
                if (renjuRule && player === 'white') {
                    return true;
                }
                // 그 외의 경우(렌주룰이 꺼져 있거나, 흑돌인 경우) 6목 이상은 승리가 아닙니다.
            }
        }
        return false;
    };

    const isForbiddenMove = (currentBoard: (Player | null)[][], row: number, col: number, player: Player): boolean => {
        if (player !== 'black') return false;

        const tempBoard = currentBoard.map(r => [...r]);
        tempBoard[row][col] = player;

        // 6목 이상 (장목) 체크
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        for (const [dr, dc] of directions) {
            let count = 1;
            for (let i = 1; i < 6; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && tempBoard[r][c] === player) count++;
                else break;
            }
            for (let i = 1; i < 6; i++) {
                const r = row - dr * i;
                const c = col - dc * i;
                if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && tempBoard[r][c] === player) count++;
                else break;
            }
            if (count > 5) return true;
        }

        // 3-3, 4-4 체크
        let openThrees = 0;
        let openFours = 0;
        for (const [dr, dc] of directions) {
            const result = isOpen(tempBoard, row, col, player, dr, dc);
            if (result === 3) openThrees++;
            if (result === 4) openFours++;
        }

        if (openThrees >= 2) return true;
        if (openFours >= 2) return true;

        return false;
    };

    const isOpen = (currentBoard: (Player | null)[][], row: number, col: number, player: Player, dr: number, dc: number): number => {
        let count = 1;
        let openEnds = 0;

        // 한 방향
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && currentBoard[r][c] === player) {
            count++;
            r += dr;
            c += dc;
        }
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && currentBoard[r][c] === null) {
            openEnds++;
        }

        // 반대 방향
        r = row - dr;
        c = col - dc;
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && currentBoard[r][c] === player) {
            count++;
            r -= dr;
            c -= dc;
        }
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && currentBoard[r][c] === null) {
            openEnds++;
        }

        if (openEnds === 2) return count;
        return 0;
    };

    const isBoardFull = (currentBoard: (Player | null)[][]): boolean => {
        return currentBoard.every(row => row.every(cell => cell !== null));
    };

    const makeAIMove = () => {
        if (gameOver) return;
    
        const aiPlayer = 'white';
        const humanPlayer = 'black';
    
        let bestMove: { row: number, col: number } | null = null;
    
        // 1. Find winning move for AI
        bestMove = findWinningMove(board, aiPlayer);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
            return;
        }
    
        // 2. Block human's winning move
        bestMove = findWinningMove(board, humanPlayer);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
            return;
        }
    
        // 3. Create a threat for AI (open 4)
        bestMove = findThreateningMove(board, aiPlayer, 4);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
            return;
        }
    
        // 4. Block human's threat (open 4)
        bestMove = findThreateningMove(board, humanPlayer, 4);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
            return;
        }
    
        // 5. Create a threat for AI (open 3)
        bestMove = findThreateningMove(board, aiPlayer, 3);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
            return;
        }
    
        // 6. Block human's threat (open 3)
        bestMove = findThreateningMove(board, humanPlayer, 3);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
            return;
        }
    
        // 7. Play a move near the opponent's stones
        bestMove = findRandomNearbyCell(board);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
            return;
        }

        // 8. As a last resort, play any random empty cell
        bestMove = findRandomEmptyCell(board);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
        }
    };

    const findWinningMove = (currentBoard: (Player | null)[][], player: Player): { row: number, col: number } | null => {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (currentBoard[r][c] === null) {
                    const tempBoard = currentBoard.map(row => [...row]);
                    tempBoard[r][c] = player;
                    if (checkWin(tempBoard, r, c)) {
                        return { row: r, col: c };
                    }
                }
            }
        }
        return null;
    };
    
    const findThreateningMove = (currentBoard: (Player | null)[][], player: Player, targetCount: number): { row: number, col: number } | null => {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (currentBoard[r][c] === null) {
                    if (player === 'black' && renjuRule && isForbiddenMove(currentBoard, r, c, 'black')) {
                        continue;
                    }
                    const tempBoard = currentBoard.map(row => [...row]);
                    tempBoard[r][c] = player;
                    if (checkLineForThreat(tempBoard, r, c, player, targetCount)) {
                        return { row: r, col: c };
                    }
                }
            }
        }
        return null;
    };
    
    const checkLineForThreat = (currentBoard: (Player | null)[][], row: number, col: number, player: Player, targetCount: number): boolean => {
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];
    
        for (const [dr, dc] of directions) {
            let currentCount = 1;
            let openEnds = 0;
    
            // 한 방향으로 탐색
            let r1 = row + dr;
            let c1 = col + dc;
            while (r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && currentBoard[r1][c1] === player) {
                currentCount++;
                r1 += dr;
                c1 += dc;
            }
            if (r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && currentBoard[r1][c1] === null) {
                openEnds++;
            }
    
            // 반대 방향으로 탐색
            let r2 = row - dr;
            let c2 = col - dc;
            while (r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && currentBoard[r2][c2] === player) {
                currentCount++;
                r2 -= dr;
                c2 -= dc;
            }
            if (r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && currentBoard[r2][c2] === null) {
                openEnds++;
            }
    
            if (targetCount === 4 && currentCount === 4 && openEnds >= 1) return true;
            if (targetCount === 3 && currentCount === 3 && openEnds === 2) return true;
        }
        return false;
    };

    const findRandomNearbyCell = (currentBoard: (Player | null)[][]): { row: number, col: number } | null => {
        const humanPlayer = 'black';
        const nearbyEmptyCells = new Set<string>();
    
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (currentBoard[r][c] === humanPlayer) {
                    // Check 8 neighbors
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue;
    
                            const nr = r + dr;
                            const nc = c + dc;
    
                            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && currentBoard[nr][nc] === null) {
                                nearbyEmptyCells.add(`${nr},${nc}`);
                            }
                        }
                    }
                }
            }
        }
    
        if (nearbyEmptyCells.size > 0) {
            const emptyCellsArray = Array.from(nearbyEmptyCells).map(s => {
                const [row, col] = s.split(',').map(Number);
                return { row, col };
            });
            const randomIndex = Math.floor(Math.random() * emptyCellsArray.length);
            return emptyCellsArray[randomIndex];
        }
    
        return null;
    };
    
    const findRandomEmptyCell = (currentBoard: (Player | null)[][]): { row: number, col: number } | null => {
        const emptyCells: { row: number, col: number }[] = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (currentBoard[r][c] === null) {
                    emptyCells.push({ row: r, col: c });
                }
            }
        }
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            return emptyCells[randomIndex];
        }
        return null;
    };

    return (
        <main>
            <h1>간단 오목</h1>

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
                    <div id="status" className={gameOver ? 'game-over-message' : ''}>
                        {statusMessage}
                    </div>
                    <div id="board" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 30px)` }}>
                        {board.map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`cell ${cell ? cell : ''} ${lastMove && lastMove.row === rowIndex && lastMove.col === colIndex ? 'last-move' : ''}`}
                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                />
                            ))
                        )}
                    </div>
                    <button id="reset-button" onClick={initializeBoard}>게임 재시작</button>
                </div>
            )}
        </main>
    );
}