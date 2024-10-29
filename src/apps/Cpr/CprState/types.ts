export interface CPRTimerState {
    elapsedTime: number;
    massagerTime: number;
    adrenalineTime: number;
  }
  
  export interface CPRCountersState {
    adrenalineCount: number;
    shockCount: number;
  }
  
  export interface CprManagerSettings {
    isSoundOn: boolean;
  }

  export interface CPREndState {
    status: 'ACTIVE' | 'DEATH' | 'ROSC' | null;
    endTime: string | null;
  }

  export interface AirwaysState {
    airwayType: 'טובוס' | 'טובוס עם בלונית' | 'LMA' | null;
    airwaySize: string;
    hasAmbu: boolean;
    hasChestDrain: boolean;
    chestDrainSize: string;
    hasSurgicalAirway: boolean;
  }

  export interface DefibrillatorState {
    lastUsedTimes: { [key: string]: string };
  }

  export interface VitalSignsState {
    signs: Array<{
      timestamp: string;
      heartRate: string;
      bloodPressure: string;
      saturation: string;
      etco2: string;
      glucose: string;
      temperature: string;
    }>;
  }

  export interface ProceduresState {
    lastPerformed: {
      [key: string]: string;
    };
  }

  export interface MedicationsState {
    givenDrugs: {
      [key: string]: boolean;
    };
  }

  export interface ResusContextState {
    age: string;
    weight: number | null;
    protocol: string | null;
  }

  export interface CPRLog {
    patientId: string;
    entries: Array<{
      id: string;
      timestamp: string;
      text: string;
      type: 'patientDetails' | 'medication' | 'action';
      isImportant: boolean;
    }>;
  }
  
  export interface CPRState {
    id: string;
    startTime: string;
    timers: CPRTimerState;
    counters: CPRCountersState;
    cprManagerSettings: CprManagerSettings;
    endState: CPREndState;
    airways: AirwaysState;
    defibrillator: DefibrillatorState;
    vitalSigns: VitalSignsState;
    procedures: ProceduresState;
    medications: MedicationsState;
    resusContext: ResusContextState;
    log: CPRLog;
  }

  