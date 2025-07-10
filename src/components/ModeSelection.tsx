
import React from 'react';
import { GameMode } from '../hooks/useOmokGame';

interface ModeSelectionProps {
  startGame: (mode: GameMode) => void;
  renjuRule: boolean;
  setRenjuRule: (value: boolean) => void;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ startGame, renjuRule, setRenjuRule }) => {
  return (
    <div id="mode-selection">
      <h2>게임 모드 선택</h2>
      <button onClick={() => startGame('ai')}>플레이어 vs AI</button>
      <button onClick={() => startGame('human')}>플레이어 vs 플레이어</button>
      <div className="rule-selection">
        <label>
          <input
            type="checkbox"
            checked={renjuRule}
            onChange={() => setRenjuRule(!renjuRule)}
          />
          렌주룰 적용
        </label>
      </div>
    </div>
  );
};

export default ModeSelection;
