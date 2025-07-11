
import { Player, BOARD_SIZE, checkWin } from './checkWin';
import { isForbiddenMove } from './rules';

/**
 * 특정 플레이어가 이길 수 있는 수를 찾습니다.
 * @param currentBoard - 현재 게임 보드 상태
 * @param player - 수를 찾을 플레이어 ('black' 또는 'white')
 * @param renjuRule - 렌주룰 적용 여부
 * @returns 이길 수 있는 수의 위치 { row, col } 또는 null
 */
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

/**
 * 특정 플레이어가 위협적인 수(열린 3, 4 등)를 만들 수 있는 위치를 찾습니다.
 * @param currentBoard - 현재 게임 보드 상태
 * @param player - 수를 찾을 플레이어
 * @param targetCount - 목표로 하는 연속된 돌의 수 (예: 3 또는 4)
 * @param renjuRule - 렌주룰 적용 여부
 * @returns 위협적인 수의 위치 { row, col } 또는 null
 */
const findThreateningMove = (currentBoard: (Player | null)[][], player: Player, targetCount: number, renjuRule: boolean): { row: number, col: number } | null => {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (currentBoard[r][c] === null) {
                // 흑돌의 경우 렌주룰에 따른 금수 자리는 피합니다.
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

/**
 * 특정 위치에 돌을 놓았을 때, 해당 라인에 위협적인 패턴(열린 3, 4)이 만들어지는지 확인합니다.
 * @param currentBoard - 현재 게임 보드 상태
 * @param row - 돌을 놓은 행
 * @param col - 돌을 놓은 열
 * @param player - 플레이어
 * @param targetCount - 목표로 하는 연속된 돌의 수
 * @returns 위협적인 패턴이 만들어지면 true, 아니면 false
 */
const checkLineForThreat = (currentBoard: (Player | null)[][], row: number, col: number, player: Player, targetCount: number): boolean => {
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1] // 가로, 세로, 대각선 방향
    ];

    for (const [dr, dc] of directions) {
        let currentCount = 1;
        let openEnds = 0;

        // 한쪽 방향으로 연속된 돌의 수를 셉니다.
        let r1 = row + dr;
        let c1 = col + dc;
        while (r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && currentBoard[r1][c1] === player) {
            currentCount++;
            r1 += dr;
            c1 += dc;
        }
        // 연속된 돌의 끝이 비어있는지 확인합니다.
        if (r1 >= 0 && r1 < BOARD_SIZE && c1 >= 0 && c1 < BOARD_SIZE && currentBoard[r1][c1] === null) {
            openEnds++;
        }

        // 반대쪽 방향으로 연속된 돌의 수를 셉니다.
        let r2 = row - dr;
        let c2 = col - dc;
        while (r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && currentBoard[r2][c2] === player) {
            currentCount++;
            r2 -= dr;
            c2 -= dc;
        }
        // 연속된 돌의 끝이 비어있는지 확인합니다.
        if (r2 >= 0 && r2 < BOARD_SIZE && c2 >= 0 && c2 < BOARD_SIZE && currentBoard[r2][c2] === null) {
            openEnds++;
        }

        // 목표 수와 일치하고, 양쪽 또는 한쪽이 열려있는지 확인합니다.
        if (targetCount === 4 && currentCount === 4 && openEnds >= 1) return true; // 4-4를 만들기 위한 열린 4
        if (targetCount === 3 && currentCount === 3 && openEnds === 2) return true; // 3-3을 만들기 위한 열린 3
    }
    return false;
};

/**
 * 상대방(사람) 돌 주변의 비어있는 셀을 무작위로 찾습니다.
 * @param currentBoard - 현재 게임 보드 상태
 * @returns 비어있는 셀의 위치 { row, col } 또는 null
 */
const findRandomNearbyCell = (currentBoard: (Player | null)[][]): { row: number, col: number } | null => {
    const humanPlayer = 'black';
    const nearbyEmptyCells = new Set<string>();

    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (currentBoard[r][c] === humanPlayer) {
                // 상대방 돌 주변 8방향을 탐색합니다.
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

/**
 * 보드에서 비어있는 셀을 무작위로 찾습니다.
 * @param currentBoard - 현재 게임 보드 상태
 * @returns 비어있는 셀의 위치 { row, col } 또는 null
 */
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

/**
 * AI가 다음 수를 결정하는 메인 함수입니다.
 * 우선순위에 따라 최적의 수를 찾습니다: (1) AI 승리 (2) 상대방 승리 방어 (3) AI 열린 4 (4) 상대방 열린 4 방어 (5) AI 열린 3 (6) 상대방 열린 3 방어 (7) 상대방 돌 주변 (8) 무작위
 * @param board - 현재 게임 보드 상태
 * @param renjuRule - 렌주룰 적용 여부
 * @returns AI가 둘 최적의 위치 { row, col } 또는 null
 */
export const makeAIMove = (board: (Player | null)[][], renjuRule: boolean): { row: number, col: number } | null => {
    const aiPlayer = 'white';
    const humanPlayer = 'black';

    let bestMove: { row: number, col: number } | null = null;

    // 1. AI가 이길 수 있는 수가 있는지 확인
    bestMove = findWinningMove(board, aiPlayer, renjuRule);
    if (bestMove) return bestMove;

    // 2. 상대방(사람)이 이길 수 있는 수가 있는지 확인하고 방어
    bestMove = findWinningMove(board, humanPlayer, renjuRule);
    if (bestMove) return bestMove;

    // 3. AI가 열린 4를 만들 수 있는 수가 있는지 확인
    bestMove = findThreateningMove(board, aiPlayer, 4, renjuRule);
    if (bestMove) return bestMove;

    // 4. 상대방이 열린 4를 만들 수 있는 수가 있는지 확인하고 방어
    bestMove = findThreateningMove(board, humanPlayer, 4, renjuRule);
    if (bestMove) return bestMove;

    // 5. AI가 열린 3을 만들 수 있는 수가 있는지 확인
    bestMove = findThreateningMove(board, aiPlayer, 3, renjuRule);
    if (bestMove) return bestMove;

    // 6. 상대방이 열린 3을 만들 수 있는 수가 있는지 확인하고 방어
    bestMove = findThreateningMove(board, humanPlayer, 3, renjuRule);
    if (bestMove) return bestMove;

    // 7. 상대방 돌 주변에 두어 공격과 방어를 동시에 준비
    bestMove = findRandomNearbyCell(board);
    if (bestMove) return bestMove;

    // 8. 둘 곳이 없으면 무작위로 비어있는 곳에 둠
    bestMove = findRandomEmptyCell(board);
    if (bestMove) return bestMove;

    return null;
};
