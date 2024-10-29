import React, { useState } from 'react';
import { useResusContext } from '../Resus/ResusContext';
import { useCPRLog } from './CPRLog';
import { useCPRCounters } from './CprManager/CPRCountersContext';
import resusDrugsDefinitions from '../Resus/data/resus-drugs-definitions.json';

interface DefiAction {
  name: string;
  joulePerKg: number;
}

const Defibrillator: React.FC = () => {
  const { weight } = useResusContext();
  const { addEntry } = useCPRLog();
  const { incrementShock } = useCPRCounters();
  const [lastUsedTimes, setLastUsedTimes] = useState<{ [key: string]: string }>({});
  
  const getDefi = (multiplier: number): number => {
    return weight ? Math.min(multiplier * weight, 200) : 0;
  };

  const defibrillatorActions = resusDrugsDefinitions.protocols
    .find(protocol => protocol.protocolId === 'cpr')
    ?.defi || [];

  const handleDefibrillation = (defiAction: DefiAction) => {
    const currentTime = new Date().toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    setLastUsedTimes(prev => ({
      ...prev,
      [defiAction.name]: currentTime
    }));

    incrementShock();

    addEntry({
      timestamp: new Date().toISOString(),
      text: `בוצע ${defiAction.name} - ${getDefi(defiAction.joulePerKg)}`,
      type: 'action',
      isImportant: true
    });
  };

  return (
    <div style={{ marginTop: '15px', marginBottom: '15px' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        direction: 'ltr'
      }}>
        <colgroup>
          <col style={{ width: '40%' }}/>
          <col style={{ width: '35%' }}/>
          <col style={{ width: '25%' }}/></colgroup>
        <tbody>
          {defibrillatorActions.map((defi, index) => (
            <tr key={index}>
              <td style={{ 
                textAlign: 'left', 
                padding: '8px', 
                border: '1px solid #ccc',
              }}>
                {defi.name}
              </td>
              <td style={{ 
                textAlign: 'left', 
                padding: '8px', 
                border: '1px solid #ccc',
                
              }}>
                <span style={{ fontWeight: "bold"}}>
                  {getDefi(defi.joulePerKg)} ({defi.joulePerKg}J/Kg)
                </span>
              </td>
              <td style={{ 
                padding: '8px', 
                border: '1px solid #ccc',
                textAlign: 'center'
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <button 
                    onClick={() => handleDefibrillation(defi)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#1FB5A3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    בוצע
                  </button>
                  {lastUsedTimes[defi.name] && (
                    <div style={{ 
                      fontSize: '0.9em', 
                      color: '#666',
                      whiteSpace: 'nowrap',
                      marginTop: '4px'
                    }}>
                      בוצע לאחרונה ב <br /> {lastUsedTimes[defi.name]}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Defibrillator;