import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import Modal from '../../../components/Modal';
import { ModalDirectionOptions } from '../../../components/Modal';

interface CprManagerActionSectionProps {
  isRunning: boolean;
  showDeathMessage: boolean;
  showSuccessMessage: boolean;
  deathTime: string;
  successTime: string;
  showDeathModal: boolean;
  showROSCModal: boolean;
  onStartCpr: () => void;
  onROSCClick: () => void;
  onDeathClick: () => void;
  onConfirmROSC: () => void;
  onConfirmDeath: () => void;
  onResetAll: () => void;
  onCloseDeathModal: () => void;
  onCloseROSCModal: () => void;
}

export const CprManagerActionSection: React.FC<CprManagerActionSectionProps> = ({
  isRunning,
  showDeathMessage,
  showSuccessMessage,
  deathTime,
  successTime,
  showDeathModal,
  showROSCModal,
  onStartCpr,
  onROSCClick,
  onDeathClick,
  onConfirmROSC,
  onConfirmDeath,
  onResetAll,
  onCloseDeathModal,
  onCloseROSCModal,
}) => {
  return (
    <div className="actions-section">
      {!isRunning && !showDeathMessage && !showSuccessMessage ? (
        <button className="start-button" onClick={onStartCpr}>
          התחל
        </button>
      ) : showDeathMessage ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            marginBottom: '15px', 
            color: '#666',
            fontSize: '1.1em' 
          }}>
            נקבע מות המטופל לשעה {deathTime}
            <br />
            נא לא לשכוח ECG ו- POCUS
          </div>
          <button 
            className="restart-button" 
            onClick={onResetAll}
          >
            <FontAwesomeIcon icon={faRotateRight} />
            התחל מחדש
          </button>
        </div>
      ) : showSuccessMessage ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            marginBottom: '15px', 
            color: '#666',
            fontSize: '1.1em' 
          }}>
            ההחייאה הסתיימה ב {successTime}
          </div>
          <button 
            className="restart-button" 
            onClick={onResetAll}
          >
            <FontAwesomeIcon icon={faRotateRight} />
            התחל מחדש
          </button>
        </div>
      ) : (
        <>
          <button className="rosc-button" onClick={onROSCClick}>
            ROSC
          </button>
          <button className="death-button" onClick={onDeathClick}>
            DEATH
          </button>
        </>
      )}

      {/* Modals */}
      <Modal
        isOpen={showDeathModal}
        setIsOpen={onCloseDeathModal}
        title="אישור קביעת מוות"
        secondaryButton={{
          text: "ביטול",
          onClick: onCloseDeathModal,
        }}
        primaryButton={{
          text: "אישור",
          onClick: onConfirmDeath,
        }}
        direction={ModalDirectionOptions.RTL}
      >
        <p>שעת המוות נקבעה ל {deathTime}</p>
      </Modal>

      <Modal
        isOpen={showROSCModal}
        setIsOpen={onCloseROSCModal}
        title="סיום ההחייאה"
        secondaryButton={{
          text: "ביטול",
          onClick: onCloseROSCModal,
        }}
        primaryButton={{
          text: "אישור",
          onClick: onConfirmROSC,
        }}
        direction={ModalDirectionOptions.RTL}
      >
        <p>האם אתה בטוח שברצונך לסיים את ההחייאה?</p>
      </Modal>
    </div>
  );
};