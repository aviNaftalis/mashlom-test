import { useEffect } from 'react';
import { CPRState } from './types';
import { saveCurrentState, clearCurrentState, archiveCPRState, loadCurrentState } from './storage';

interface InitialStateCallbacks {
  setElapsedTime: (time: number) => void;
  setMassagerTime: (time: number) => void;
  setAdrenalineTime: (time: number) => void;
  startCpr: () => void;
  setShowDeathMessage: (show: boolean) => void;
  setShowSuccessMessage: (show: boolean) => void;
  setDeathTime: (time: string) => void;
  setSuccessTime: (time: string) => void;
}

export const useCPRStateReporter = (
  {
    isRunning,
    elapsedTime,
    massagerTime,
    adrenalineTime,
    adrenalineCount,
    shockCount,
    status,
    endTime
  }: {
    isRunning: boolean;
    elapsedTime: number;
    massagerTime: number;
    adrenalineTime: number;
    adrenalineCount: number;
    shockCount: number;
    status: 'ACTIVE' | 'DEATH' | 'ROSC' | null;
    endTime: string | null;
  },
  callbacks: InitialStateCallbacks
) => {
  // Restore state on mount
  useEffect(() => {
    const savedState = loadCurrentState();
    if (savedState) {
      // Restore timers
      callbacks.setElapsedTime(savedState.timers?.elapsedTime || 0);
      callbacks.setMassagerTime(savedState.timers?.massagerTime || 0);
      callbacks.setAdrenalineTime(savedState.timers?.adrenalineTime || 0);

      // Restore CPR status
      if (savedState.endState?.status === 'ACTIVE') {
        callbacks.startCpr();
      } else if (savedState.endState?.status === 'DEATH') {
        callbacks.setShowDeathMessage(true);
        callbacks.setDeathTime(savedState.endState.endTime || '');
      } else if (savedState.endState?.status === 'ROSC') {
        callbacks.setShowSuccessMessage(true);
        callbacks.setSuccessTime(savedState.endState.endTime || '');
      }
    }
  }, []); // Only run on mount

  // Save state changes
  useEffect(() => {
    if (!isRunning && !status) {
      return; // Don't save initial state before CPR starts
    }

    const currentState: CPRState = {
      id: crypto.randomUUID(), // This will be overwritten on load if state exists
      startTime: new Date().toISOString(), // This will be overwritten on load if state exists
      timers: {
        elapsedTime,
        massagerTime,
        adrenalineTime
      },
      counters: {
        adrenalineCount,
        shockCount
      },
      endState: {
        status,
        endTime
      }
    };

    if (status === 'DEATH' || status === 'ROSC') {
      // Archive the final state when CPR ends
      archiveCPRState(currentState);
      clearCurrentState();
    } else {
      // Save current state during active CPR
      saveCurrentState(currentState);
    }
  }, [
    isRunning,
    elapsedTime,
    massagerTime,
    adrenalineTime,
    adrenalineCount,
    shockCount,
    status,
    endTime
  ]);
};