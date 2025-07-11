
import { useState, useEffect, useCallback } from 'react';
import { checkWin, Player, BOARD_SIZE } from '../lib/checkWin';
import { makeAIMove } from '../lib/ai';
import { isForbiddenMove } from '../lib/rules';

// 게임 모드를 정의합니다: 'ai'는 인공지능 대전, 'human'은 2인 대전, null은 아직 선택되지 않은 상태입니다.
export type GameMode = 'ai' | 'human' | null;

/**
 * 오목 게임의 핵심 로직을 관리하는 커스텀 훅입니다.
 * 게임 보드 상태, 플레이어, 게임 모드, 승패 여부 등 게임에 필요한 모든 상태와 기능을 포함합니다.
 */
export const useOmokGame = () => {
    // 게임 보드의 상태를 저장합니다. 2차원 배열로, 각 셀은 'black', 'white', 또는 null 값을 가집니다.
    const [board, setBoard] = useState<(Player | null)[][]>([]);
    // 현재 플레이어를 저장합니다. 'black' 또는 'white'입니다.
    const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
    // 게임이 종료되었는지 여부를 저장합니다.
    const [gameOver, setGameOver] = useState(false);
    // 현재 게임 모드를 저장합니다.
    const [gameMode, setGameMode] = useState<GameMode>(null);
    // 게임 상태 메시지를 저장합니다. (예: "현재 플레이어: 흑", "백 승리!")
    const [statusMessage, setStatusMessage] = useState('');
    // 마지막으로 둔 돌의 위치를 저장합니다.
    const [lastMove, setLastMove] = useState<{ row: number, col: number } | null>(null);
    // 렌주룰 적용 여부를 저장합니다.
    const [renjuRule, setRenjuRule] = useState(true);
    // 게임의 이전 상태들을 저장하여 무르기 기능을 구현합니다.
    const [history, setHistory] = useState<{ board: (Player | null)[][], currentPlayer: Player, lastMove: { row: number, col: number } | null }[]>([]);

    /**
     * 게임 보드를 초기화하는 함수입니다.
     * 모든 상태를 기본값으로 설정하고 새로운 게임을 시작할 준비를 합니다.
     */
    const initializeBoard = useCallback(() => {
        const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        setBoard(newBoard);
        setCurrentPlayer('black');
        setGameOver(false);
        setStatusMessage('현재 플레이어: 흑');
        setLastMove(null);
        setHistory([]);
    }, []);

    /**
     * 선택된 게임 모드로 게임을 시작하는 함수입니다.
     * @param mode - 선택된 게임 모드 ('ai' 또는 'human')
     */
    const startGame = (mode: GameMode) => {
        setGameMode(mode);
    };

    /**
     * 게임 보드가 가득 찼는지 확인하는 함수입니다.
     * @param currentBoard - 현재 게임 보드 상태
     * @returns 모든 셀이 채워져 있으면 true, 아니면 false를 반환합니다.
     */
    const isBoardFull = (currentBoard: (Player | null)[][]): boolean => {
        return currentBoard.every(row => row.every(cell => cell !== null));
    };

    /**
     * 지정된 위치에 돌을 놓는 함수입니다.
     * 돌을 놓은 후 승패 여부, 무승부 여부를 확인하고 다음 플레이어로 상태를 업데이트합니다.
     * @param row - 돌을 놓을 행
     * @param col - 돌을 놓을 열
     * @param player - 돌을 놓는 플레이어
     */
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

    /**
     * AI가 다음 수를 두도록 하는 함수입니다.
     * `makeAIMove` 함수를 통해 최적의 수를 계산하고 `placeStone` 함수를 호출하여 돌을 놓습니다.
     */
    const aiMove = useCallback(() => {
        const bestMove = makeAIMove(board, renjuRule);
        if (bestMove) {
            placeStone(bestMove.row, bestMove.col, 'white');
        }
    }, [board, renjuRule, placeStone]);

    // 게임 모드가 변경되면 보드를 초기화합니다.
    useEffect(() => {
        if (gameMode) {
            initializeBoard();
        }
    }, [gameMode, renjuRule, initializeBoard]);

    // AI 대전 모드에서 현재 플레이어가 'white'일 때 AI가 수를 두도록 합니다.
    useEffect(() => {
        if (gameOver) return;
        if (gameMode === 'ai' && currentPlayer === 'white') {
            const timer = setTimeout(() => aiMove(), 500); // AI가 생각하는 것처럼 보이도록 0.5초 지연
            return () => clearTimeout(timer);
        }
    }, [currentPlayer, gameOver, gameMode, aiMove]);

    /**
     * 사용자가 보드의 셀을 클릭했을 때 호출되는 함수입니다.
     * 게임 규칙에 따라 유효한 수인 경우 `placeStone` 함수를 호출합니다.
     * @param row - 클릭된 셀의 행
     * @param col - 클릭된 셀의 열
     */
    const handleCellClick = (row: number, col: number) => {
        if (gameOver || board[row]?.[col] !== null) return; // 게임이 끝났거나 이미 돌이 있는 경우 무시
        if (gameMode === 'ai' && currentPlayer === 'white') return; // AI 턴일 때 사용자 입력 무시

        // 렌주룰이 적용된 경우, 흑돌의 금수 자리를 확인합니다.
        if (renjuRule && currentPlayer === 'black') {
            if (isForbiddenMove(board, row, col, 'black')) {
                setStatusMessage('금수입니다! 다른 곳에 두세요.');
                return;
            }
        }

        placeStone(row, col, currentPlayer);
    };

    /**
     * 무르기 기능을 처리하는 함수입니다.
     * `history`에 저장된 이전 상태로 게임을 되돌립니다.
     * AI 대전 모드에서는 사용자의 수와 AI의 수를 함께 되돌립니다.
     */
    const handleUndo = () => {
        if (history.length === 0) return;

        let lastState = history[history.length - 1];
        let newHistory = history.slice(0, history.length - 1);

        // AI 모드에서는 플레이어와 AI의 수를 한 번에 무릅니다.
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

    // 훅이 반환하는 상태와 함수들입니다.
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
