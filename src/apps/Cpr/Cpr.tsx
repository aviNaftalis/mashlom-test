import React, { useState, useEffect, useCallback } from 'react';
import { NotificationProvider } from './Notifications';
import { CPRLogProvider, useCPRLog } from './CPRLog';
import CprManager from './CprManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CPRSettingsProvider from './CPRSettings';
import { faFileLines, faHeartPulse, faSection, faPills, faListCheck, faLungs } from '@fortawesome/free-solid-svg-icons';
import CPRLogComponent from './CPRLog';
import VitalSigns from './VitalSigns';
import MedicalProcedures from './MedicalProcedures';
import ABCDEFProcedures from './ABCDEFProcedures';
import Airways from './Airways';
import Medications from './Medications';
import ReminderBox from './ReminderBox';
import ResusInputs from '../Resus/ResusInputs';
import emergencyProtocols from '../Resus/data/emergency-protocols.json';
import './Cpr.css';

interface Protocol {
  name: string;
  id: string;
  algorithmFile?: string;
  protocolFile?: string;
}

interface ProtocolSection {
  section: string;
  protocols: Protocol[];
}

interface EmergencyProtocols {
  emergencyProtocols: ProtocolSection[];
}

const CprContent: React.FC = () => {
  const [logExpanded, setLogExpanded] = useState(false);
  const [vitalSignsExpanded, setVitalSignsExpanded] = useState(false);
  const [medsExpanded, setMedsExpanded] = useState(false);
  const [proceduresExpanded, setProceduresExpanded] = useState(false);
  const [abcdefExpanded, setABCDEFExpanded] = useState(false);
  const [airwaysExpanded, setAirwaysExpanded] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderShown, setReminderShown] = useState(false);

  const toggleLog = () => setLogExpanded(!logExpanded);
  const toggleVitalSigns = () => setVitalSignsExpanded(!vitalSignsExpanded);
  const toggleMeds = () => setMedsExpanded(!medsExpanded);
  const toggleProcedures = () => setProceduresExpanded(!proceduresExpanded);
  const toggleAirways = () => setAirwaysExpanded(!airwaysExpanded);
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

  const { addEntry } = useCPRLog();

  const handleResusInputsSubmit = (age: string, weight: number | null, protocol: string) => {
    // Add the age and weight entry
    if (age && weight !== null) {
      addEntry({
        timestamp: new Date().toISOString(),
        text: `מטופל בגיל ${getFormattedAge(age)}, במשקל ${weight} ק"ג`,
        type: 'patientDetails',
        isImportant: true
      });
    }

    // If protocol is provided, add a separate entry for it
    if (protocol) {
      const protocolName = getProtocolName(protocol);
      addEntry({
        timestamp: new Date().toISOString(),
        text: `הגיע בעקבות ${protocolName}`,
        type: 'patientDetails',
        isImportant: false
      });
    }

    // Automatically expand the airways section
    setAirwaysExpanded(true);
  };

  const getFormattedAge = (age: string): string => {
    if (age === "0 month") return "בן יומו";
    if (age === "1 month") return "חודש";
    if (age === "2 month") return "חודשיים";
    if (age === "1 year") return "שנה";
    if (age === "2 year") return "שנתיים";
    return age.replace("month", "חודשים").replace("year", "שנים");
  };

  const getProtocolName = (protocolId: string): string => {
    const protocol = (emergencyProtocols as EmergencyProtocols).emergencyProtocols
      .flatMap((section): Protocol[] => section.protocols)
      .find((p): p is Protocol => p.id === protocolId);
    return protocol ? protocol.name : protocolId;
  };

  return (
    <>
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
          <div>
            <div className="container main-content">
              <div className="group-container">
                <h1>החייאה</h1>
                <CprContent />
              </div>
            </div>
          </div>
        </CPRLogProvider>
      </NotificationProvider>
    </CPRSettingsProvider>
  );
};

export default Cpr;