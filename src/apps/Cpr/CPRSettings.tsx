import React, { createContext, useContext, useState } from 'react';

export interface CPRSettings {
  massagerAlertEnabled: boolean;
  adrenalineAlertEnabled: boolean;
  massagerAlertTime: string; // mm:ss format
  adrenalineAlertTime: string; // mm:ss format
  timerDisplay: 'none' | 'massager' | 'adrenaline';
}

const defaultSettings: CPRSettings = {
  massagerAlertEnabled: true,
  adrenalineAlertEnabled: true,
  massagerAlertTime: '02:00',
  adrenalineAlertTime: '03:00',
  timerDisplay: 'massager'
};

interface CPRSettingsContextType {
  settings: CPRSettings;
  updateSettings: (newSettings: CPRSettings) => void;
}

const CPRSettingsContext = createContext<CPRSettingsContextType | undefined>(undefined);

export const useCPRSettings = () => {
  const context = useContext(CPRSettingsContext);
  if (!context) {
    throw new Error('useCPRSettings must be used within a CPRSettingsProvider');
  }
  return context;
};

export const CPRSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CPRSettings>(() => {
    const stored = localStorage.getItem('cprSettings');
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  const updateSettings = (newSettings: CPRSettings) => {
    setSettings(newSettings);
    localStorage.setItem('cprSettings', JSON.stringify(newSettings));
  };

  return (
    <CPRSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </CPRSettingsContext.Provider>
  );
};

export default CPRSettingsProvider;