import React, { useState, useEffect, useRef, useCallback } from 'react';
import { faRepeat, faSyringe } from '@fortawesome/free-solid-svg-icons';
import { useNotification } from '../Notifications';
import { useCPRSettings } from '../CPRSettings';
import { useCPRCounters } from './CPRCountersContext';
import { useCPRStateReporter } from '../CprState/useCPRStateReporter';
import { loadCurrentState, saveCurrentState, archiveCPRState, clearCurrentState } from '../CprState/storage';
import Metronome from '../Metronome';
import { CprManagerTimerSection } from './CprManagerTimerSection';
import { CprManagerActionSection } from './CprManagerActionSection';
import { CprManagerSettingSection } from './CprManagerSettingSection';
import './CprManager.css';

const CprManager: React.FC = () => {
  // State declarations
  const [elapsedTime, setElapsedTime] = useState(0);
  const [massagerTime, setMassagerTime] = useState(0);
  const [adrenalineTime, setAdrenalineTime] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(() => {
    const savedState = loadCurrentState();
    return savedState?.cprManagerSettings?.isSoundOn ?? true;
  });
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [showROSCModal, setShowROSCModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [deathTime, setDeathTime] = useState('');
  const [showDeathMessage, setShowDeathMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successTime, setSuccessTime] = useState('');
  const [shouldShowMassagerNotification, setShouldShowMassagerNotification] = useState(false);
  const [shouldShowAdrenalineNotification, setShouldShowAdrenalineNotification] = useState(false);
  const [isRestoringState, setIsRestoringState] = useState(true);

  // Refs
  const massagerNotificationShownRef = useRef(false);
  const adrenalineNotificationShownRef = useRef(false);

  // Hooks
  const { showNotification } = useNotification();
  const { settings } = useCPRSettings();
  const {
    adrenalineCount,
    shockCount,
    isRunning,
    incrementAdrenaline,
    incrementShock,
    startCpr,
    endCpr
  } = useCPRCounters();

  // Get CPR status for state reporter
  const getCPRStatus = () => {
    if (showDeathMessage) return 'DEATH';
    if (showSuccessMessage) return 'ROSC';
    if (isRunning) return 'ACTIVE';
    return null;
  };

  // Use CPR state reporter
  useCPRStateReporter(
    {
      isRunning,
      elapsedTime,
      massagerTime,
      adrenalineTime,
      adrenalineCount,
      shockCount,
      status: getCPRStatus(),
      endTime: showDeathMessage ? deathTime : showSuccessMessage ? successTime : null
    },
    {
      setElapsedTime,
      setMassagerTime,
      setAdrenalineTime,
      startCpr,
      setShowDeathMessage,
      setShowSuccessMessage,
      setDeathTime,
      setSuccessTime
    }
  );

  // Initialize state from localStorage on mount
  useEffect(() => {
    const savedState = loadCurrentState();
    if (savedState?.endState) {
      if (savedState.endState.status === 'DEATH') {
        setShowDeathMessage(true);
        setDeathTime(savedState.endState.endTime || '');
      } else if (savedState.endState.status === 'ROSC') {
        setShowSuccessMessage(true);
        setSuccessTime(savedState.endState.endTime || '');
      }
    }
    setIsRestoringState(false);
  }, []);

  // Sound toggle handler
  const handleSoundToggle = (value: boolean) => {
    setIsSoundOn(value);
    saveCurrentState({
      cprManagerSettings: {
        isSoundOn: value
      }
    }, 'cprManagerSettings');
  };

  // Timer reset handler
  const resetTimers = useCallback(() => {
    if (settings.massagerAlertEnabled) {
      setMassagerTime(settings.massagerAlertSeconds);
    }
    if (settings.adrenalineAlertEnabled) {
      setAdrenalineTime(settings.adrenalineAlertSeconds);
    }
  }, [settings]);

  // Notification handlers
  const handleMassagerNotificationResponse = useCallback(() => {
    setMassagerTime(settings.massagerAlertSeconds);
    massagerNotificationShownRef.current = false;
  }, [settings.massagerAlertSeconds]);

  const handleAdrenalineGiven = useCallback(() => {
    incrementAdrenaline();
    setAdrenalineTime(settings.adrenalineAlertSeconds);
    adrenalineNotificationShownRef.current = false;
  }, [incrementAdrenaline, settings.adrenalineAlertSeconds]);

  const handleAdrenalineSkipped = useCallback(() => {
    setAdrenalineTime(settings.adrenalineAlertSeconds);
    adrenalineNotificationShownRef.current = false;
  }, [settings.adrenalineAlertSeconds]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isRestoringState) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
        
        if (settings.massagerAlertEnabled) {
          setMassagerTime(prevTime => {
            if (prevTime > 0) {
              return prevTime - 1;
            } else {
              if (!massagerNotificationShownRef.current) {
                setShouldShowMassagerNotification(true);
              }
              return 0;
            }
          });
        }

        if (settings.adrenalineAlertEnabled) {
          setAdrenalineTime(prevTime => {
            if (prevTime > 0) {
              return prevTime - 1;
            } else {
              if (!adrenalineNotificationShownRef.current) {
                setShouldShowAdrenalineNotification(true);
              }
              return 0;
            }
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, settings, isRestoringState]);

  // Notification effects
  useEffect(() => {
    if (shouldShowMassagerNotification && !massagerNotificationShownRef.current) {
      massagerNotificationShownRef.current = true;
      showNotification({
        icon: faRepeat,
        text: "החלף מעסים ובדוק דופק",
        buttons: [
          { 
            text: "בוצע", 
            onClick: handleMassagerNotificationResponse
          }
        ],
      });
      setShouldShowMassagerNotification(false);
    }
  }, [shouldShowMassagerNotification, handleMassagerNotificationResponse, showNotification]);

  useEffect(() => {
    if (shouldShowAdrenalineNotification && !adrenalineNotificationShownRef.current) {
      adrenalineNotificationShownRef.current = true;
      showNotification({
        icon: faSyringe,
        text: "נא לשקול מתן אדרנלין",
        buttons: [
          {
            text: "ניתן",
            onClick: handleAdrenalineGiven
          },
          {
            text: "אין צורך",
            onClick: handleAdrenalineSkipped
          }
        ],
      });
      setShouldShowAdrenalineNotification(false);
    }
  }, [shouldShowAdrenalineNotification, handleAdrenalineGiven, handleAdrenalineSkipped, showNotification]);

  // Timer display helper
  const getDisplayTimer = (): number => {
    if (settings.timerDisplay === 'massager' && settings.massagerAlertEnabled) {
      return massagerTime;
    } else if (settings.timerDisplay === 'adrenaline' && settings.adrenalineAlertEnabled) {
      return adrenalineTime;
    }
    return 0;
  };

  // Reset handler
  const resetAll = () => {
    archiveCPRState();
    clearCurrentState();
    setElapsedTime(0);
    setMassagerTime(0);
    setAdrenalineTime(0);
    setShowDeathMessage(false);
    setShowSuccessMessage(false);
    setDeathTime('');
    setSuccessTime('');
    massagerNotificationShownRef.current = false;
    adrenalineNotificationShownRef.current = false;
  };

  // CPR action handlers
  const handleStartCpr = () => {
    startCpr();
    resetTimers();
    massagerNotificationShownRef.current = false;
    adrenalineNotificationShownRef.current = false;
  };

  const handleDeathButtonClick = () => {
    const currentTime = new Date().toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setDeathTime(currentTime);
    setShowDeathModal(true);
  };

  const handleConfirmDeath = () => {
    const currentTime = new Date().toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    endCpr('DEATH');
    massagerNotificationShownRef.current = false;
    adrenalineNotificationShownRef.current = false;
    setShowDeathMessage(true);
    setShowDeathModal(false);
    setDeathTime(currentTime);
    
    // Save the end state
    saveCurrentState({
      endState: {
        status: 'DEATH',
        endTime: currentTime
      }
    }, 'endState');
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
    setSuccessTime(currentTime);
    endCpr('ROSC');
    massagerNotificationShownRef.current = false;
    adrenalineNotificationShownRef.current = false;
    setShowSuccessMessage(true);
    setShowROSCModal(false);
    
    // Save the end state
    saveCurrentState({
      endState: {
        status: 'ROSC',
        endTime: currentTime
      }
    }, 'endState');
  };

  return (
    <div className="cpr-manager-container">
      <CprManagerTimerSection
        elapsedTime={elapsedTime}
        displayTimer={getDisplayTimer()}
        isRunning={isRunning}
        adrenalineCount={adrenalineCount}
        shockCount={shockCount}
        timerDisplay={settings.timerDisplay}
        onIncrementAdrenaline={incrementAdrenaline}
        onIncrementShock={incrementShock}
      />

      <CprManagerActionSection
        isRunning={isRunning}
        showDeathMessage={showDeathMessage}
        showSuccessMessage={showSuccessMessage}
        deathTime={deathTime}
        successTime={successTime}
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

      <Metronome isPlaying={isRunning && isSoundOn} bpm={100} />
    </div>
  );
};

export default CprManager;