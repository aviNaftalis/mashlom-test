import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { useResusContext } from '../Resus/ResusContext';
import drugsDataFile from '../Resus/data/resus-drugs-definitions.json';
import emergencyProtocols from '../Resus/data/emergency-protocols.json';
import DrugComponent from '../Resus/Drug';
import { useCPRLog } from './CPRLog';
import { loadCurrentState, saveCurrentState } from './CprState/storage';
import { cprEventEmitter, EVENTS } from './cprEvents';
import './Medications.css';

interface Drug {
  id: string;
  name: string;
  howToGive: string;
  dose_per_kg: number;
  dose_unit: string;
  concentration: string;
  maxDose?: string;
  maxDoseUnit?: string;
  minDose?: string;
  minDoseUnit?: string;
  dose_range?: string;
  prepare_instructions?: string;
  administrationInstructions?: string;
  shouldDispalyConcentration?: boolean;
  comment?: string;
  type?: string;
  warnText?: string;
}

interface Section {
  name: string;
  drugs: string[];
}

interface ProtocolConfig {
  protocolId: string;
  drugs: string[];
  drips?: string[];
  defi?: Array<{
    name: string;
    joulePerKg: number;
  }>;
}

interface MedicationGuide {
  drugs: Drug[];
  sections: Section[];
  protocols: ProtocolConfig[];
}

interface EmergencyProtocol {
  name: string;
  id: string;
  algorithmFile?: string;
  protocolFile?: string;
}

interface ProtocolSection {
  section: string;
  protocols: EmergencyProtocol[];
}

interface EmergencyProtocolsData {
  emergencyProtocols: ProtocolSection[];
}

const MedicationsTable: React.FC<{
  title: string;
  drugs: Drug[];
  givenDrugs: Record<string, boolean>;
  onGiveMedication: (drug: Drug) => void;
}> = ({ title, drugs, givenDrugs, onGiveMedication }) => {
  const { addEntry } = useCPRLog();
  const { weight } = useResusContext();

  // Drug calculation functions from Drug.tsx
  const formatNumber = (num: number) => {
    let formatted = num.toFixed(2);
    formatted = formatted.replace(/\.?0+$/, '');
    return formatted;
  };

  const splitRatio = (ratio: string) => {
    return ratio.split('/').map(Number);
  };

  const getAdministrationUnit = (drugDefinition: Drug) => {
    if (drugDefinition.type === 'mass') {
      return drugDefinition.dose_unit;
    } else {
      return 'ml';
    }
  };

  const getDoseByWeightWithMaxLimit = (drugDefinition: Drug) => {
    if (weight === null) return 0;
    let doseByWeight = drugDefinition.dose_per_kg * weight;
    if (drugDefinition.maxDose) {
      doseByWeight = Math.min(Number(drugDefinition.maxDose), doseByWeight);
    }
    if (drugDefinition.minDose) {
      doseByWeight = Math.max(Number(drugDefinition.minDose), doseByWeight);
    }
    return doseByWeight;
  };

  const getDoseByWeightWithMaxLimitFormatted = (drugDefinition: Drug) => {
    return formatNumber(getDoseByWeightWithMaxLimit(drugDefinition));
  };

  const calcAmountToAdminister = (drugDefinition: Drug) => {
    let amount;
    if (drugDefinition.type === 'fluid' || drugDefinition.type === 'mass') {
      amount = getDoseByWeightWithMaxLimit(drugDefinition);
    } else {
      amount = calcVolume(drugDefinition);
    }
    return formatNumber(amount);
  };

  const calcVolume = (drugDefinition: Drug) => {
    const doseByWeight = getDoseByWeightWithMaxLimit(drugDefinition);
    const [numerator, denominator] = splitRatio(drugDefinition.concentration);
    const concentration = numerator / denominator;
    return doseByWeight / concentration;
  };

  const handleGiveMedication = (drug: Drug) => {
    if (!givenDrugs[drug.id]) {
      const text = `${drug.name}: ${getDoseByWeightWithMaxLimitFormatted(drug)} ${drug.dose_unit}, ${calcAmountToAdminister(drug)} ${getAdministrationUnit(drug)}`;
      addEntry({
        timestamp: new Date().toISOString(),
        text,
        type: 'medication',
        isImportant: false
      });
    }
    onGiveMedication(drug);
  };

  return (
    <table className="medications-table">
      <thead>
        <tr>
          <th className="header-title text-right">{title}</th>
          <th className="header-action text-center">ניתן</th>
        </tr>
      </thead>
      <tbody>
        {drugs.map((drug, index) => (
          <tr key={index}>
            <td className="drug-cell">
              <DrugComponent drug={drug} />
            </td>
            <td className="action-cell">
              <button 
                className="give-med-button"
                onClick={() => handleGiveMedication(drug)}
              >
                <FontAwesomeIcon 
                  icon={givenDrugs[drug.id] ? faCircleCheck : faPlus} 
                  className={`icon ${givenDrugs[drug.id] ? 'checked' : ''}`}
                />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Medications: React.FC = () => {
    const { protocol } = useResusContext();
    const drugsData = drugsDataFile as MedicationGuide;
    const protocols = emergencyProtocols as EmergencyProtocolsData;
  
    const [givenDrugs, setGivenDrugs] = useState<Record<string, boolean>>(() => {
      const savedState = loadCurrentState();
      return savedState?.medications?.givenDrugs || {};
    });
  
    useEffect(() => {
      const unsubscribe = cprEventEmitter.subscribe(EVENTS.RESET_CPR, () => {
        setGivenDrugs({});
      });
  
      return () => unsubscribe();
    }, []);

  // Get Resus Drugs
  const resusSection = drugsData.sections.find(section => section.name === "Resus Drugs");
  const resusDrugs = resusSection ? resusSection.drugs.map(drugId => 
    drugsData.drugs.find(drug => drug.id === drugId)
  ).filter((drug): drug is Drug => drug !== undefined) : [];

  // Get Protocol Drugs
  const selectedProtocol = drugsData.protocols.find(p => p.protocolId === protocol);
  const protocolDrugs = selectedProtocol ? selectedProtocol.drugs.map(drugId =>
    drugsData.drugs.find(drug => drug.id === drugId)
  ).filter((drug): drug is Drug => drug !== undefined) : [];

  // Get Protocol Name
  const getProtocolName = (protocolId: string): string => {
    const protocolData = protocols.emergencyProtocols
      .flatMap(section => section.protocols)
      .find(p => p.id === protocolId);
    return protocolData?.name || '';
  };

  const handleGiveMedication = (drug: Drug) => {
    const newGivenDrugs = {
      ...givenDrugs,
      [drug.id]: !givenDrugs[drug.id]
    };
    
    // Update local state
    setGivenDrugs(newGivenDrugs);
    
    // Save to storage
    saveCurrentState({
      medications: {
        givenDrugs: newGivenDrugs
      }
    }, 'medications');
  };

  return (
    <div id="medications-content" className="medications-container">
      <div style={{ marginBottom: '2rem' }}>
        <MedicationsTable 
          title="תרופות החייאה" 
          drugs={resusDrugs} 
          givenDrugs={givenDrugs}
          onGiveMedication={handleGiveMedication}
        />
      </div>

      {protocol && protocolDrugs.length > 0 && (
        <div>
          <MedicationsTable 
            title={`תרופות ${getProtocolName(protocol)}`} 
            drugs={protocolDrugs}
            givenDrugs={givenDrugs}
            onGiveMedication={handleGiveMedication}
          />
        </div>
      )}
    </div>
  );
};

export default Medications;