import React, { useState, useEffect, useRef } from 'react';
import drugsDefinitions from './data/resus-drugs-definitions.json';
import DripComponent from './Drip';

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

const Drips: React.FC = () => {
  const [dripsExpanded, setDripsExpanded] = useState(false);
  const [dripsDefinitions, setDripsDefinitions] = useState<Drip[]>([]);
  const dripsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDripsDefinitions(drugsDefinitions.drips as Drip[]);
  }, []);

  useEffect(() => {
    if (dripsExpanded && dripsRef.current) {
      setTimeout(() => {
        dripsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [dripsExpanded]);

  const toggleDrips = () => setDripsExpanded(!dripsExpanded);

  return (
    <div ref={dripsRef} style={{ direction: 'ltr', marginTop: '0px'}}>
      <h4 className="drugs-header" onClick={toggleDrips}>
        <span className="toggle-icon">
          {dripsExpanded ? '-' : '+'}
        </span>
        <span className="section-name">Drips</span>
      </h4>
      {dripsExpanded && (
        <div id="collapseable-area-drips" className="collapseable">
          <ul className="list-group">
            {dripsDefinitions.map((drip) => (
              <li className="list-group-item">
                <DripComponent key={drip.id} drip={drip} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Drips;