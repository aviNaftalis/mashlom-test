import React, { useState } from 'react';
import Modal, { ModalDirectionOptions } from '../../components/Modal';
import { useCPRSettings, CPRSettings } from './CPRSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useCPRSettings();
  const [localSettings, setLocalSettings] = useState<CPRSettings>(settings);

  const handleTimeChange = (field: 'massagerAlertTime' | 'adrenalineAlertTime', value: string) => {
    // Validate mm:ss format
    if (/^[0-5]?[0-9]:[0-5][0-9]$/.test(value)) {
      setLocalSettings(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={() => onClose()}
      title="הגדרות"
      primaryButton={{
        text: "שמור",
        onClick: handleSave,
      }}
      secondaryButton={{
        text: "ביטול",
        onClick: handleCancel,
      }}
      direction={ModalDirectionOptions.RTL}
    >
      <div style={{ 
        minHeight: '200px', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        direction: 'rtl' 
      }}>
        {/* Alert Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Massager Alert */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            opacity: localSettings.massagerAlertEnabled ? 1 : 0.5
          }}>
            <input
              type="checkbox"
              checked={localSettings.massagerAlertEnabled}
              onChange={() => setLocalSettings(prev => ({
                ...prev,
                massagerAlertEnabled: !prev.massagerAlertEnabled,
                timerDisplay: !prev.massagerAlertEnabled ? prev.timerDisplay : 
                  (prev.timerDisplay === 'massager' ? 'none' : prev.timerDisplay)
              }))}
              style={{ marginLeft: '10px' }}
            />
            <span>התראה להחלפת מעסים</span>
            <input
              type="text"
              value={localSettings.massagerAlertTime}
              onChange={(e) => handleTimeChange('massagerAlertTime', e.target.value)}
              placeholder="mm:ss"
              style={{
                width: '60px',
                textAlign: 'center',
                marginRight: '10px'
              }}
            />
          </div>

          {/* Adrenaline Alert */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            opacity: localSettings.adrenalineAlertEnabled ? 1 : 0.5
          }}>
            <input
              type="checkbox"
              checked={localSettings.adrenalineAlertEnabled}
              onChange={() => setLocalSettings(prev => ({
                ...prev,
                adrenalineAlertEnabled: !prev.adrenalineAlertEnabled,
                timerDisplay: !prev.adrenalineAlertEnabled ? prev.timerDisplay :
                  (prev.timerDisplay === 'adrenaline' ? 'none' : prev.timerDisplay)
              }))}
              style={{ marginLeft: '10px' }}
            />
            <span>התראה להזרקת אדרנלין</span>
            <input
              type="text"
              value={localSettings.adrenalineAlertTime}
              onChange={(e) => handleTimeChange('adrenalineAlertTime', e.target.value)}
              placeholder="mm:ss"
              style={{
                width: '60px',
                textAlign: 'center',
                marginRight: '10px'
              }}
            />
          </div>
        </div>

        {/* Timer Display Settings */}
        <div style={{ marginTop: '20px' }}>
          <div>טיימר:</div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px',
            marginTop: '10px',
            marginRight: '20px'
          }}>
            <label>
              <input
                type="radio"
                name="timerDisplay"
                value="none"
                checked={localSettings.timerDisplay === 'none'}
                onChange={() => setLocalSettings(prev => ({
                  ...prev,
                  timerDisplay: 'none'
                }))}
                style={{ marginLeft: '10px' }}
              />
              אל תציג
            </label>
            
            {localSettings.massagerAlertEnabled && (
              <label>
                <input
                  type="radio"
                  name="timerDisplay"
                  value="massager"
                  checked={localSettings.timerDisplay === 'massager'}
                  onChange={() => setLocalSettings(prev => ({
                    ...prev,
                    timerDisplay: 'massager'
                  }))}
                  style={{ marginLeft: '10px' }}
                />
                הצג זמן להחלפת מעסים
              </label>
            )}
            
            {localSettings.adrenalineAlertEnabled && (
              <label>
                <input
                  type="radio"
                  name="timerDisplay"
                  value="adrenaline"
                  checked={localSettings.timerDisplay === 'adrenaline'}
                  onChange={() => setLocalSettings(prev => ({
                    ...prev,
                    timerDisplay: 'adrenaline'
                  }))}
                  style={{ marginLeft: '10px' }}
                />
                הצג זמן להזרקת אדרנלין
              </label>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;