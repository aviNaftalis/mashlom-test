import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeLow, faRepeat, faSyringe, faBoltLightning, faGear } from '@fortawesome/free-solid-svg-icons';
import Metronome from './Metronome';
import { useNotification } from './Notifications';
import { useCPRLog } from './CPRLog';
import Modal, { ModalDirectionOptions } from '../../components/Modal';
import SettingsModal from './SettingsModal';
import { useCPRSettings } from './CPRSettings';
import './CprManager.css';

// Define the context interface
interface CPRCountersContextType {
  adrenalineCount: number;
  shockCount: number;
  isRunning: boolean;
  incrementAdrenaline: () => void;
  incrementShock: () => void;
}

// Create the context
export const CPRCountersContext = createContext<CPRCountersContextType | undefined>(undefined);

// Create a hook for easy context usage
export const useCPRCounters = () => {
  const context = useContext(CPRCountersContext);
  if (context === undefined) {
    throw new Error('useCPRCounters must be used within a CPRCountersProvider');
  }
  return context;
};

interface CprManagerProps {
  // Add any props if needed
}

const CprManager: React.FC<CprManagerProps> = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [massagerTime, setMassagerTime] = useState(0);
  const [adrenalineTime, setAdrenalineTime] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [deathTime, setDeathTime] = useState('');
  const [adrenalineCount, setAdrenalineCount] = useState(0);
  const [shockCount, setShockCount] = useState(0);
  const massagerNotificationShownRef = useRef(false);
  const adrenalineNotificationShownRef = useRef(false);
  const { showNotification } = useNotification();
  const { addEntry } = useCPRLog();
  const { settings } = useCPRSettings();

  const resetTimers = useCallback(() => {
    if (settings.massagerAlertEnabled) {
      setMassagerTime(settings.massagerAlertSeconds);
    }
    if (settings.adrenalineAlertEnabled) {
      setAdrenalineTime(settings.adrenalineAlertSeconds);
    }
  }, [settings]);

  const showMassagerNotification = useCallback(() => {
    if (!massagerNotificationShownRef.current) {
      massagerNotificationShownRef.current = true;
      showNotification({
        icon: faRepeat,
        text: "החלף מעסים ובדוק דופק",
        buttons: [
          { 
            text: "בוצע", 
            onClick: () => {
              setMassagerTime(settings.massagerAlertSeconds);
              massagerNotificationShownRef.current = false;
            }
          }
        ],
      });
    }
  }, [showNotification, settings.massagerAlertSeconds]);

  const showAdrenalineNotification = useCallback(() => {
    if (!adrenalineNotificationShownRef.current) {
      adrenalineNotificationShownRef.current = true;
      showNotification({
        icon: faSyringe,
        text: "נא לשקול מתן אדרנלין",
        buttons: [
          {
            text: "ניתן",
            onClick: () => {
              setAdrenalineCount(prev => prev + 1);
              setAdrenalineTime(settings.adrenalineAlertSeconds);
              adrenalineNotificationShownRef.current = false;
              addEntry({
                timestamp: new Date().toISOString(),
                text: `ניתן אדרנלין מספר ${adrenalineCount + 1}`,
                type: 'medication',
                isImportant: true
              });
            }
          },
          {
            text: "אין צורך",
            onClick: () => {
              setAdrenalineTime(settings.adrenalineAlertSeconds);
              adrenalineNotificationShownRef.current = false;
            }
          }
        ],
      });
    }
  }, [showNotification, settings.adrenalineAlertSeconds, adrenalineCount, addEntry]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
        
        if (settings.massagerAlertEnabled) {
          setMassagerTime(prevTime => {
            if (prevTime > 0) {
              return prevTime - 1;
            } else {
              showMassagerNotification();
              return 0;
            }
          });
        }

        if (settings.adrenalineAlertEnabled) {
          setAdrenalineTime(prevTime => {
            if (prevTime > 0) {
              return prevTime - 1;
            } else {
              showAdrenalineNotification();
              return 0;
            }
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, settings, showMassagerNotification, showAdrenalineNotification]);

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
  };

  const getDisplayTimer = (): number => {
    if (settings.timerDisplay === 'massager' && settings.massagerAlertEnabled) {
      return massagerTime;
    } else if (settings.timerDisplay === 'adrenaline' && settings.adrenalineAlertEnabled) {
      return adrenalineTime;
    }
    return 0;
  };

  const handleAdrenaline = useCallback(() => {
    if (isRunning) {
      setAdrenalineCount(prev => prev + 1);
      addEntry({
        timestamp: new Date().toISOString(),
        text: `ניתן אדרנלין מספר ${adrenalineCount + 1}`,
        type: 'medication',
        isImportant: true
      });
    }
  }, [isRunning, adrenalineCount, addEntry]);

  const handleShock = useCallback(() => {
    if (isRunning) {
      setShockCount(prev => prev + 1);
      addEntry({
        timestamp: new Date().toISOString(),
        text: `ניתן שוק מספר ${shockCount + 1}`,
        type: 'action',
        isImportant: true
      });
    }
  }, [isRunning, shockCount, addEntry]);

  const startCpr = () => {
    setIsRunning(true);
    setAdrenalineCount(0);
    setShockCount(0);
    massagerNotificationShownRef.current = false;
    adrenalineNotificationShownRef.current = false;
    resetTimers();
    addEntry({
      timestamp: new Date().toISOString(),
      text: "החייאה התחילה",
      type: 'action',
      isImportant: true
    });
  };
  
  const endCpr = (reason: 'ROSC' | 'DEATH') => {
    setIsRunning(false);
    massagerNotificationShownRef.current = false;
    adrenalineNotificationShownRef.current = false;
    if (reason === 'ROSC') {
      addEntry({
        timestamp: new Date().toISOString(),
        text: "ההחיאה הסתיימה בהצלחה",
        type: 'action',
        isImportant: true
      });
    } else {
      addEntry({
        timestamp: new Date().toISOString(),
        text: "נקבע מות המטופל",
        type: 'action',
        isImportant: true
      });
    }
  };

  const handleDeathButtonClick = () => {
    const currentTime = new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setDeathTime(currentTime);
    setShowDeathModal(true);
  };

  const handleConfirmDeath = () => {
    setIsRunning(false);
    massagerNotificationShownRef.current = false;
    adrenalineNotificationShownRef.current = false;
    addEntry({
      timestamp: new Date().toISOString(),
      text: "נקבע מות המטופל",
      type: 'action',
      isImportant: true
    });
    showNotification({
      icon: faRepeat,
      text: `נקבע מות המטופל לשעה ${deathTime}. נא לא לשכוח ECG ו- POCUS`,
      buttons: [{ text: "הבנתי", onClick: () => {} }],
    });
    setShowDeathModal(false);
  };

  // Create context value
  const countersContextValue = {
    adrenalineCount,
    shockCount,
    isRunning,
    incrementAdrenaline: handleAdrenaline,
    incrementShock: handleShock,
  };

  return (
    <CPRCountersContext.Provider value={countersContextValue}>
      <div className="cpr-manager-container">
        {/* Right: Clocks, Timers, and Counters */}
        <div className="timer-section">
          <div className="elapsed-time">{formatTime(elapsedTime)}</div>
          {settings.timerDisplay !== 'none' && (
            <div className={`countdown-time ${getDisplayTimer() === 0 ? 'zero' : ''}`}>
              {formatTime(getDisplayTimer())}
            </div>
          )}
          
          {/* Counter Section */}
          <div className="counter-section">
            <div 
              className={`counter-item ${isRunning ? 'active' : ''}`}
              onClick={handleAdrenaline}
            >
              <FontAwesomeIcon icon={faSyringe} />
              <span>אדרנלין: {adrenalineCount}</span>
            </div>
            
            <div 
              className={`counter-item ${isRunning ? 'active' : ''}`}
              onClick={handleShock}
            >
              <FontAwesomeIcon icon={faBoltLightning} />
              <span>שוק: {shockCount}</span>
            </div>
          </div>
        </div>

        {/* Center: Actions */}
        <div className="actions-section">
          {!isRunning ? (
            <button className="start-button" onClick={startCpr}>
              התחל
            </button>
          ) : (
            <>
              <button className="rosc-button" onClick={() => endCpr('ROSC')}>
                ROSC
              </button>
              <button className="death-button" onClick={handleDeathButtonClick}>
                DEATH
              </button>
            </>
          )}
        </div>

        {/* Left: Settings */}
        <div className="settings-section">
          <div className="sound-toggle">
            <label className="switch">
              <input
                type="checkbox"
                checked={isSoundOn}
                onChange={() => setIsSoundOn(!isSoundOn)}
              />
              <span className="slider round"></span>
            </label>
            <FontAwesomeIcon icon={faVolumeLow} className="volume-icon" />
          </div>

          <button className="settings-button" onClick={() => setShowSettingsModal(true)}>
            <FontAwesomeIcon icon={faGear} />
            הגדרות
          </button>
        </div>

        {/* Metronome */}
        <Metronome isPlaying={isRunning && isSoundOn} bpm={100} />

        {/* Death Modal */}
        <Modal
          isOpen={showDeathModal}
          setIsOpen={setShowDeathModal}
          title="אישור קביעת מוות"
          secondaryButton={{
            text: "ביטול",
            onClick: () => setShowDeathModal(false),
          }}
          primaryButton={{
            text: "אישור",
            onClick: handleConfirmDeath,
          }}
          direction={ModalDirectionOptions.RTL}
        >
          <p>שעת המוות נקבעה ל {deathTime}</p>
        </Modal>

        {/* Settings Modal */}
        <SettingsModal 
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      </div>
    </CPRCountersContext.Provider>
  );
};

export default CprManager;