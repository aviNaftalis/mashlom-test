import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useResusContext } from '../Resus/ResusContext';
import drugsDataFile from '../Resus/data/resus-drugs-definitions.json';
import DrugComponent from '../Resus/Drug';
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

interface MedicationGuide {
  drugs: Drug[];
  sections: Section[];
  protocols: {
    protocolId: string;
    drugs: string[];
    drips: string[];
  }[];
}

const MedicationsTable: React.FC<{
  title: string;
  drugs: Drug[];
}> = ({ title, drugs }) => {
  const handleGiveMedication = (drug: Drug) => {
    console.log(`Giving medication: ${drug.name}`);
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
                <FontAwesomeIcon icon={faPlus} />
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
  const drugsData: MedicationGuide = drugsDataFile;

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

  return (
    <div id="medications-content">
      <div style={{ marginBottom: '2rem' }}>
        <MedicationsTable title="תרופות החייאה" drugs={resusDrugs} />
      </div>

      {protocol && protocolDrugs.length > 0 && (
        <div>
          <MedicationsTable title="תרופות פרוטוקול" drugs={protocolDrugs} />
        </div>
      )}
    </div>
  );
};

export default Medications;