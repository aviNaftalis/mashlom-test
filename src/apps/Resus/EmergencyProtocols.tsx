import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import drugsDefinitions from './data/resus-drugs-definitions.json';
import emergencyProtocols from './data/emergency-protocols.json';
import './EmergencyProtocols.css';
import Defibrillator from './Defibrillator';
import { useResusContext } from './ResusContext';
import { FaFilePdf } from 'react-icons/fa6';
import { FaDiagramProject } from 'react-icons/fa6';
import Drug from './Drug';
import Drip from './Drip';

interface ProtocolData {
  id: string;
  name: string;
  algorithmFile?: string;
  protocolFile?: string;
}

const EmergencyProtocols: React.FC = () => {  
  const [protocolDrugs, setProtocolDrugs] = useState<string[]>([]);
  const [protocolDrips, setProtocolDrips] = useState<string[]>([]);
  const [defiConfigs, setDefiConfigs] = useState<any[]>([]);
  const { protocol, weight } = useResusContext();
  const [algorithmFile, setAlgorithmFile] = useState<string>('');
  const [protocolFile, setProtocolFile] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!weight || !protocol) {
      return;
    }

    const selectedProtocol = drugsDefinitions.protocols.find(p => p.protocolId === protocol);
    if (selectedProtocol) {
      setProtocolDrugs(selectedProtocol.drugs || []);
      setProtocolDrips(selectedProtocol.drips || []);
      setDefiConfigs(selectedProtocol.defi || []);
    } else {
      setProtocolDrugs([]);
      setProtocolDrips([]);
      setDefiConfigs([]);
    }

    const foundProtocol = (emergencyProtocols.emergencyProtocols as { protocols: ProtocolData[] }[])
      .flatMap(section => section.protocols)
      .find(p => p.id === protocol);

    if (foundProtocol) {
      setAlgorithmFile(foundProtocol.algorithmFile || '');
      setProtocolFile(foundProtocol.protocolFile || '');
    } else {
      setAlgorithmFile('');
      setProtocolFile('');
    }
  }, [protocol, weight, navigate, location.search]);

  if (!protocol || !weight) {
    return null;
  }

  const hasDrugsOrDrips = protocolDrugs.length > 0 || protocolDrips.length > 0;

  return (
    <div>
      <div className="protocol-section">
        <h2 className="protocol-header">קבצים מצורפים</h2>
        <div className="protocol-body">
          <div className="pdf-links">
          {algorithmFile && (
            <a href={`/assets/emek/protocols/${algorithmFile}`} target="_blank" rel="noopener noreferrer" className="pdf-link">
              <FaDiagramProject style={{fontSize: "3rem", color: "#1FB5A3"}}/>
              <span>אלגוריתם</span>
            </a>
          )}
          {protocolFile && (
            <a href={`/assets/emek/protocols/${protocolFile}`} target="_blank" rel="noopener noreferrer" className="pdf-link">
              <FaFilePdf style={{fontSize: "3rem", color: "#1FB5A3"}} />
              <span>פרוטוקול</span>
            </a>
          )}
          </div>
        </div>
      </div>

      {hasDrugsOrDrips && (
        <div className="protocol-section">
          <h2 className="protocol-header">תרופות</h2>
          <div className="protocol-body">
            <ul className="list-group" style={{direction:"ltr"}}>
              {protocolDrugs.map((drugId) => {
                const drug = drugsDefinitions.drugs.find(d => d.id === drugId);
                return drug ?
                  <li className='list-group-item'>
                    <Drug key={drug.id} drug={drug} /> 
                  </li>: null;
              })}
              {protocolDrips.map((dripId) => {
                const drip = drugsDefinitions.drips.find(d => d.id === dripId);
                return drip ?                 
                  <li className="list-group-item">
                    <Drip key={drip.id} drip={drip} /> 
                  </li> : null;
              })}
            </ul>
          </div>
        </div>
      )}

      {defiConfigs.length > 0 && (
        <div className="protocol-section">
          <h2 className="protocol-header">Defibrillator (מַפְעֵם)</h2>
          <div className="protocol-body">
            <Defibrillator configs={defiConfigs} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyProtocols;