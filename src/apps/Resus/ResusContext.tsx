import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ResusContextType {
  age: string;
  weight: number | null;
  protocol: string | null;
  setAge: (age: string) => void;
  setWeight: (weight: number | null) => void;
  setProtocol: (protocol: string | null) => void;
  updateContext: (age: string, weight: number | null, protocol: string | null) => void;
  resetContext: () => void;
}

const ResusContext = createContext<ResusContextType | undefined>(undefined);

export const useResusContext = () => {
  const context = useContext(ResusContext);
  if (!context) {
    throw new Error('useResusContext must be used within a ResusProvider');
  }
  return context;
};

export const ResusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<number | null>(null);
  const [protocol, setProtocol] = useState<string | null>('');

  const navigate = useNavigate();
  const location = useLocation();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!initialLoadDone.current) {
      const searchParams = new URLSearchParams(location.search);
      const ageParam = searchParams.get('age');
      const weightParam = searchParams.get('weight');
      const protocolParam = searchParams.get('protocol');

      if (ageParam) setAge(ageParam);
      if (weightParam) setWeight(Number(weightParam));
      if (protocolParam) setProtocol(protocolParam);

      initialLoadDone.current = true;
    }
  }, []);

  const updateContext = (newAge: string, newWeight: number | null, newProtocol: string | null) => {
    setAge(newAge);
    setWeight(newWeight);
    setProtocol(newProtocol);
    const searchParams = new URLSearchParams(location.search);
    if (newAge) searchParams.set('age', newAge);
    if (newProtocol) searchParams.set('protocol', newProtocol);
    if (newWeight !== null) searchParams.set('weight', newWeight.toString());
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  const resetContext = () => {
    setAge('');
    setWeight(null);
    setProtocol('');
    navigate(location.pathname, { replace: true });
  };

  return (
    <ResusContext.Provider value={{ 
      age, 
      weight, 
      protocol, 
      setAge, 
      setWeight, 
      setProtocol, 
      updateContext, 
      resetContext 
    }}>
      {children}
    </ResusContext.Provider>
  );
};