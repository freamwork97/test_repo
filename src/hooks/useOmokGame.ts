
import { useState, useEffect, useCallback } from 'react';
import { checkWin, Player, BOARD_SIZE } from '../components/checkWin';
import { makeAIMove } from '../lib/ai';
import { isForbiddenMove } from '../lib/rules';

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

    const isBoardFull = (currentBoard: (Player | null)[][]): boolean => {
        return currentBoard.every(row => row.every(cell => cell !== null));
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

    const aiMove = useCallback(() => {
        const bestMove = makeAIMove(board, renjuRule);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, 'white');
        }
    }, [board, renjuRule, placeStone]);

    useEffect(() => {
        if (gameMode) {
            initializeBoard();
        }
    }, [gameMode, renjuRule, initializeBoard]);

    useEffect(() => {
        if (gameOver) return;
        if (gameMode === 'ai' && currentPlayer === 'white') {
            const timer = setTimeout(() => aiMove(), 500);
            return () => clearTimeout(timer);
        }
    }, [currentPlayer, gameOver, gameMode, aiMove]);

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
