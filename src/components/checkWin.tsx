export const BOARD_SIZE = 15;

export type Player = 'black' | 'white';

export const checkWin = (currentBoard: (Player | null)[][], row: number, col: number, renjuRule: boolean): boolean => {
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
