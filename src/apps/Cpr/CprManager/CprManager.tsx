import React, { useCallback, useRef, useState, useEffect } from 'react';
import { faRepeat, faSyringe } from '@fortawesome/free-solid-svg-icons';
import { useNotification } from '../Notifications';
import { useCPRSettings } from '../CPRSettings';
import { useCPRState } from '../CprState/CPRStateContext';
import { clearCurrentState, archiveCPRState } from '../CprState/storage';
import { useCPRLog } from '../CPRLog';
import Metronome from '../Metronome';
import { CprManagerTimerSection } from './CprManagerTimerSection';
import { CprManagerActionSection } from './CprManagerActionSection';
import { CprManagerSettingSection } from './CprManagerSettingSection';
import { cprEventEmitter, EVENTS } from '../cprEvents';
import './CprManager.css';

const CprManager: React.FC = () => {
  const { state, dispatch } = useCPRState();
  const { showNotification } = useNotification();
  const { settings } = useCPRSettings();
  const { addEntry } = useCPRLog();
  
  const [isSoundOn, setIsSoundOn] = useState(() => {
    const savedState = localStorage.getItem('cprManagerSettings');
    return savedState ? JSON.parse(savedState).isSoundOn : true;
  });
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [showROSCModal, setShowROSCModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const massagerNotificationShownRef = useRef(false);
  const adrenalineNotificationShownRef = useRef(false);
  const lastTickTimeRef = useRef<number>(Date.now());

  const handleSoundToggle = (value: boolean) => {
    setIsSoundOn(value);
    localStorage.setItem('cprManagerSettings', JSON.stringify({ isSoundOn: value }));
  };

  // Timer effect with fixed timing
  useEffect(() => {
    let requestId: number;
    
    const tick = () => {
      const now = Date.now();
      const elapsed = now - lastTickTimeRef.current;
      
      if (elapsed >= 1000) {
        dispatch({ type: 'TICK' });
        lastTickTimeRef.current = now - (elapsed % 1000);

        if (settings.massagerAlertEnabled && state.massagerTime === 0 && !massagerNotificationShownRef.current) {
          massagerNotificationShownRef.current = true;
          showNotification({
            icon: faRepeat,
            text: "החלף מעסים ובדוק דופק",
            buttons: [{ 
              text: "בוצע", 
              onClick: () => {
                dispatch({ type: 'SET_MASSAGER_TIME', time: settings.massagerAlertSeconds });
                massagerNotificationShownRef.current = false;
              }
            }],
          });
        }

        if (settings.adrenalineAlertEnabled && state.adrenalineTime === 0 && !adrenalineNotificationShownRef.current) {
          adrenalineNotificationShownRef.current = true;
          showNotification({
            icon: faSyringe,
            text: "נא לשקול מתן אדרנלין",
            buttons: [
              {
                text: "ניתן",
                onClick: () => {
                  dispatch({ type: 'INCREMENT_ADRENALINE' });
                  dispatch({ type: 'SET_ADRENALINE_TIME', time: settings.adrenalineAlertSeconds });
                  adrenalineNotificationShownRef.current = false;
                }
              },
              {
                text: "אין צורך",
                onClick: () => {
                  dispatch({ type: 'SET_ADRENALINE_TIME', time: settings.adrenalineAlertSeconds });
                  adrenalineNotificationShownRef.current = false;
                }
              }
            ],
          });
        }
      }
      
      if (state.isRunning) {
        requestId = requestAnimationFrame(tick);
      }
    };

    if (state.isRunning) {
      lastTickTimeRef.current = Date.now();
      requestId = requestAnimationFrame(tick);
    }

    return () => {
      if (requestId) {
        cancelAnimationFrame(requestId);
      }
    };
  }, [state.isRunning, state.massagerTime, state.adrenalineTime, settings, dispatch, showNotification]);

  const resetTimers = useCallback(() => {
    if (settings.massagerAlertEnabled) {
      dispatch({ type: 'SET_MASSAGER_TIME', time: settings.massagerAlertSeconds });
    }
    if (settings.adrenalineAlertEnabled) {
      dispatch({ type: 'SET_ADRENALINE_TIME', time: settings.adrenalineAlertSeconds });
    }
  }, [settings, dispatch]);

  const getDisplayTimer = (): number => {
    if (settings.timerDisplay === 'massager' && settings.massagerAlertEnabled) {
      return state.massagerTime;
    } else if (settings.timerDisplay === 'adrenaline' && settings.adrenalineAlertEnabled) {
      return state.adrenalineTime;
    }
    return 0;
  };

  const resetAll = () => {
    clearCurrentState();
    archiveCPRState();
    dispatch({ type: 'LOAD_STATE', state: {
      isRunning: false,
      elapsedTime: 0,
      massagerTime: 0,
      adrenalineTime: 0,
      adrenalineCount: 0,
      shockCount: 0,
      status: null,
      endTime: null
    }});
    massagerNotificationShownRef.current = false;
    adrenalineNotificationShownRef.current = false;
    cprEventEmitter.emit(EVENTS.RESET_CPR);
  };

  const handleStartCpr = () => {
    dispatch({ type: 'START_CPR' });
    resetTimers();
    massagerNotificationShownRef.current = false;
    adrenalineNotificationShownRef.current = false;
    addEntry({
      timestamp: new Date().toISOString(),
      text: "החייאה התחילה",
      type: 'action',
      isImportant: true
    });
  };

  const handleDeathButtonClick = () => {
    setShowDeathModal(true);
  };

  const handleConfirmDeath = () => {
    const currentTime = new Date().toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    dispatch({ type: 'END_CPR', status: 'DEATH', time: currentTime });
    massagerNotificationShownRef.current = false;
    adrenalineNotificationShownRef.current = false;
    setShowDeathModal(false);
    addEntry({
      timestamp: new Date().toISOString(),
      text: "נקבע מות המטופל",
      type: 'action',
      isImportant: true
    });
  };

  const handleROSCButtonClick = () => {
    setShowROSCModal(true);
  };

  const handleConfirmROSC = () => {
    const currentTime = new Date().toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    dispatch({ type: 'END_CPR', status: 'ROSC', time: currentTime });
    massagerNotificationShownRef.current = false;
    adrenalineNotificationShownRef.current = false;
    setShowROSCModal(false);
    addEntry({
      timestamp: new Date().toISOString(),
      text: "ההחיאה הסתיימה בהצלחה",
      type: 'action',
      isImportant: true
    });
  };

  return (
    <div className="cpr-manager-container">
      <CprManagerTimerSection
        elapsedTime={state.elapsedTime}
        displayTimer={getDisplayTimer()}
        isRunning={state.isRunning}
        adrenalineCount={state.adrenalineCount}
        shockCount={state.shockCount}
        timerDisplay={settings.timerDisplay}
        onIncrementAdrenaline={() => dispatch({ type: 'INCREMENT_ADRENALINE' })}
        onIncrementShock={() => dispatch({ type: 'INCREMENT_SHOCK' })}
      />

      <CprManagerActionSection
        isRunning={state.isRunning}
        showDeathMessage={state.status === 'DEATH'}
        showSuccessMessage={state.status === 'ROSC'}
        deathTime={state.status === 'DEATH' ? state.endTime || '' : ''}
        successTime={state.status === 'ROSC' ? state.endTime || '' : ''}
        showDeathModal={showDeathModal}
        showROSCModal={showROSCModal}
        onStartCpr={handleStartCpr}
        onROSCClick={handleROSCButtonClick}
        onDeathClick={handleDeathButtonClick}
        onConfirmROSC={handleConfirmROSC}
        onConfirmDeath={handleConfirmDeath}
        onResetAll={resetAll}
        onCloseDeathModal={() => setShowDeathModal(false)}
        onCloseROSCModal={() => setShowROSCModal(false)}
      />

      <CprManagerSettingSection
        isSoundOn={isSoundOn}
        showSettingsModal={showSettingsModal}
        onSoundToggle={handleSoundToggle}
        onSettingsClick={() => setShowSettingsModal(true)}
        onCloseSettings={() => setShowSettingsModal(false)}
      />

      <Metronome isPlaying={state.isRunning && isSoundOn} bpm={100} />
    </div>
  );
};

export default CprManager;