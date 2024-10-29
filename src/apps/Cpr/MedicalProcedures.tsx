import React, { useState } from 'react';
import { useCPRLog } from './CPRLog';
import { loadCurrentState, saveCurrentState } from './CprState/storage';
import './MedicalProcedures.css';

interface ProcedureLog {
  [key: string]: string;
}

const MedicalProcedures: React.FC = () => {
  const { addEntry } = useCPRLog();
  const [lastPerformed, setLastPerformed] = useState<ProcedureLog>(() => {
    // Initialize from storage or empty object
    const savedState = loadCurrentState();
    return savedState?.procedures?.lastPerformed || {};
  });

  const procedures = [
    { id: 'catheter', label: 'קטטר שתן', logText: 'חובר קטטר שתן'},
    { id: 'nasogastric', label: 'זונדה', logText: 'חוברה זונדה'},
    { id: 'iv', label: 'IV', logText: 'הוכנס IV', group: 'line' },
    { id: 'io', label: 'IO', logText: 'הוכנס IO', group: 'line' },
    { id: 'central', label: 'CENTRAL', logText: 'הוכנס CENTRAL', group: 'line' },
  ];

  const handleProcedureClick = (procedure: { id: string; logText: string }) => {
    const timestamp = new Date().toISOString();
    
    // Update local state
    const newLastPerformed = { 
      ...lastPerformed, 
      [procedure.id]: timestamp 
    };
    setLastPerformed(newLastPerformed);

    // Save to storage
    saveCurrentState({
      procedures: {
        lastPerformed: newLastPerformed
      }
    }, 'procedures');

    addEntry({
      timestamp,
      text: procedure.logText,
      type: 'action',
      isImportant: false,
    });
  };

  const renderProcedureButton = (procedure: any) => (
    <div key={procedure.id} className="procedure-button-container">
      <button onClick={() => handleProcedureClick(procedure)}>
        {procedure.label}
      </button>
      {lastPerformed[procedure.id] && (
        <span className="last-performed">
          בוצע לאחרונה ב {new Date(lastPerformed[procedure.id]).toLocaleTimeString('he-IL')}
        </span>
      )}
    </div>
  );

  return (
    <div className="medical-procedures">
      <h5>לחץ על הפעולה שבוצעה:</h5>
      <div className="procedures-grid">
        {procedures.filter(p => !p.group).map(renderProcedureButton)}
      </div>
      <div className="line-procedures">
        <h5>LINE</h5>
        <div className="procedures-grid">
          {procedures.filter(p => p.group === 'line').map(renderProcedureButton)}
        </div>
      </div>
    </div>
  );
};

export default MedicalProcedures;