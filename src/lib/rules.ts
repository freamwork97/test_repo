
import { Player, BOARD_SIZE } from './checkWin';

/**
 * 주어진 좌표가 보드 내에 있는지 확인합니다.
 * @param r - 행
 * @param c - 열
 * @returns 보드 내에 있으면 true, 아니면 false
 */
const isOnBoard = (r: number, c: number): boolean => {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
};

/**
 * 특정 위치에서 한 방향으로 연속된 돌의 개수를 셉니다.
 * @param board - 게임 보드
 * @param r - 시작 행
 * @param c - 시작 열
 * @param player - 플레이어
 * @param dr - 행 방향
 * @param dc - 열 방향
 * @returns 연속된 돌의 개수
 */
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

/**
 * 특정 라인(가로, 세로, 대각선)을 분석하여 열린 3과 4의 개수를 찾습니다.
 * @param board - 게임 보드
 * @param row - 분석 기준 행
 * @param col - 분석 기준 열
 * @param player - 플레이어
 * @param dr - 행 방향
 * @param dc - 열 방향
 * @returns 열린 3과 4의 개수를 담은 객체 { openThrees, fours }
 */
const analyzeLine = (board: (Player | null)[][], row: number, col: number, player: Player, dr: number, dc: number) => {
    let openThrees = 0;
    let fours = 0;

    const getCell = (offset: number) => {
        const r = row + offset * dr;
        const c = col + offset * dc;
        if (!isOnBoard(r, c)) return 'opponent'; // 보드 밖은 상대방 돌로 간주
        return board[r][c];
    };

    // 5칸 창을 이동시키며 4가 있는지 확인합니다. (예: _OOOO_)
    for (let i = -4; i <= 0; i++) {
        let stones = 0;
        let valid = true;
        for (let j = 0; j < 5; j++) {
            const cell = getCell(i + j);
            if (cell === player) {
                stones++;
            } else if (cell !== null) { // 상대방 돌이 있으면 무효
                valid = false;
                break;
            }
        }
        if (valid && stones === 4) {
            fours++;
            break; 
        }
    }

    // 5칸 창을 이동시키며 열린 3 (OOO)이 있는지 확인합니다. (예: _OOO_)
    for (let i = -4; i <= 0; i++) {
        if (fours > 0) break; // 4를 만들면 3-3 체크는 무의미
        const startCell = getCell(i);
        const endCell = getCell(i + 4);
        if (startCell === null && endCell === null) { // 양쪽이 비어있어야 함
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

    // 6칸 창을 이동시키며 떨어진 열린 3 (O_OO 또는 OO_O)이 있는지 확인합니다. (예: _O_OO_)
    if (openThrees === 0 && fours === 0) {
        for (let i = -5; i <= 0; i++) {
            const startCell = getCell(i);
            const endCell = getCell(i + 5);
            if (startCell === null && endCell === null) { // 양쪽이 비어있어야 함
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
                if (stones === 3 && emptyCount === 1) { // 돌 3개, 빈칸 1개
                    openThrees++;
                    break;
                }
            }
        }
    }

    return { openThrees, fours };
}

/**
 * 흑돌의 금수(3-3, 4-4, 장목)를 판별하는 함수입니다.
 * @param currentBoard - 현재 게임 보드
 * @param row - 돌을 놓을 행
 * @param col - 돌을 놓을 열
 * @param player - 플레이어 (흑돌만 해당)
 * @returns 금수이면 true, 아니면 false
 */
export const isForbiddenMove = (currentBoard: (Player | null)[][], row: number, col: number, player: Player): boolean => {
    // 렌주룰은 흑돌에게만 적용됩니다.
    if (player !== 'black') return false;

    const tempBoard = currentBoard.map(r => [...r]);
    if (isOnBoard(row, col) && tempBoard[row][col] !== null) {
        return false; // 이미 돌이 있는 곳은 금수가 아님
    }
    tempBoard[row][col] = player;

    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    let totalOpenThrees = 0;
    let totalFours = 0;

    // 장목(6목 이상) 확인
    for (const [dr, dc] of directions) {
        const count = countConsecutive(tempBoard, row, col, player, dr, dc) + countConsecutive(tempBoard, row, col, player, -dr, -dc) + 1;
        if (count === 5) {
            return false; // 5목을 만드는 수는 금수가 아님 (승리)
        }
        if (count >= 6) {
            return true; // 6목 이상은 장목으로 금수
        }
    }

    // 3-3, 4-4 확인
    for (const [dr, dc] of directions) {
        const { openThrees, fours } = analyzeLine(tempBoard, row, col, player, dr, dc);
        totalOpenThrees += openThrees;
        totalFours += fours;
    }

    // 열린 3이 2개 이상이거나, 4가 2개 이상이면 금수
    if (totalOpenThrees >= 2) return true;
    if (totalFours >= 2) return true;

    return false;
};
