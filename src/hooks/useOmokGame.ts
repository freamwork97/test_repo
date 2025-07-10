
import { useState, useEffect, useCallback } from 'react';
import { checkWin, Player, BOARD_SIZE } from '../components/checkWin';

export type GameMode = 'ai' | 'human' | null;

export const useOmokGame = () => {
    const [board, setBoard] = useState<(Player | null)[][]>([]);
    const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
    const [gameOver, setGameOver] = useState(false);
    const [gameMode, setGameMode] = useState<GameMode>(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [lastMove, setLastMove] = useState<{ row: number, col: number } | null>(null);
    const [renjuRule, setRenjuRule] = useState(true);
    const [history, setHistory] = useState<{ board: (Player | null)[][], currentPlayer: Player, lastMove: { row: number, col: number } | null }[]>([]);

    const initializeBoard = useCallback(() => {
        const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        setBoard(newBoard);
        setCurrentPlayer('black');
        setGameOver(false);
        setStatusMessage('현재 플레이어: 흑');
        setLastMove(null);
        setHistory([]);
    }, []);

    const startGame = (mode: GameMode) => {
        setGameMode(mode);
    };

    const placeStone = useCallback((row: number, col: number, player: Player) => {
        const newHistory = [...history, { board, currentPlayer, lastMove }];
        setHistory(newHistory);

        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = player;
        setBoard(newBoard);
        setLastMove({ row, col });

        if (checkWin(newBoard, row, col, renjuRule)) {
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
    }, [board, currentPlayer, history, lastMove, renjuRule]);

    const isForbiddenMove = (currentBoard: (Player | null)[][], row: number, col: number, player: Player): boolean => {
        if (player !== 'black') return false;

        const tempBoard = currentBoard.map(r => [...r]);
        tempBoard[row][col] = player;

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

    const findWinningMove = (currentBoard: (Player | null)[][], player: Player): { row: number, col: number } | null => {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (currentBoard[r][c] === null) {
                    const tempBoard = currentBoard.map(row => [...row]);
                    tempBoard[r][c] = player;
                    if (checkWin(tempBoard, r, c, renjuRule)) {
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

    const makeAIMove = useCallback(() => {
        if (gameOver) return;

        const aiPlayer = 'white';
        const humanPlayer = 'black';

        let bestMove: { row: number, col: number } | null = null;

        bestMove = findWinningMove(board, aiPlayer);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
            return;
        }

        bestMove = findWinningMove(board, humanPlayer);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
            return;
        }

        bestMove = findThreateningMove(board, aiPlayer, 4);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
            return;
        }

        bestMove = findThreateningMove(board, humanPlayer, 4);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
            return;
        }

        bestMove = findThreateningMove(board, aiPlayer, 3);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
            return;
        }

        bestMove = findThreateningMove(board, humanPlayer, 3);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
            return;
        }

        bestMove = findRandomNearbyCell(board);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
            return;
        }

        bestMove = findRandomEmptyCell(board);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, aiPlayer);
        }
    }, [board, gameOver, placeStone, renjuRule]);

    useEffect(() => {
        if (gameMode) {
            initializeBoard();
        }
    }, [gameMode, renjuRule, initializeBoard]);

    useEffect(() => {
        if (gameOver) return;
        if (gameMode === 'ai' && currentPlayer === 'white') {
            const timer = setTimeout(() => makeAIMove(), 500);
            return () => clearTimeout(timer);
        }
    }, [currentPlayer, gameOver, gameMode, makeAIMove]);

    const handleCellClick = (row: number, col: number) => {
        if (gameOver || board[row]?.[col] !== null) return;
        if (gameMode === 'ai' && currentPlayer === 'white') return;

        if (renjuRule && currentPlayer === 'black') {
            if (isForbiddenMove(board, row, col, 'black')) {
                setStatusMessage('금수입니다! 다른 곳에 두세요.');
                return;
            }
        }

        placeStone(row, col, currentPlayer);
    };

    const handleUndo = () => {
        if (history.length === 0) return;

        let lastState = history[history.length - 1];
        let newHistory = history.slice(0, history.length - 1);

        if (gameMode === 'ai' && currentPlayer === 'black' && history.length > 1) {
            lastState = history[history.length - 2];
            newHistory = history.slice(0, history.length - 2);
        }

        setBoard(lastState.board);
        setCurrentPlayer(lastState.currentPlayer);
        setLastMove(lastState.lastMove);
        setHistory(newHistory);
        setGameOver(false);
        setStatusMessage(`현재 플레이어: ${lastState.currentPlayer === 'black' ? '흑' : '백'}`);
    };

    return {
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
    };
};
