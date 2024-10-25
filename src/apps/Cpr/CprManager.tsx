import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeLow, faRepeat, faSyringe, faBoltLightning, faGear } from '@fortawesome/free-solid-svg-icons';
import Metronome from './Metronome';
import { useNotification } from './Notifications';
import { useCPRLog } from './CPRLog';
import Modal, { ModalDirectionOptions } from '../../components/Modal';
import SettingsModal from './SettingsModal';

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
  const [countdownTime, setCountdownTime] = useState(20);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [deathTime, setDeathTime] = useState('');
  const [adrenalineCount, setAdrenalineCount] = useState(0);
  const [shockCount, setShockCount] = useState(0);
  const notificationShownRef = useRef(false);
  const { showNotification } = useNotification();
  const { addEntry } = useCPRLog();

  const showTimerNotification = useCallback(() => {
    if (!notificationShownRef.current) {
      notificationShownRef.current = true;
      showNotification({
        icon: faRepeat,
        text: "החלף מעסים ובדוק דופק",
        buttons: [
          { 
            text: "בוצע", 
            onClick: () => {
              setCountdownTime(20);
              notificationShownRef.current = false;
              addEntry({
                timestamp: new Date().toISOString(),
                text: "הוחלפו המעסים",
                type: 'action',
                isImportant: false
              });
            }
          }
        ],
      });
    }
  }, [showNotification, addEntry]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
        setCountdownTime((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            showTimerNotification();
            return 0;
          }
        });
      }, 1000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isRunning, showTimerNotification]);

  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
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
    notificationShownRef.current = false;
    addEntry({
      timestamp: new Date().toISOString(),
      text: "החייאה התחילה",
      type: 'action',
      isImportant: true
    });
  };
  
  const endCpr = (reason: 'ROSC' | 'DEATH') => {
    setIsRunning(false);
    notificationShownRef.current = false;
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
    console.log(`CPR ended: ${reason}`);
  };

  const handleDeathButtonClick = () => {
    const currentTime = new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setDeathTime(currentTime);
    setShowDeathModal(true);
  };

  const handleConfirmDeath = () => {
    setIsRunning(false);
    notificationShownRef.current = false;
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        direction: 'rtl',
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Right: Clocks, Timers, and Counters */}
        <div style={{ padding: 'auto' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>
            {formatTime(elapsedTime)}
          </div>
          <div style={{ fontSize: '20px', color: countdownTime === 0 ? 'red' : 'inherit', marginBottom: '15px' }}>
            {formatTime(countdownTime)}
          </div>
          
          {/* Counter Section */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px',
            borderTop: '1px solid #ccc',
            paddingTop: '10px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: isRunning ? 'pointer' : 'default',
              opacity: isRunning ? 1 : 0.5 
            }} 
              onClick={handleAdrenaline}
            >
              <FontAwesomeIcon icon={faSyringe} />
              <span>אדרנלין: {adrenalineCount}</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              cursor: isRunning ? 'pointer' : 'default',
              opacity: isRunning ? 1 : 0.5 
            }} 
              onClick={handleShock}
            >
              <FontAwesomeIcon icon={faBoltLightning} />
              <span>שוק: {shockCount}</span>
            </div>
          </div>
        </div>

        {/* Center: Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {!isRunning ? (
            <button
              onClick={startCpr}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: '#1FB5A3',
                color: 'white',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              התחל
            </button>
          ) : (
            <>
              <button
                onClick={() => endCpr('ROSC')}
                style={{
                  width: '120px',
                  height: '60px',
                  backgroundColor: '#1FB5A3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  marginBottom: '10px',
                  cursor: 'pointer',
                }}
              >
                ROSC
              </button>
              <button
                onClick={handleDeathButtonClick}
                style={{
                  width: '120px',
                  height: '60px',
                  backgroundColor: '#1FB5A3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                DEATH
              </button>
            </>
          )}
        </div>

        {/* Left: Settings */}
        <div style={{ 
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'flex-start',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label className="switch">
              <input
                type="checkbox"
                checked={isSoundOn}
                onChange={() => setIsSoundOn(!isSoundOn)}
              />
              <span className="slider round"></span>
            </label>
            <FontAwesomeIcon icon={faVolumeLow} style={{ marginRight: '10px' }} />
          </div>

          {/* Settings button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#1FB5A3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
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

        <style>{`
          .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;
          }

          .switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }

          .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #B9EDE7;
            transition: .4s;
          }

          .slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
          }

          input:checked + .slider {
            background-color: #1FB5A3;
          }

          input:checked + .slider:before {
            transform: translateX(26px);
          }

          .slider.round {
            border-radius: 34px;
          }

          .slider.round:before {
            border-radius: 50%;
          }
        `}</style>
      </div>
    </CPRCountersContext.Provider>
  );
};

export default CprManager;