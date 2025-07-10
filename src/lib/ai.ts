
import { Player, BOARD_SIZE, checkWin } from './checkWin';
import { isForbiddenMove } from './rules';

const findWinningMove = (currentBoard: (Player | null)[][], player: Player, renjuRule: boolean): { row: number, col: number } | null => {
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

const findThreateningMove = (currentBoard: (Player | null)[][], player: Player, targetCount: number, renjuRule: boolean): { row: number, col: number } | null => {
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

export const makeAIMove = (board: (Player | null)[][], renjuRule: boolean): { row: number, col: number } | null => {
    const aiPlayer = 'white';
    const humanPlayer = 'black';

    let bestMove: { row: number, col: number } | null = null;

    bestMove = findWinningMove(board, aiPlayer, renjuRule);
    if (bestMove) return bestMove;

    bestMove = findWinningMove(board, humanPlayer, renjuRule);
    if (bestMove) return bestMove;

    bestMove = findThreateningMove(board, aiPlayer, 4, renjuRule);
    if (bestMove) return bestMove;

    bestMove = findThreateningMove(board, humanPlayer, 4, renjuRule);
    if (bestMove) return bestMove;

    bestMove = findThreateningMove(board, aiPlayer, 3, renjuRule);
    if (bestMove) return bestMove;

    bestMove = findThreateningMove(board, humanPlayer, 3, renjuRule);
    if (bestMove) return bestMove;

    bestMove = findRandomNearbyCell(board);
    if (bestMove) return bestMove;

    bestMove = findRandomEmptyCell(board);
    if (bestMove) return bestMove;

    return null;
};
