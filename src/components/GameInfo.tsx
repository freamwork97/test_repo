
import React from 'react';

interface GameInfoProps {
  statusMessage: string;
  gameOver: boolean;
}

const GameInfo: React.FC<GameInfoProps> = ({ statusMessage, gameOver }) => {
  return (
    <div id="status" className={gameOver ? 'game-over-message' : ''}>
      {statusMessage}
    </div>
  );
};

export default GameInfo;
