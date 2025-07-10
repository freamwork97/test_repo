
import { Player, BOARD_SIZE } from '../components/checkWin';

export const isForbiddenMove = (currentBoard: (Player | null)[][], row: number, col: number, player: Player): boolean => {
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
