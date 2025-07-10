
import React from 'react';

interface UndoButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const UndoButton: React.FC<UndoButtonProps> = ({ onClick, disabled }) => {
  return (
    <button id="undo-button" onClick={onClick} disabled={disabled}>
      무르기
    </button>
  );
};

export default UndoButton;
