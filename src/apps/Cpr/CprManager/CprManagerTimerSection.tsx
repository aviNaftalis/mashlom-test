import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyringe, faBoltLightning } from '@fortawesome/free-solid-svg-icons';
import { formatTime } from './utils'; // We'll create this utility function

interface CprManagerTimerSectionProps {
  elapsedTime: number;
  displayTimer: number;
  isRunning: boolean;
  adrenalineCount: number;
  shockCount: number;
  timerDisplay: 'none' | 'massager' | 'adrenaline';
  onIncrementAdrenaline: () => void;
  onIncrementShock: () => void;
}

export const CprManagerTimerSection: React.FC<CprManagerTimerSectionProps> = ({
  elapsedTime,
  displayTimer,
  isRunning,
  adrenalineCount,
  shockCount,
  timerDisplay,
  onIncrementAdrenaline,
  onIncrementShock
}) => {
  return (
    <div className="timer-section">
      <div className="elapsed-time">{formatTime(elapsedTime)}</div>
      {timerDisplay !== 'none' && (
        <div className={`countdown-time ${displayTimer === 0 ? 'zero' : ''}`}>
          {formatTime(displayTimer)}
        </div>
      )}
      
      <div className="counter-section">
        <div 
          className={`counter-item ${isRunning ? 'active' : ''}`}
          onClick={onIncrementAdrenaline}
        >
          <FontAwesomeIcon icon={faSyringe} />
          <span>אדרנלין: {adrenalineCount}</span>
        </div>
        
        <div 
          className={`counter-item ${isRunning ? 'active' : ''}`}
          onClick={onIncrementShock}
        >
          <FontAwesomeIcon icon={faBoltLightning} />
          <span>שוק: {shockCount}</span>
        </div>
      </div>
    </div>
  );
};