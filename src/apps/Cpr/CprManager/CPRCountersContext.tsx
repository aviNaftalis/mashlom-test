import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useCPRLog } from '../CPRLog';
import { loadCurrentState } from '../CprState/storage';

interface CPRCountersContextType {
  adrenalineCount: number;
  shockCount: number;
  isRunning: boolean;
  incrementAdrenaline: () => void;
  incrementShock: () => void;
  startCpr: () => void;
  endCpr: (reason: 'ROSC' | 'DEATH') => void;
}

const CPRCountersContext = createContext<CPRCountersContextType | undefined>(undefined);

export const useCPRCounters = () => {
  const context = useContext(CPRCountersContext);
  if (context === undefined) {
    throw new Error('useCPRCounters must be used within a CPRCountersProvider');
  }
  return context;
};

interface CPRCountersProviderProps {
  children: React.ReactNode;
}

export const CPRCountersProvider: React.FC<CPRCountersProviderProps> = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [adrenalineCount, setAdrenalineCount] = useState(0);
  const [shockCount, setShockCount] = useState(0);
  const { addEntry } = useCPRLog();

  // Restore counters state on mount
  useEffect(() => {
    const savedState = loadCurrentState();
    if (savedState) {
      setAdrenalineCount(savedState.counters?.adrenalineCount || 0);
      setShockCount(savedState.counters?.shockCount || 0);
      setIsRunning(savedState.endState?.status === 'ACTIVE');
    }
  }, []);

  const handleAdrenaline = useCallback(() => {
    if (isRunning) {
      setAdrenalineCount(prev => {
        const newCount = prev + 1;
        addEntry({
          timestamp: new Date().toISOString(),
          text: `ניתן אדרנלין מספר ${newCount}`,
          type: 'medication',
          isImportant: true
        });
        return newCount;
      });
    }
  }, [isRunning, addEntry]);

  const handleShock = useCallback(() => {
    if (isRunning) {
      setShockCount(prev => {
        const newCount = prev + 1;
        addEntry({
          timestamp: new Date().toISOString(),
          text: `ניתן שוק מספר ${newCount}`,
          type: 'action',
          isImportant: true
        });
        return newCount;
      });
    }
  }, [isRunning, addEntry]);

  const startCpr = useCallback(() => {
    setIsRunning(true);
    setAdrenalineCount(0);
    setShockCount(0);
    addEntry({
      timestamp: new Date().toISOString(),
      text: "החייאה התחילה",
      type: 'action',
      isImportant: true
    });
  }, [addEntry]);

  const endCpr = useCallback((reason: 'ROSC' | 'DEATH') => {
    setIsRunning(false);
    addEntry({
      timestamp: new Date().toISOString(),
      text: reason === 'ROSC' ? "ההחיאה הסתיימה בהצלחה" : "נקבע מות המטופל",
      type: 'action',
      isImportant: true
    });
  }, [addEntry]);

  const value = {
    adrenalineCount,
    shockCount,
    isRunning,
    incrementAdrenaline: handleAdrenaline,
    incrementShock: handleShock,
    startCpr,
    endCpr
  };

  return (
    <CPRCountersContext.Provider value={value}>
      {children}
    </CPRCountersContext.Provider>
  );
};

export default CPRCountersProvider;