
import React from 'react';

interface ResetButtonProps {
  onClick: () => void;
}

const ResetButton: React.FC<ResetButtonProps> = ({ onClick }) => {
  return (
    <button id="reset-button" onClick={onClick}>
      게임 재시작
    </button>
  );
};

export default ResetButton;
