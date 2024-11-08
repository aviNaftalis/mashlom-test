import React, { useState, useEffect } from 'react';
import { useResusContext } from '../Resus/ResusContext';
import { useCPRLog } from './CPRLog';
import { useCPRState } from './CprState/CPRStateContext';
import { loadCurrentState, saveCurrentState } from './CprState/storage';
import resusDrugsDefinitions from '../Resus/data/resus-drugs-definitions.json';
import { cprEventEmitter, EVENTS } from './cprEvents';

interface DefiAction {
  name: string;
  joulePerKg: number;
}

const Defibrillator: React.FC = () => {
  const { weight } = useResusContext();
  const { addEntry } = useCPRLog();
  const { dispatch } = useCPRState();
  const [lastUsedTimes, setLastUsedTimes] = useState<{ [key: string]: string }>(() => {
    const savedState = loadCurrentState();
    return savedState?.defibrillator?.lastUsedTimes || {};
  });

  useEffect(() => {
    const unsubscribe = cprEventEmitter.subscribe(EVENTS.RESET_CPR, () => {
      setLastUsedTimes({});
    });

    return () => unsubscribe();
  }, []);

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

    const newLastUsedTimes = {
      ...lastUsedTimes,
      [defiAction.name]: currentTime
    };

    setLastUsedTimes(newLastUsedTimes);
    saveCurrentState({
      defibrillator: {
        lastUsedTimes: newLastUsedTimes
      }
    }, 'defibrillator');

    dispatch({ type: 'INCREMENT_SHOCK' });

    addEntry({
      timestamp: new Date().toISOString(),
      text: `בוצע ${defiAction.name} - ${getDefi(defiAction.joulePerKg)} J`,
      type: 'action',
      isImportant: true
    });
  };

  return (
    <div style={{ marginTop: '15px', marginBottom: '15px' }}>
      {!weight && (
        <div style={{ 
          color: 'red', 
          textAlign: 'right', 
          marginBottom: '20px', 
          direction: 'rtl',
          fontWeight: 'bold'
        }}>
          כדי לצפות בעוצמה הנדרשת, נא הזן את משקל המטופל תחילה.
        </div>
      )}
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        tableLayout: 'fixed',
        direction: 'ltr'
      }}>
        <colgroup>
          <col style={{ width: '40%' }}/>
          <col style={{ width: '35%' }}/>
          <col style={{ width: '25%' }}/>
        </colgroup>
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
                {weight && (
                  <span style={{ fontWeight: "bold"}}>
                    {getDefi(defi.joulePerKg)} ({defi.joulePerKg}J/Kg)
                  </span>
                )}
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