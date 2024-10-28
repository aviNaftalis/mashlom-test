import React, { useState } from 'react';
import Modal, { ModalDirectionOptions } from '../../components/Modal';
import { useCPRSettings, CPRSettings } from './CPRSettings';
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { heIL } from '@mui/material/locale';
import { DateTime } from 'luxon';
import { Popper } from '@mui/material';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Create RTL theme
const theme = createTheme(
  {
    direction: 'rtl',
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-input': {
              textAlign: 'center',
            },
          },
        },
      },
    },
  },
  heIL
);

const commonTimePickerProps = {
    views: ['minutes', 'seconds'] as const,
    format: "mm:ss",
    ampm: false,
    minutesStep: 1,  // This sets the step to 1 minute
    skipDisabled: false,  // Ensures we don't skip any values
    components: {
      Popper: (props: any) => (
        <Popper {...props} style={{ zIndex: 1500 }} placement="right" />
      )
    },
    slotProps: {
      textField: {
        size: "small" as const,
        style: { width: '130px' }
      },
      digitalClock: {
        minutesStep: 1,  // Also needed for the digital view
        sx: {
          '& .MuiMenuItem-root': {
            minHeight: '32px',
          }
        }
      },
      popper: {
        style: { zIndex: 1500 }
      }
    }
  };
  
const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useCPRSettings();
  const [localSettings, setLocalSettings] = useState<CPRSettings>(settings);

  const secondsToDateTime = (totalSeconds: number) => {
    const base = DateTime.local().startOf('day');
    return base.plus({ seconds: totalSeconds });
  };

  const dateTimeToSeconds = (dt: DateTime | null) => {
    if (!dt || !dt.isValid) return 0;
    return (dt.hour * 3600) + (dt.minute * 60) + dt.second;
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
    <ThemeProvider theme={theme}>
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
        <LocalizationProvider dateAdapter={AdapterLuxon}>
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
                <span style={{ minWidth: '150px' }}>התראה להחלפת מעסים</span>
                <DesktopTimePicker
                  {...commonTimePickerProps}
                  value={secondsToDateTime(localSettings.massagerAlertSeconds)}
                  onChange={(newValue) => {
                    if (newValue && newValue.isValid) {
                      setLocalSettings(prev => ({
                        ...prev,
                        massagerAlertSeconds: dateTimeToSeconds(newValue)
                      }));
                    }
                  }}
                  disabled={!localSettings.massagerAlertEnabled}
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
                <span style={{ minWidth: '150px' }}>התראה להזרקת אדרנלין</span>
                <DesktopTimePicker
                  {...commonTimePickerProps}
                  value={secondsToDateTime(localSettings.adrenalineAlertSeconds)}
                  onChange={(newValue) => {
                    if (newValue && newValue.isValid) {
                      setLocalSettings(prev => ({
                        ...prev,
                        adrenalineAlertSeconds: dateTimeToSeconds(newValue)
                      }));
                    }
                  }}
                  disabled={!localSettings.adrenalineAlertEnabled}
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
        </LocalizationProvider>
      </Modal>
    </ThemeProvider>
  );
};

export default SettingsModal;