import { MashlomApps, AppSection } from './apps';

export interface HospitalConfig {
  name: string;
  sections: AppSection[];
  theme: {
    primaryColor: string;
  };
}

export enum Hospitals {
  ASSUTA_ASHDOD = 'assuta',
  KAPLAN = 'kaplan',
  EMEK = 'emek',
}

export const hospitals: Record<string, HospitalConfig> = {
  apps: {
    name: 'כללי',
    sections: [
      {
        name: 'מחלקת ילדים',
        apps:[
          MashlomApps.PHOTOTHERAPY,
          MashlomApps.EOS,
          MashlomApps.CorrectedAge,
        ]
      },
      {
        name: 'מלר"ד ילדים',
        apps:[
          MashlomApps.TRIAGE,                    
          MashlomApps.RESUS,
          MashlomApps.CPR
        ]
      }
    ],
    theme: {
      primaryColor: '#007bff',
    },
  },
  [Hospitals.ASSUTA_ASHDOD]: {
    name: 'אסותא אשדוד',
    sections: [
      {
        name: 'מחלקת ילדים',
        apps:[
          MashlomApps.PHOTOTHERAPY,
          MashlomApps.EOS,
        ]
      },
      {
        name: 'מלר"ד ילדים',
        apps:[
          MashlomApps.TRIAGE,
        ]
      }
    ],
    theme: {
      primaryColor: '#007bff',
    },
  },
  [Hospitals.KAPLAN]: {
    name: 'קפלן',
    sections: [
      {
        name: 'מלר"ד ילדים - קפלן',
        apps:[
          MashlomApps.PHOTOTHERAPY,
          MashlomApps.TRIAGE,
          MashlomApps.RESUS,
        ]
      }
    ],
    theme: {
      primaryColor: '#007bff',
    },
  },
  [Hospitals.EMEK]: {
    name: 'מרכז רפואי העמק',
    sections: [
      {
        name: 'מלר"ד ילדים',
        apps:[
          MashlomApps.RESUS,
          MashlomApps.CPR,
          MashlomApps.TRIAGE,
          MashlomApps.PHOTOTHERAPY,
        ]
      }
    ],
    theme: {
      primaryColor: '#007bff',
    },
  },
};
