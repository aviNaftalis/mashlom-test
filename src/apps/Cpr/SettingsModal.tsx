import React, { useState, useRef } from 'react';
import Modal, { ModalDirectionOptions } from '../../components/Modal';
import { useCPRSettings, CPRSettings } from './CPRSettings';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { heIL } from '@mui/material/locale';
import { TextField, Popover} from '@mui/material';
import { styled } from '@mui/material/styles';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SecondsPickerProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  maxSeconds?: number;
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

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

  const ListItem = styled('li')({
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '8px 16px',
    listStyle: 'none',
    textAlign: 'center',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
    '&.selected': {
      backgroundColor: '#e3f2fd',
      fontWeight: 'bold',
      '&:hover': {
        backgroundColor: '#e3f2fd',
      },
    }
  });
  
  const SecondsPickerComponent: React.FC<SecondsPickerProps> = ({
    value,
    onChange,
    disabled = false,
    maxSeconds = 300
  }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const selectedRef = useRef<HTMLLIElement>(null);
  
    // Generate time options in 5-second intervals
    const timeOptions = Array.from(
      { length: Math.floor(maxSeconds / 5) + 1 }, 
      (_, index) => index * 5
    );
  
    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
      if (!disabled) {
        setAnchorEl(event.currentTarget);
        // Use setTimeout to ensure the DOM is ready
        setTimeout(() => {
          selectedRef.current?.scrollIntoView({ block: 'center' });
        }, 0);
      }
    };
  
    return (
      <div style={{ display: 'inline-block' }}>
        <TextField
          size="small"
          value={formatTime(value)}
          onClick={handleOpen}
          disabled={disabled}
          InputProps={{
            readOnly: true,
            style: { width: '130px', cursor: disabled ? 'default' : 'pointer' }
          }}
        />
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          style={{ zIndex: 1500 }}
        >
          <ul style={{ 
            maxHeight: '300px', 
            overflow: 'auto',
            width: '100px',
            margin: 0,
            padding: 0
          }}>
            {timeOptions.map((seconds) => (
              <ListItem
                key={seconds}
                ref={seconds === value ? selectedRef : null}
                className={seconds === value ? 'selected' : ''}
                onClick={() => {
                  onChange(seconds);
                  setAnchorEl(null);
                }}
              >
                {formatTime(seconds)}
              </ListItem>
            ))}
          </ul>
        </Popover>
      </div>
    );
  };

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useCPRSettings();
  const [localSettings, setLocalSettings] = useState<CPRSettings>(settings);

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
              <SecondsPickerComponent
                value={localSettings.massagerAlertSeconds}
                onChange={(newValue) => {
                  setLocalSettings(prev => ({
                    ...prev,
                    massagerAlertSeconds: newValue
                  }));
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
              <SecondsPickerComponent
                value={localSettings.adrenalineAlertSeconds}
                onChange={(newValue) => {
                  setLocalSettings(prev => ({
                    ...prev,
                    adrenalineAlertSeconds: newValue
                  }));
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
      </Modal>
    </ThemeProvider>
  );
};

export default SettingsModal;