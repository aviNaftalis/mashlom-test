import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useCPRLog } from './CPRLog';
import { loadCurrentState, saveCurrentState } from './CprState/storage';
import { cprEventEmitter, EVENTS } from './cprEvents';
import './VitalSigns.css';

interface VitalSigns {
  timestamp: string;
  heartRate: string;
  bloodPressure: string;
  saturation: string;
  etco2: string;
  glucose: string;
  temperature: string;
}

interface ValidationErrors {
  heartRate?: string;
  saturation?: string;
  temperature?: string;
}

const initialVitalSigns: VitalSigns = {
  timestamp: '',
  heartRate: '',
  bloodPressure: '',
  saturation: '',
  etco2: '',
  glucose: '',
  temperature: '',
};

const VitalSigns: React.FC = () => {
  const { addEntry } = useCPRLog();
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>(() => {
    const savedState = loadCurrentState();
    return savedState?.vitalSigns?.signs || [];
  });
  
  const [currentVitalSigns, setCurrentVitalSigns] = useState<VitalSigns>(initialVitalSigns);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    const unsubscribe = cprEventEmitter.subscribe(EVENTS.RESET_CPR, () => {
      setVitalSigns([]);
      setCurrentVitalSigns(initialVitalSigns);
      setValidationErrors({});
    });

    return () => unsubscribe();
  }, []);

  const isValidNumber = (value: string): boolean => {
    // Allow empty string
    if (!value) return true;
    
    // Allow only digits and at most one decimal point
    // This regex matches:
    // - Optional digits before decimal point
    // - Optional decimal point followed by at most one digit
    return /^\d*\.?\d{0,1}$/.test(value);
  };

  const validateField = (name: string, value: string): string | undefined => {
    if (!value) return undefined;

    // First check if it's a valid number format
    if (!isValidNumber(value)) {
      return `הזן ערך מספרי תקין`;
    }

    const numValue = parseFloat(value);
    
    // Now check the ranges
    switch (name) {
      case 'temperature':
        if (numValue < 0 || numValue > 50) return `הזן ערך בטווח 0-50`;
        break;
      case 'heartRate':
        if (numValue < 0 || numValue > 220) return `הזן ערך בטווח 0-220`;
        break;
      case 'saturation':
        if (numValue < 0 || numValue > 100) return `הזן ערך בטווח 0-100`;
        break;
    }
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'bloodPressure') {
      const formattedValue = formatBloodPressure(value);
      setCurrentVitalSigns(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setCurrentVitalSigns(prev => ({ ...prev, [name]: value }));
      const error = validateField(name, value);
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const formatBloodPressure = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 2) return digits;
    
    let formattedValue = '';
    if (digits[0] === '1' || digits[0] === '2') {
      formattedValue = digits.slice(0, 3) + '/';
      if (digits.length > 3) {
        formattedValue += digits.slice(3, 5);
      }
    } else {
      formattedValue = digits.slice(0, 2) + '/';
      if (digits.length > 2) {
        formattedValue += digits.slice(2, 4);
      }
    }
    
    return formattedValue;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all values are empty
    const hasAnyValue = Object.values(currentVitalSigns).some(value => 
      value !== '' && value !== initialVitalSigns.timestamp
    );

    if (!hasAnyValue) {
      return; // Don't submit if all fields are empty
    }

    // Update validation errors but don't prevent submission
    const errors: ValidationErrors = {};
    if (currentVitalSigns.temperature) {
      errors.temperature = validateField('temperature', currentVitalSigns.temperature);
    }
    if (currentVitalSigns.heartRate) {
      errors.heartRate = validateField('heartRate', currentVitalSigns.heartRate);
    }
    if (currentVitalSigns.saturation) {
      errors.saturation = validateField('saturation', currentVitalSigns.saturation);
    }
    setValidationErrors(errors);

    const newVitalSigns = {
      ...currentVitalSigns,
      timestamp: new Date().toISOString(),
    };
    
    // Update local state
    const updatedSigns = [...vitalSigns, newVitalSigns];
    setVitalSigns(updatedSigns);
    
    // Save to storage
    saveCurrentState({
      vitalSigns: {
        signs: updatedSigns
      }
    }, 'vitalSigns');

    const logEntries: string[] = [];
    if (newVitalSigns.heartRate) logEntries.push(`דופק: ${newVitalSigns.heartRate} BPM`);
    if (newVitalSigns.bloodPressure) logEntries.push(`לחץ דם: ${newVitalSigns.bloodPressure}`);
    if (newVitalSigns.saturation) logEntries.push(`סטורציה: ${newVitalSigns.saturation}%`);
    if (newVitalSigns.etco2) logEntries.push(`ETCo2: ${newVitalSigns.etco2}`);
    if (newVitalSigns.glucose) logEntries.push(`סוכר: ${newVitalSigns.glucose} mg/dl`);
    if (newVitalSigns.temperature) logEntries.push(`חום: ${newVitalSigns.temperature} °C`);

    addEntry({
      timestamp: newVitalSigns.timestamp,
      text: `בדיקת מדדים: ${logEntries.join(', ')}`,
      type: 'action',
      isImportant: false,
    });

    setCurrentVitalSigns(initialVitalSigns);
    setValidationErrors({});
  };

  const renderVitalSignsHistory = (signs: VitalSigns) => {
    const entries = [
      { label: 'דופק', value: signs.heartRate, unit: 'BPM' },
      { label: 'לחץ דם', value: signs.bloodPressure, unit: '' },
      { label: 'סטורציה', value: signs.saturation, unit: '%' },
      { label: 'ETCo2', value: signs.etco2, unit: '' },
      { label: 'סוכר', value: signs.glucose, unit: 'mg/dl' },
      { label: 'חום', value: signs.temperature, unit: '°C' },
    ].filter(entry => entry.value);

    return (
      <div className="vital-signs-entry" key={signs.timestamp}>
        <p className="timestamp"><strong>{new Date(signs.timestamp).toLocaleTimeString('he-IL')}</strong></p>
        <div className="vital-signs-grid">
          {entries.map((entry) => (
            <p key={`${signs.timestamp}-${entry.label}`}>{entry.label}: {entry.value} {entry.unit}</p>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="vital-signs">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="heartRate">דופק (BPM):</label>
          <div className="input-with-validation">
            <input
              type="text"
              id="heartRate"
              name="heartRate"
              value={currentVitalSigns.heartRate}
              onChange={handleInputChange}
            />
            {validationErrors.heartRate && (
              <div className="validation-error">{validationErrors.heartRate}</div>
            )}
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="bloodPressure">לחץ דם:</label>
          <input
            type="text"
            id="bloodPressure"
            name="bloodPressure"
            value={currentVitalSigns.bloodPressure}
            onChange={handleInputChange}
          />
        </div>
        <div className="input-group">
          <label htmlFor="saturation">סטורציה (%):</label>
          <div className="input-with-validation">
            <input
              type="text"
              id="saturation"
              name="saturation"
              value={currentVitalSigns.saturation}
              onChange={handleInputChange}
            />
            {validationErrors.saturation && (
              <div className="validation-error">{validationErrors.saturation}</div>
            )}
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="etco2">ETCo2:</label>
          <input
            type="text"
            id="etco2"
            name="etco2"
            value={currentVitalSigns.etco2}
            onChange={handleInputChange}
          />
        </div>
        <div className="input-group">
          <label htmlFor="glucose">סוכר (mg/dl):</label>
          <input
            type="text"
            id="glucose"
            name="glucose"
            value={currentVitalSigns.glucose}
            onChange={handleInputChange}
          />
        </div>
        <div className="input-group">
          <label htmlFor="temperature">חום (°C):</label>
          <div className="input-with-validation">
            <input
              type="text"
              id="temperature"
              name="temperature"
              value={currentVitalSigns.temperature}
              onChange={handleInputChange}
            />
            {validationErrors.temperature && (
              <div className="validation-error">{validationErrors.temperature}</div>
            )}
          </div>
        </div>
        <div className="button-container">
          <button type="submit">
            <FontAwesomeIcon icon={faPlus} /> הוסף מדדים
          </button>
        </div>
      </form>
      {vitalSigns.length > 0 && <div className="vital-signs-history">
        <h4>היסטוריית מדדים</h4>
        {[...vitalSigns].reverse().map((signs) => renderVitalSignsHistory(signs))}
      </div>}
    </div>
  );
};

export default VitalSigns;