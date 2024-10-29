import React, { useState, useEffect, useRef, useCallback } from 'react';
import { faRepeat, faSyringe } from '@fortawesome/free-solid-svg-icons';
import { useNotification } from '../Notifications';
import { useCPRSettings } from '../CPRSettings';
import { useCPRCounters } from './CPRCountersContext';
import Metronome from '../Metronome';
import { CprManagerTimerSection } from './CprManagerTimerSection';
import { CprManagerActionSection } from './CprManagerActionSection';
import { CprManagerSettingSection } from './CprManagerSettingSection';
import './CprManager.css';

const CprManager: React.FC = () => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [massagerTime, setMassagerTime] = useState(0);
  const [adrenalineTime, setAdrenalineTime] = useState(0);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [showROSCModal, setShowROSCModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [deathTime, setDeathTime] = useState('');
  const [showDeathMessage, setShowDeathMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successTime, setSuccessTime] = useState('');
  const [shouldShowMassagerNotification, setShouldShowMassagerNotification] = useState(false);
  const [shouldShowAdrenalineNotification, setShouldShowAdrenalineNotification] = useState(false);

  const massagerNotificationShownRef = useRef(false);
  const adrenalineNotificationShownRef = useRef(false);
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

  const resetTimers = useCallback(() => {
    if (settings.massagerAlertEnabled) {
      setMassagerTime(settings.massagerAlertSeconds);
    }
    if (settings.adrenalineAlertEnabled) {
      setAdrenalineTime(settings.adrenalineAlertSeconds);
    }
  }, [settings]);

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
  }, [isRunning, settings]);

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

  const getDisplayTimer = (): number => {
    if (settings.timerDisplay === 'massager' && settings.massagerAlertEnabled) {
      return massagerTime;
    } else if (settings.timerDisplay === 'adrenaline' && settings.adrenalineAlertEnabled) {
      return adrenalineTime;
    }
    return 0;
  };

  const resetAll = () => {
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
    endCpr('DEATH');
    massagerNotificationShownRef.current = false;
    adrenalineNotificationShownRef.current = false;
    setShowDeathMessage(true);
    setShowDeathModal(false);
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
        onSoundToggle={setIsSoundOn}
        onSettingsClick={() => setShowSettingsModal(true)}
        onCloseSettings={() => setShowSettingsModal(false)}
      />

      <Metronome isPlaying={isRunning && isSoundOn} bpm={100} />
    </div>
  );
};

export default CprManager;