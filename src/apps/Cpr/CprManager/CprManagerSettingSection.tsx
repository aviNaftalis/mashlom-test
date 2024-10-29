import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeLow, faGear } from '@fortawesome/free-solid-svg-icons';
import SettingsModal from '../SettingsModal';

interface CprManagerSettingSectionProps {
  isSoundOn: boolean;
  showSettingsModal: boolean;
  onSoundToggle: (value: boolean) => void;
  onSettingsClick: () => void;
  onCloseSettings: () => void;
}

export const CprManagerSettingSection: React.FC<CprManagerSettingSectionProps> = ({
  isSoundOn,
  showSettingsModal,
  onSoundToggle,
  onSettingsClick,
  onCloseSettings,
}) => {
  return (
    <div className="settings-section">
      <div className="sound-toggle">
        <label className="switch">
          <input
            type="checkbox"
            checked={isSoundOn}
            onChange={(e) => onSoundToggle(e.target.checked)}
          />
          <span className="slider round"></span>
        </label>
        <FontAwesomeIcon icon={faVolumeLow} className="volume-icon" />
      </div>

      <button className="settings-button" onClick={onSettingsClick}>
        <FontAwesomeIcon icon={faGear} />
        הגדרות
      </button>

      <SettingsModal 
        isOpen={showSettingsModal}
        onClose={onCloseSettings}
      />
    </div>
  );
};
