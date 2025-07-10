
import React from 'react';
import { Player } from '../lib/checkWin';

interface GameCellProps {
  cell: Player | null;
  isLastMove: boolean;
  onClick: () => void;
}

const GameCell: React.FC<GameCellProps> = ({ cell, isLastMove, onClick }) => {
  const cellClass = `cell ${cell || ''} ${isLastMove ? 'last-move' : ''}`;

  return (
    <div
      className={cellClass}
      onClick={onClick}
    />
  );
};

export default GameCell;
