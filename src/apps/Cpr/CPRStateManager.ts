// Types for different aspects of CPR state
export interface CPRState {
  id: string;
  startTime: string;
  endTime?: string;
  outcome?: 'ROSC' | 'DEATH';
  managerState: CPRManagerState;
  // Add index signature to allow dynamic section names
  [key: string]: any;
  // We'll add more state interfaces as we implement each section
  // airwaysState?: AirwaysState;
  // medicationsState?: MedicationsState;
  // etc...
}

export interface CPRManagerState {
  elapsedTime: number;
  adrenalineCount: number;
  shockCount: number;
  isRunning: boolean;
}

// Constants
const CURRENT_CPR_KEY = 'current_cpr_state';
const ARCHIVED_CPR_KEY = 'archived_cpr_states';
const MAX_ARCHIVED_STATES = 5;

export class CPRStateManager {
  // Get current CPR state
  static getCurrentState(): CPRState | null {
    const stateStr = localStorage.getItem(CURRENT_CPR_KEY);
    return stateStr ? JSON.parse(stateStr) : null;
  }

  // Save current CPR state
  static saveCurrentState(state: CPRState): void {
    localStorage.setItem(CURRENT_CPR_KEY, JSON.stringify(state));
  }

  // Update specific section of current state
  static updateCurrentState<T>(sectionName: string, sectionState: T): void {
    const currentState = this.getCurrentState();
    if (currentState) {
      const updatedState = {
        ...currentState,
        [sectionName]: sectionState
      };
      this.saveCurrentState(updatedState);
    }
  }

  // Archive current state and clear it
  static archiveCurrentState(): void {
    const currentState = this.getCurrentState();
    if (!currentState) return;

    // Get archived states
    const archivedStatesStr = localStorage.getItem(ARCHIVED_CPR_KEY);
    const archivedStates: CPRState[] = archivedStatesStr ? JSON.parse(archivedStatesStr) : [];

    // Add current state to archived states
    archivedStates.unshift(currentState);

    // Keep only MAX_ARCHIVED_STATES most recent states
    while (archivedStates.length > MAX_ARCHIVED_STATES) {
      archivedStates.pop();
    }

    // Save archived states and clear current state
    localStorage.setItem(ARCHIVED_CPR_KEY, JSON.stringify(archivedStates));
    localStorage.removeItem(CURRENT_CPR_KEY);
  }

  // Get archived state by ID
  static getArchivedState(id: string): CPRState | null {
    const archivedStatesStr = localStorage.getItem(ARCHIVED_CPR_KEY);
    if (!archivedStatesStr) return null;

    const archivedStates: CPRState[] = JSON.parse(archivedStatesStr);
    return archivedStates.find(state => state.id === id) || null;
  }

  // Get all archived states
  static getArchivedStates(): CPRState[] {
    const archivedStatesStr = localStorage.getItem(ARCHIVED_CPR_KEY);
    return archivedStatesStr ? JSON.parse(archivedStatesStr) : [];
  }

  // Clear current state
  static clearCurrentState(): void {
    localStorage.removeItem(CURRENT_CPR_KEY);
  }

  // Create new CPR state
  static initializeNewState(): CPRState {
    const newState: CPRState = {
      id: crypto.randomUUID(),
      startTime: new Date().toISOString(),
      managerState: {
        elapsedTime: 0,
        adrenalineCount: 0,
        shockCount: 0,
        isRunning: true
      }
    };
    this.saveCurrentState(newState);
    return newState;
  }
}

// Custom hook for components to easily manage their state
import { useState, useEffect } from 'react';

export function useCPRStateSection<T>(
  sectionName: string,
  initialState: T,
  dependencies: any[] = []
): [T, (newState: T) => void] {
  const [state, setState] = useState<T>(() => {
    const currentState = CPRStateManager.getCurrentState();
    return (currentState?.[sectionName] as T) || initialState;
  });

  useEffect(() => {
    const currentState = CPRStateManager.getCurrentState();
    if (currentState?.[sectionName]) {
      setState(currentState[sectionName] as T);
    }
  }, [...dependencies]);

  const updateState = (newState: T) => {
    setState(newState);
    CPRStateManager.updateCurrentState(sectionName, newState);
  };

  return [state, updateState];
}