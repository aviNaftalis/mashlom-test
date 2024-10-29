import { CPRState, ArchivedCPR } from './types';

const CURRENT_CPR_KEY = 'current_cpr_state';
const ARCHIVED_CPRS_KEY = 'archived_cprs';
const MAX_ARCHIVED_CPRS = 5;

export const saveCurrentState = (state: Partial<CPRState>, section?: keyof CPRState): void => {
  try {
    const currentState = (loadCurrentState() || {}) as Partial<CPRState>;
    
    // If a specific section is provided, only update that section
    if (section) {
      const newState = {
        ...currentState,
        [section]: {
            ...(typeof currentState[section] === 'object' ? currentState[section] : {}),
            ...(typeof state[section] === 'object' ? state[section] : {})
        }
      };
      localStorage.setItem(CURRENT_CPR_KEY, JSON.stringify(newState));
    } else {
      // Otherwise merge the entire state
      const newState = {
        ...currentState,
        ...state
      };
      localStorage.setItem(CURRENT_CPR_KEY, JSON.stringify(newState));
    }
  } catch (error) {
    console.error('Error saving current CPR state:', error);
  }
};

// Rest of the storage.ts remains the same
export const loadCurrentState = (): CPRState | null => {
  try {
    const savedState = localStorage.getItem(CURRENT_CPR_KEY);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error('Error loading current CPR state:', error);
    return null;
  }
};

export const clearCurrentState = (): void => {
  localStorage.removeItem(CURRENT_CPR_KEY);
};

export const archiveCPRState = (state: CPRState): void => {
  try {
    const archives = JSON.parse(localStorage.getItem(ARCHIVED_CPRS_KEY) || '[]');
    const updatedArchives = [state, ...archives].slice(0, MAX_ARCHIVED_CPRS);
    localStorage.setItem(ARCHIVED_CPRS_KEY, JSON.stringify(updatedArchives));
  } catch (error) {
    console.error('Error archiving CPR state:', error);
  }
};

export const loadArchivedCPRs = (): ArchivedCPR[] => {
    try {
      const archives = localStorage.getItem(ARCHIVED_CPRS_KEY);
      return archives ? JSON.parse(archives) : [];
    } catch (error) {
      console.error('Error loading archived CPRs:', error);
      return [];
    }
};