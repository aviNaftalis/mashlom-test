import React, { useState } from 'react';
import { FaCircleInfo } from 'react-icons/fa6';
import { useResusContext } from './ResusContext';
import DripInfoDialog from './DripInfoDialog';

interface DripProps {
  drip: Drip;
}

interface Drip {
  id: string;
  name: string;
  howToGive: string;
  dose_unit: string;
  allowed_dose_range: string;
  calc_type: string;
  default_dilution_volume_unit?: string;
  default_dilution_volume_ml?: number | null;
  dose_per_kg_per_min?: number;
  dose_per_kg_per_hour?: number;
  existing_dilution_concentration?: string;
  existing_dilution_concentration_dose_unit?: string;
  definition_by_weights?: Array<WeightDefinition>;
  target_volume_ml_per_hour?: number;
}

interface WeightDefinition {
  min_kg: number;
  max_kg: number;
  target_volume_ml_per_hour: number;
}

const Drip: React.FC<DripProps> = ({ drip }) => {
  const { weight } = useResusContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatNumber = (num: number): string => {
    let formatted = num.toFixed(2);
    formatted = formatted.replace(/\.?0+$/, '');
    return formatted;
  };

  const calcDilutionPerKg = (drip: Drip) => {
    const dosePerHour = calcDosePerHourPerWeight(drip, weight);
    const dose_to_add = ((drip.default_dilution_volume_ml? drip.default_dilution_volume_ml : 0)  / getTargetVolumePerHour(drip)) * dosePerHour;
    const { dose: doseForDilution, units: unitsForDilution } = prettifyUnits(dose_to_add, drip.dose_unit);
    const { dose: doseBeforeDilution, units: unitsBeforeDilution } = prettifyUnits(dosePerHour, drip.dose_unit);
    return { 
      doseBeforeDilution: formatNumber(doseBeforeDilution), 
      unitsBeforeDilution, 
      doseForDilution: formatNumber(doseForDilution), 
      unitsForDilution 
    };
  };

  const calcDosePerHourPerWeight = (drugData: Drip, kg: number | null): number => {
    if (kg === null) return 0;
    let drug_per_hour = 0;
    if (drugData.dose_per_kg_per_min) {
        drug_per_hour = drugData.dose_per_kg_per_min * 60;
    } else if (drugData.dose_per_kg_per_hour) {
        drug_per_hour = drugData.dose_per_kg_per_hour;
    } else {
        throw new Error("neither minute nor hour provided to drug " + drugData.name);
    }
    return drug_per_hour * kg;
  };

  const prettifyUnits = (dose: number, units: string): { dose: number; units: string } => {
    if (dose < 1000) {
      return { dose, units };
    } else {
      if (units === 'mcg') {
        return { dose: dose / 1000, units: 'mg' };
      }
      return { dose, units };
    }
  };

  const getTargetVolumePerHour = (drip: Drip): number => {
    const definition = getDripOverrideDefinitionsByWeight(drip);
    return definition.target_volume_ml_per_hour ?? 0;
  };

  const getDripOverrideDefinitionsByWeight = (drip: Drip): Drip => {
    if (drip.definition_by_weights) {
      const definition = findDefinitionByWeight(drip.definition_by_weights);
      return { ...drip, ...definition };
    }
    return drip;
  };

  const findDefinitionByWeight = (definition_by_weights: WeightDefinition[]): WeightDefinition => {
    if (weight === null) return definition_by_weights[0]; // Return first definition if weight is null
    for (let range of definition_by_weights) {
        if (weight >= range.min_kg && weight < range.max_kg) {
            return range;
        }
    }
    throw new Error("Weight out of defined ranges");
  };

  const calcInfusionSpeed = (drip: Drip): string => {
    const dosePerKg = calcDosePerHourPerWeight(drip, weight);
    if (drip.dose_unit !== drip.existing_dilution_concentration_dose_unit) {
      throw new Error("Dosage unit and existing concentration does not match. need to implement units alignment before calculation. drug with error:" + drip.name);
    }
    if (drip.existing_dilution_concentration) {
      const [numerator, denominator] = drip.existing_dilution_concentration.split('/').map(Number);
      const concentration = numerator / denominator;
      return formatNumber(dosePerKg / concentration);  // Volume = Mass / Concentration
    }
    throw new Error("Missing existing dilution concentration for drug: " + drip.name);
  };

  const getDripRate = (drip: Drip): number | undefined => {
    return drip.dose_per_kg_per_min ?? drip.dose_per_kg_per_hour;
  };

  const getTimeUnitString = (drip: Drip): string => {
    return drip.dose_per_kg_per_min ? 'minute' : 'hour';
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left', color: 'var(--page-font-color)' }}>
        <span>
          {drip.calc_type === 'DilutionInstructions' ? (
            <>
              {drip.name}:
              <b> {calcDilutionPerKg(drip).doseForDilution} {calcDilutionPerKg(drip).unitsForDilution} </b>
              in
              <b> {drip.default_dilution_volume_ml} ml</b>
              ({getTargetVolumePerHour(drip)}ml/Hr)
            </>
          ) : (
            <>
              {drip.name}:
              <b> {calcInfusionSpeed(drip)}ml/Hr </b>
              (existing concentration of {drip.existing_dilution_concentration}
              {drip.existing_dilution_concentration_dose_unit}/ml)
            </>
          )}
          <br />
          Initial rate: {getDripRate(drip)} {drip.dose_unit}/kg/{getTimeUnitString(drip)}
          <br />
          Rate range: {drip.allowed_dose_range}
        </span>
        <div onClick={openModal} className="info-button">
          <FaCircleInfo style={{ marginLeft: '10px', cursor: 'pointer' }} />
        </div>
      </div>
      <DripInfoDialog
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        drip={drip}
        weight={weight}
      />
    </div>
  );
};

export default Drip;