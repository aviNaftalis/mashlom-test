import React, { useState } from 'react';
import { FaCircleInfo } from 'react-icons/fa6';
import { useResusContext } from './ResusContext';
import DrugInfoDialog from './DrugInfoDialog';

interface DrugProps {
  drug: Drug;
}

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

const Drug: React.FC<DrugProps> = ({ drug }) => {
  const { weight } = useResusContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const openDrugInfoDialog = () => {
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left', color: 'var(--page-font-color)' }}>
      <div>
        {!drug.type ? (
          <>
            {drug.name}: <strong>{getDoseByWeightWithMaxLimitFormatted(drug)} {drug.dose_unit},</strong>{' '}
            <strong>{calcAmountToAdminister(drug)} {getAdministrationUnit(drug)}</strong> -{' '}
            <span className={drug.howToGive && drug.howToGive.trim() !== 'IV' ? 'bold-text' : ''}>
              {drug.howToGive}
            </span>
          </>
        ) : (
          <>
            {drug.name}: <strong>{calcAmountToAdminister(drug)} {getAdministrationUnit(drug)}</strong> -{' '}
            <span className={drug.howToGive && drug.howToGive.trim() !== 'IV' ? 'bold-text' : ''}>
              {drug.howToGive}
            </span>
          </>
        )}
        <br />
        Calculated dose: {drug.dose_per_kg} {drug.dose_unit}/kg
        {drug.shouldDispalyConcentration && (
          <>
            <br />
            Concentration: <strong>{splitRatio(drug.concentration)[0]} {drug.dose_unit} per {splitRatio(drug.concentration)[1]} ml</strong>
          </>
        )}
        {drug.comment && (
          <>
          <br />
          {drug.comment}
          </>
        )}
        {drug.warnText && (
          <>
          <br />
          <span style={{ color: 'red' }}><strong>{drug.warnText}</strong></span>
          </>
        )}
        {drug.maxDose && Number(drug.maxDose) === getDoseByWeightWithMaxLimit(drug) && (
          <>
          <br /><span style={{ color: 'red' }}><strong>Used max dose of {drug.maxDose} {drug.maxDoseUnit}</strong></span>
          </>
        )}
      </div>
      <div className="info-button" onClick={openDrugInfoDialog}>
        <FaCircleInfo style={{ marginLeft: '10px', cursor: 'pointer' }} />
      </div>
      <DrugInfoDialog
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        drug={drug}
      />
      </div>
  );
};

export default Drug;