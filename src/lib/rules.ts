
import { Player, BOARD_SIZE } from './checkWin';

const isOnBoard = (r: number, c: number): boolean => {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
};

const countConsecutive = (board: (Player | null)[][], r: number, c: number, player: Player, dr: number, dc: number): number => {
    let count = 0;
    for (let i = 1; i < BOARD_SIZE; i++) {
        const nextR = r + i * dr;
        const nextC = c + i * dc;
        if (isOnBoard(nextR, nextC) && board[nextR][nextC] === player) {
            count++;
        } else {
            break;
        }
    }
    return count;
};

const analyzeLine = (board: (Player | null)[][], row: number, col: number, player: Player, dr: number, dc: number) => {
    let openThrees = 0;
    let fours = 0;

    const getCell = (offset: number) => {
        const r = row + offset * dr;
        const c = col + offset * dc;
        if (!isOnBoard(r, c)) return 'opponent';
        return board[r][c];
    };

    // Check for fours by finding 4 stones in a 5-cell window
    for (let i = -4; i <= 0; i++) {
        let stones = 0;
        let valid = true;
        for (let j = 0; j < 5; j++) {
            const cell = getCell(i + j);
            if (cell === player) {
                stones++;
            } else if (cell !== null) { // opponent or wall
                valid = false;
                break;
            }
        }
        if (valid && stones === 4) {
            fours++;
            break; 
        }
    }

    // Check for open threes (_OOO_ pattern) in a 5-cell window
    for (let i = -4; i <= 0; i++) {
        if (fours > 0) break; 
        const startCell = getCell(i);
        const endCell = getCell(i + 4);
        if (startCell === null && endCell === null) {
            let stones = 0;
            for (let j = 1; j < 4; j++) {
                if (getCell(i + j) === player) {
                    stones++;
                }
            }
            if (stones === 3) {
                openThrees++;
                break;
            }
        }
    }

    // Check for open threes (_O_OO_ or _OO_O_) in a 6-cell window
    if (openThrees === 0 && fours === 0) {
        for (let i = -5; i <= 0; i++) {
            const startCell = getCell(i);
            const endCell = getCell(i + 5);
            if (startCell === null && endCell === null) {
                let stones = 0;
                let emptyCount = 0;
                for (let j = 1; j < 5; j++) {
                    const cell = getCell(i + j);
                    if (cell === player) {
                        stones++;
                    } else if (cell === null) {
                        emptyCount++;
                    }
                }
                if (stones === 3 && emptyCount === 1) {
                    openThrees++;
                    break;
                }
            }
        }
    }

    return { openThrees, fours };
}


export const isForbiddenMove = (currentBoard: (Player | null)[][], row: number, col: number, player: Player): boolean => {
    if (player !== 'black') return false;

    const tempBoard = currentBoard.map(r => [...r]);
    if (isOnBoard(row, col) && tempBoard[row][col] !== null) {
        return false; 
    }
    tempBoard[row][col] = player;

    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    let totalOpenThrees = 0;
    let totalFours = 0;

    for (const [dr, dc] of directions) {
        const count = countConsecutive(tempBoard, row, col, player, dr, dc) + countConsecutive(tempBoard, row, col, player, -dr, -dc) + 1;
        if (count === 5) {
            return false; // A winning move is not forbidden
        }
        if (count >= 6) {
            return true; // Overline is forbidden
        }
    }

    for (const [dr, dc] of directions) {
        const { openThrees, fours } = analyzeLine(tempBoard, row, col, player, dr, dc);
        totalOpenThrees += openThrees;
        totalFours += fours;
    }

    if (totalOpenThrees >= 2) return true;
    if (totalFours >= 2) return true;

    return false;
};
