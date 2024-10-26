import React, { useState, useRef, useEffect } from 'react';
import './DrugsAndDrips.css';
import drugsDataFile from './data/resus-drugs-definitions.json';
import DrugComponent from './Drug';

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
}

const Drugs: React.FC = () => {
  const drugsData: MedicationGuide = drugsDataFile;
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, drugsData.sections.length);
  }, [drugsData.sections]);

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const newState = {
        ...prev,
        [index]: !prev[index]
      };
      
      if (newState[index]) {
        setTimeout(() => {
          sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
      }
      
      return newState;
    });
  };

  if (!drugsData) return null;

  return (
    <div style={{ direction: 'ltr' }}>
      {drugsData.sections.map((section, sectionIndex) => (
        <div key={sectionIndex} ref={el => sectionRefs.current[sectionIndex] = el}>
          <h4 
            className="drugs-header" 
            onClick={() => toggleSection(sectionIndex)}
          >
            <span className="toggle-icon">
              {expandedSections[sectionIndex] ? '-' : '+'}
            </span>
            <span className="section-name">{section.name}</span>
          </h4>
          {expandedSections[sectionIndex] && (
            <div id="collapseable-area-drugs" className="collapseable">
              <ul className="list-group custom-list-group">
              {section.drugs.map((drugId, drugIndex) => {
                const drug = drugsData.drugs.find(d => d.id === drugId);
                if (!drug) return null;
                return (
                  <li className='list-group-item'>
                    <DrugComponent 
                      key={drugIndex} 
                      drug={drug} 
                    />
                  </li>
                );
              })}              
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Drugs;