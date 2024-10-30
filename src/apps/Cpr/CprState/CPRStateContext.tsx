import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { loadCurrentState, saveCurrentState } from './storage';
import { CPRState as StorageCPRState } from './types';

interface CPRState {
  isRunning: boolean;
  elapsedTime: number;
  massagerTime: number;
  adrenalineTime: number;
  adrenalineCount: number;
  shockCount: number;
  status: 'ACTIVE' | 'DEATH' | 'ROSC' | null;
  endTime: string | null;
}

type CPRAction =
  | { type: 'START_CPR' }
  | { type: 'END_CPR'; status: 'DEATH' | 'ROSC'; time: string }
  | { type: 'TICK' }
  | { type: 'INCREMENT_ADRENALINE' }
  | { type: 'INCREMENT_SHOCK' }
  | { type: 'SET_MASSAGER_TIME'; time: number }
  | { type: 'SET_ADRENALINE_TIME'; time: number }
  | { type: 'LOAD_STATE'; state: Partial<CPRState> };

const initialState: CPRState = {
  isRunning: false,
  elapsedTime: 0,
  massagerTime: 0,
  adrenalineTime: 0,
  adrenalineCount: 0,
  shockCount: 0,
  status: null,
  endTime: null
};

const convertStorageToContextState = (storageState: StorageCPRState | null): Partial<CPRState> => {
  if (!storageState) return {};
  
  return {
    isRunning: storageState.endState?.status === 'ACTIVE',
    elapsedTime: storageState.timers?.elapsedTime ?? 0,
    massagerTime: storageState.timers?.massagerTime ?? 0,
    adrenalineTime: storageState.timers?.adrenalineTime ?? 0,
    adrenalineCount: storageState.counters?.adrenalineCount ?? 0,
    shockCount: storageState.counters?.shockCount ?? 0,
    status: storageState.endState?.status ?? null,
    endTime: storageState.endState?.endTime ?? null
  };
};

const convertContextToStorageState = (state: CPRState): Partial<StorageCPRState> => {
  return {
    timers: {
      elapsedTime: state.elapsedTime,
      massagerTime: state.massagerTime,
      adrenalineTime: state.adrenalineTime
    },
    counters: {
      adrenalineCount: state.adrenalineCount,
      shockCount: state.shockCount
    },
    endState: {
      status: state.status,
      endTime: state.endTime
    }
  };
};

function cprReducer(state: CPRState, action: CPRAction): CPRState {
  switch (action.type) {
    case 'START_CPR':
      return { ...state, isRunning: true, status: 'ACTIVE' };
    case 'END_CPR':
      return {
        ...state,
        isRunning: false,
        status: action.status,
        endTime: action.time
      };
    case 'TICK':
      if (!state.isRunning) return state;
      return {
        ...state,
        elapsedTime: state.elapsedTime + 1,
        massagerTime: state.massagerTime > 0 ? state.massagerTime - 1 : 0,
        adrenalineTime: state.adrenalineTime > 0 ? state.adrenalineTime - 1 : 0
      };
    case 'INCREMENT_ADRENALINE':
      return { ...state, adrenalineCount: state.adrenalineCount + 1 };
    case 'INCREMENT_SHOCK':
      return { ...state, shockCount: state.shockCount + 1 };
    case 'SET_MASSAGER_TIME':
      return { ...state, massagerTime: action.time };
    case 'SET_ADRENALINE_TIME':
      return { ...state, adrenalineTime: action.time };
    case 'LOAD_STATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

const CPRStateContext = createContext<{
  state: CPRState;
  dispatch: React.Dispatch<CPRAction>;
} | null>(null);

export const CPRStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cprReducer, initialState);

  useEffect(() => {
    const savedState = loadCurrentState();
    const convertedState = convertStorageToContextState(savedState);
    if (Object.keys(convertedState).length > 0) {
      dispatch({ type: 'LOAD_STATE', state: convertedState });
    }
  }, []);

  useEffect(() => {
    if (!state.isRunning && !state.status) return;
    const storageState = convertContextToStorageState(state);
    saveCurrentState(storageState);
  }, [state]);

  return (
    <CPRStateContext.Provider value={{ state, dispatch }}>
      {children}
    </CPRStateContext.Provider>
  );
};

export const useCPRState = () => {
  const context = useContext(CPRStateContext);
  if (!context) {
    throw new Error('useCPRState must be used within a CPRStateProvider');
  }
  return context;
};

export default CPRStateProvider;