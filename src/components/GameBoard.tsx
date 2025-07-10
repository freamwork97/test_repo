
import React from 'react';
import { Player, BOARD_SIZE } from '../lib/checkWin';
import GameCell from './GameCell';

interface GameBoardProps {
  board: (Player | null)[][];
  handleCellClick: (row: number, col: number) => void;
  lastMove: { row: number, col: number } | null;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, handleCellClick, lastMove }) => {
  return (
    <div id="board" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 30px)` }}>
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <GameCell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            isLastMove={lastMove?.row === rowIndex && lastMove?.col === colIndex}
            onClick={() => handleCellClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default GameBoard;
