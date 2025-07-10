
import React from 'react';
import { Player, BOARD_SIZE } from './checkWin';

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
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`cell ${cell ? cell : ''} ${lastMove && lastMove.row === rowIndex && lastMove.col === colIndex ? 'last-move' : ''}`}
            onClick={() => handleCellClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default GameBoard;
