import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationProvider } from './Notifications';
import { CPRLogProvider, useCPRLog } from './CPRLog';
import CprManager from './CprManager/CprManager';
import { CPRStateProvider } from './CprState/CPRStateContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CPRSettingsProvider from './CPRSettings';
import { 
  faFileLines, 
  faHeartPulse, 
  faSection, 
  faPills, 
  faListCheck, 
  faLungs, 
  faBoltLightning,
  faClockRotateLeft
} from '@fortawesome/free-solid-svg-icons';
import CPRLogComponent from './CPRLog';
import VitalSigns from './VitalSigns';
import MedicalProcedures from './MedicalProcedures';
import ABCDEFProcedures from './ABCDEFProcedures';
import Airways from './Airways';
import Medications from './Medications';
import Defibrillator from './Defibrillator';
import ReminderBox from './ReminderBox';
import ResusInputs from '../Resus/ResusInputs';
import { useResusContext } from '../Resus/ResusContext';
import { loadCurrentState, saveCurrentState, restoreArchivedCPR } from './CprState/storage';
import ArchivesList, { getFormattedAge, getProtocolName } from './ArchivesList';
import './Cpr.css';

const CprContent: React.FC = () => {
  const { addEntry } = useCPRLog();
  const { updateContext, protocol } = useResusContext();
  const [logExpanded, setLogExpanded] = useState(false);
  const [vitalSignsExpanded, setVitalSignsExpanded] = useState(false);
  const [medsExpanded, setMedsExpanded] = useState(false);
  const [proceduresExpanded, setProceduresExpanded] = useState(false);
  const [abcdefExpanded, setABCDEFExpanded] = useState(false);
  const [airwaysExpanded, setAirwaysExpanded] = useState(false);
  const [defibrillatorExpanded, setDefibrillatorExpanded] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderShown, setReminderShown] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const hasRestoredState = useRef(false);

  useEffect(() => {
    if (!hasRestoredState.current) {
      // Parse archive ID from hash params
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
      const archiveId = params.get('archive');
      
      if (archiveId) {
        const restored = restoreArchivedCPR(archiveId);
        if (!restored) {
          console.error('Failed to restore archived CPR');
        }
      }

      const savedState = loadCurrentState();
      if (savedState?.resusContext) {
        const { age, weight, protocol } = savedState.resusContext;
        if (age || weight || protocol) {
          updateContext(age || '', weight || null, protocol || null);
        }
      }
      hasRestoredState.current = true;
    }
  }, [updateContext]);

  const toggleLog = () => setLogExpanded(!logExpanded);
  const toggleVitalSigns = () => setVitalSignsExpanded(!vitalSignsExpanded);
  const toggleMeds = () => setMedsExpanded(!medsExpanded);
  const toggleProcedures = () => setProceduresExpanded(!proceduresExpanded);
  const toggleAirways = () => setAirwaysExpanded(!airwaysExpanded);
  const toggleDefibrillator = () => setDefibrillatorExpanded(!defibrillatorExpanded);
  const toggleABCDEF = () => {
    setABCDEFExpanded(!abcdefExpanded);
    if (!abcdefExpanded) {
      setReminderShown(false);
    }
  };

  const handleCloseReminder = useCallback(() => {
    setShowReminder(false);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (abcdefExpanded && !reminderShown) {
      timer = setTimeout(() => {
        setShowReminder(true);
        setReminderShown(true);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [abcdefExpanded, reminderShown]);

  const handleResusInputsSubmit = (age: string, weight: number | null, protocol: string) => {
    saveCurrentState({
      resusContext: {
        age,
        weight,
        protocol
      }
    }, 'resusContext');

    if (age && weight) {
      addEntry({
        timestamp: new Date().toISOString(),
        text: `מטופל בגיל ${getFormattedAge(age)}, במשקל ${weight} ק"ג`,
        type: 'patientDetails',
        isImportant: true
      });
    }

    if (protocol) {
      const protocolName = getProtocolName(protocol);
      if (protocolName) {
        addEntry({
          timestamp: new Date().toISOString(),
          text: `הגיע בעקבות ${protocolName}`,
          type: 'patientDetails',
          isImportant: false
        });
      }
    }

    setAirwaysExpanded(true);
  };

  return (
    <>
      <div className="header-container">
        <div className="header-title">
          <h1>החייאה</h1>
          {protocol && <h5>({getProtocolName(protocol)})</h5>}
        </div>
        <button 
          onClick={() => setShowArchives(true)}
          className="archive-button"
          title="החייאות קודמות"
        >
          <FontAwesomeIcon icon={faClockRotateLeft} />
        </button>
      </div>
      {showArchives && <ArchivesList onClose={() => setShowArchives(false)} />}
      <CprManager />
      <ResusInputs onSubmit={handleResusInputsSubmit} />
      <div style={{ direction: 'rtl'}}>
        <h4 className="section-header" onClick={toggleAirways}>
          <span className="toggle-icon">{airwaysExpanded ? '-' : '+'}</span>
          <span className="section-name"><FontAwesomeIcon icon={faLungs} /> נתיב אוויר</span>
        </h4>
        {airwaysExpanded && (
          <div id="collapseable-area-airways" className={`collapseable ${airwaysExpanded ? 'expanded' : ''}`}>
            <Airways />
          </div>
        )}

        <h4 className="section-header" onClick={toggleDefibrillator}>
          <span className="toggle-icon">{defibrillatorExpanded ? '-' : '+'}</span>
          <span className="section-name">
            <FontAwesomeIcon icon={faBoltLightning} /> Defibrillator (מַפְעֵם)
          </span>
        </h4>
        {defibrillatorExpanded && (
          <div id="collapseable-area-defibrillator" className={`collapseable ${defibrillatorExpanded ? 'expanded' : ''}`}>
            <Defibrillator />
          </div>
        )}

        <h4 className="section-header" onClick={toggleVitalSigns}>
          <span className="toggle-icon">{vitalSignsExpanded ? '-' : '+'}</span>
          <span className="section-name"><FontAwesomeIcon icon={faHeartPulse} /> מדדים</span>
        </h4>
        {vitalSignsExpanded && (
          <div id="collapseable-area-vital-signs" className={`collapseable ${vitalSignsExpanded ? 'expanded' : ''}`}>
            <VitalSigns />
          </div>
        )}
        
        <h4 className="section-header" onClick={toggleProcedures}>
          <span className="toggle-icon">{proceduresExpanded ? '-' : '+'}</span>
          <span className="section-name"><FontAwesomeIcon icon={faSection} /> LINE / זונדה / קטטר</span>
        </h4>
        {proceduresExpanded && (
          <div id="collapseable-area-procedures" className={`collapseable ${proceduresExpanded ? 'expanded' : ''}`}>
            <MedicalProcedures />
          </div>
        )}

        <h4 className="section-header" onClick={toggleMeds}>
          <span className="toggle-icon">{medsExpanded ? '-' : '+'}</span>
          <span className="section-name"><FontAwesomeIcon icon={faPills} /> תרופות </span>
        </h4>
        {medsExpanded && (
          <div id="collapseable-area-meds" className={`collapseable ${medsExpanded ? 'expanded' : ''}`}>
            <Medications />
          </div>
        )}

        <h4 className="section-header" onClick={toggleABCDEF}>
          <span className="toggle-icon">{abcdefExpanded ? '-' : '+'}</span>
          <span className="section-name"><FontAwesomeIcon icon={faListCheck} /> ABCDEF </span>
        </h4>
        {abcdefExpanded && (
          <div id="collapseable-area-abcdef" className={`collapseable ${abcdefExpanded ? 'expanded' : ''}`}>
            <ABCDEFProcedures />
          </div>
        )}

        <h4 className="section-header" onClick={toggleLog}>
          <span className="toggle-icon">{logExpanded ? '-' : '+'}</span>
          <span className="section-name"><FontAwesomeIcon icon={faFileLines} /> יומן</span>
        </h4>      
        {logExpanded && (
          <div id="collapseable-area-log" className={`collapseable ${logExpanded ? 'expanded' : ''}`}>
            <CPRLogComponent />
          </div>
        )}
      </div>
      {showReminder && <ReminderBox onClose={handleCloseReminder} />}
    </>
  );
};

const Cpr: React.FC = () => {
  return (
    <CPRSettingsProvider>
      <NotificationProvider>
        <CPRLogProvider>
          <CPRStateProvider>
            <div>
              <div className="container main-content">
                <div className="group-container">
                  <CprContent />
                </div>
              </div>
            </div>
          </CPRStateProvider>
        </CPRLogProvider>
      </NotificationProvider>
    </CPRSettingsProvider>
  );
};

export default Cpr;