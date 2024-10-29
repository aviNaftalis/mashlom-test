import React, { useState, useEffect } from 'react';
import { useCPRLog } from './CPRLog';
import airwaysData from '../Resus/data/airways.json';
import { useResusContext } from '../Resus/ResusContext';
import { loadCurrentState, saveCurrentState } from './CprState/storage';
import AirwaysRecommendedValues from './AirwaysRecommendedValues';
import './Airways.css';

interface AirwaysData {
  airwayType: 'טובוס' | 'טובוס עם בלונית' | 'LMA' | null;
  airwaySize: string;
  hasAmbu: boolean;
  hasChestDrain: boolean;
  chestDrainSize: string;
  hasSurgicalAirway: boolean;
}

interface RecommendedValues {
  blade: number;
  cuffedETT: number;
  ETT: number;
  lma: number;
}

const Airways: React.FC = () => {
  const { addEntry } = useCPRLog();
  const { age, weight } = useResusContext();
  const [recommendedValues, setRecommendedValues] = useState<RecommendedValues>({} as RecommendedValues);
  const [data, setData] = useState<AirwaysData>(() => {
    // Initialize state from storage or default values
    const savedState = loadCurrentState();
    return savedState?.airways || {
      airwayType: null,
      airwaySize: '',
      hasAmbu: false,
      hasChestDrain: false,
      chestDrainSize: '',
      hasSurgicalAirway: false
    };
  });

  // Get recommended values when age changes
  useEffect(() => {
    if (age && airwaysData.dataByAge) {
      const currData = airwaysData.dataByAge.find((data: any) => data.age === age);
      if (currData) {
        setRecommendedValues(currData);
      }
    }
  }, [age]);

  // Get chest tube size range based on weight
  const getChestTubeSize = (weight: number): string => {
    if (weight < 5) return "8-12";
    if (weight <= 10) return "10-14";
    if (weight <= 15) return "14-20";
    if (weight <= 20) return "20-24";
    if (weight <= 30) return "20-28";
    if (weight <= 50) return "28-40";
    return "32-40";
  };

  // Calculate average of range (e.g., "8-12" → 10)
  const getAverageFromRange = (range: string): string => {
    const [min, max] = range.split('-').map(Number);
    return String(Math.round((min + max) / 2));
  };

  // Set default size when airway type changes
  const handleAirwayTypeChange = (type: AirwaysData['airwayType']) => {
    let defaultSize = '';
    if (type === 'טובוס') {
      defaultSize = String(recommendedValues.ETT || '');
    } else if (type === 'טובוס עם בלונית') {
      defaultSize = String(recommendedValues.cuffedETT || '');
    } else if (type === 'LMA') {
      defaultSize = String(recommendedValues.lma || '');
    }
    
    setData(prev => ({
      ...prev,
      airwayType: type,
      airwaySize: defaultSize
    }));
  };

  // Set default chest drain size when checked
  const handleChestDrainChange = (checked: boolean) => {
    let defaultSize = '';
    if (checked && weight) {
      const sizeRange = getChestTubeSize(weight);
      defaultSize = getAverageFromRange(sizeRange);
    }
    
    setData(prev => ({
      ...prev,
      hasChestDrain: checked,
      chestDrainSize: defaultSize
    }));
  };

  const handleConfirm = () => {
    // Save airways data
    saveCurrentState({ airways: data }, 'airways');

    // Add log entries
    if (data.airwayType) {
      addEntry({
        timestamp: new Date().toISOString(),
        text: `חובר ${data.airwayType} בגודל ${data.airwaySize || '[לא הוזן]'}`,
        type: 'action',
        isImportant: false
      });
    }

    if (data.hasAmbu) {
      addEntry({
        timestamp: new Date().toISOString(),
        text: 'מטופל חובר לאמבו',
        type: 'action',
        isImportant: false
      });
    }

    if (data.hasChestDrain) {
      addEntry({
        timestamp: new Date().toISOString(),
        text: `חובר נקז חזה בגודל ${data.chestDrainSize || '[לא הוזן]'} fr`,
        type: 'action',
        isImportant: false
      });
    }

    if (data.hasSurgicalAirway) {
      addEntry({
        timestamp: new Date().toISOString(),
        text: 'נתיב אוויר כירורגי',
        type: 'action',
        isImportant: false
      });
    }

    // Close the section
    const toggleButton = document.querySelector('.section-header') as HTMLElement;
    if (toggleButton) {
      toggleButton.click();
    }
  };

  return (
    <div className="airways">
      <AirwaysRecommendedValues />
      
      <form>
        {/* Airway Type Section */}
        <div className="input-group full-width">
          <label>נתיב אוויר:</label>
          <div className="radio-options">
            <label className="radio-label">
              <input
                type="radio"
                name="airwayType"
                value="טובוס"
                checked={data.airwayType === 'טובוס'}
                onChange={(e) => handleAirwayTypeChange(e.target.value as 'טובוס')}
              />
              טובוס
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="airwayType"
                value="טובוס עם בלונית"
                checked={data.airwayType === 'טובוס עם בלונית'}
                onChange={(e) => handleAirwayTypeChange(e.target.value as 'טובוס עם בלונית')}
              />
              טובוס עם בלונית
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="airwayType"
                value="LMA"
                checked={data.airwayType === 'LMA'}
                onChange={(e) => handleAirwayTypeChange(e.target.value as 'LMA')}
              />
              LMA
            </label>
          </div>
        </div>

        {data.airwayType && (
          <div className="input-group indented narrow">
            <label>גודל:</label>
            <input
              type="number"
              value={data.airwaySize}
              onChange={(e) => setData(prev => ({ ...prev, airwaySize: e.target.value }))}
            />
          </div>
        )}

        {/* Ambu Section */}
        <div className="input-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={data.hasAmbu}
              onChange={(e) => setData(prev => ({ ...prev, hasAmbu: e.target.checked }))}
            />
            אמבו
          </label>
        </div>

        {/* Chest Drain Section */}
        <div className="input-group full-width">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={data.hasChestDrain}
              onChange={(e) => handleChestDrainChange(e.target.checked)}
            />
            נקז חזה
          </label>
        </div>

        {data.hasChestDrain && (
          <div className="input-group indented narrow">
            <label>גודל:</label>
            <input
              type="number"
              placeholder="גודל ב fr"
              value={data.chestDrainSize}
              onChange={(e) => setData(prev => ({ ...prev, chestDrainSize: e.target.value }))}
            />
          </div>
        )}

        {/* Surgical Airway Section */}
        <div className="input-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={data.hasSurgicalAirway}
              onChange={(e) => setData(prev => ({ ...prev, hasSurgicalAirway: e.target.checked }))}
            />
            נתיב אוויר כירורגי
          </label>
        </div>

        <div className="button-container">
          <button type="button" onClick={handleConfirm}>
            אישור
          </button>
        </div>
      </form>
    </div>
  );
};

export default Airways;