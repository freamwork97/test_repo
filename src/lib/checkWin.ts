/**
 * 오목판의 크기를 정의합니다. (15x15)
 */
export const BOARD_SIZE = 15;

/**
 * 플레이어 타입을 정의합니다. 'black' 또는 'white'입니다.
 */
export type Player = 'black' | 'white';

/**
 * 특정 위치에 돌을 놓았을 때, 해당 플레이어가 승리했는지 확인하는 함수입니다.
 * @param currentBoard - 현재 게임 보드 상태
 * @param row - 마지막으로 돌을 놓은 행
 * @param col - 마지막으로 돌을 놓은 열
 * @param renjuRule - 렌주룰 적용 여부
 * @returns 승리했으면 true, 아니면 false를 반환합니다.
 */
export const checkWin = (currentBoard: (Player | null)[][], row: number, col: number, renjuRule: boolean): boolean => {
    const player = currentBoard[row][col];
    if (!player) return false; // 해당 위치에 돌이 없으면 승리 여부를 확인할 수 없습니다.

    // 확인할 4가지 방향: 가로, 세로, 우하향 대각선, 우상향 대각선
    const directions = [
        [0, 1], // 가로
        [1, 0], // 세로
        [1, 1], // 우하향 대각선
        [1, -1] // 우상향 대각선
    ];

    for (const [dr, dc] of directions) {
        let count = 1; // 현재 돌을 포함하여 1부터 시작합니다.

        // 한쪽 방향으로 연속된 돌의 개수를 셉니다.
        for (let i = 1; i < BOARD_SIZE; i++) {
            const r = row + dr * i;
            const c = col + dc * i;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && currentBoard[r][c] === player) {
                count++;
            } else {
                break; // 다른 돌을 만나거나 보드를 벗어나면 중단합니다.
            }
        }

        // 반대쪽 방향으로 연속된 돌의 개수를 셉니다.
        for (let i = 1; i < BOARD_SIZE; i++) {
            const r = row - dr * i;
            const c = col - dc * i;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && currentBoard[r][c] === player) {
                count++;
            } else {
                break; // 다른 돌을 만나거나 보드를 벗어나면 중단합니다.
            }
        }

        // 승리 조건을 확인합니다.
        if (count === 5) {
            return true; // 정확히 5개의 돌이 연속되면 항상 승리입니다.
        }
        if (count > 5) {
            // 렌주룰이 적용되었을 때, 백돌은 6목 이상(장목)으로도 승리할 수 있습니다.
            if (renjuRule && player === 'white') {
                return true;
            }
            // 렌주룰에서 흑돌의 장목은 금수이며, 승리가 아닙니다.
            // 렌주룰이 꺼져있다면 6목 이상도 승리로 처리할 수 있으나, 현재는 5목만 승리로 간주합니다.
        }
    }

    return false; // 어떤 방향으로도 승리 조건을 만족하지 못했습니다.
};
