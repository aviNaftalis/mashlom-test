import { CPRState, ArchivedCPR } from './types';

const CURRENT_CPR_KEY = 'current_cpr_state_v1';
const ARCHIVED_CPRS_KEY = 'archived_cprs_v1';
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

export const archiveCPRState = (outcome: 'ROSC' | 'death'): void => {
    try {
      const currentState = loadCurrentState();
      if (currentState) {
        const archives = JSON.parse(localStorage.getItem(ARCHIVED_CPRS_KEY) || '[]');
        const timestamp = new Date().toISOString();
        const archivedState = {
          ...currentState,
          archivedAt: timestamp,
          id: `cpr-${timestamp}`,
          outcome: outcome === 'ROSC' ? 'ROSC' : 'death'
        };
        const updatedArchives = [archivedState, ...archives].slice(0, MAX_ARCHIVED_CPRS);
        localStorage.setItem(ARCHIVED_CPRS_KEY, JSON.stringify(updatedArchives));
      }
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

export const loadArchivedCPRById = (id: string): CPRState | null => {
  try {
    const archives = loadArchivedCPRs();
    const archived = archives.find(cpr => cpr.id === id);
    return archived || null;
  } catch (error) {
    console.error('Error loading archived CPR by id:', error);
    return null;
  }
};

export const restoreArchivedCPR = (id: string): boolean => {
  try {
    const archived = loadArchivedCPRById(id);
    if (archived) {
      localStorage.setItem(CURRENT_CPR_KEY, JSON.stringify(archived));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error restoring archived CPR:', error);
    return false;
  }
};

export const clearHistory = (): void => {
    try {
      localStorage.setItem(ARCHIVED_CPRS_KEY, '[]');
    } catch (error) {
      console.error('Error clearing CPR history:', error);
    }
};