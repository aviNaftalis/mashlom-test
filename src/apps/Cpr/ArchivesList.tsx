import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { loadArchivedCPRs, restoreArchivedCPR, clearHistory } from './CprState/storage';
import { cprEventEmitter, EVENTS } from './cprEvents';
import emergencyProtocols from '../Resus/data/emergency-protocols.json';

interface Protocol {
  name: string;
  id: string;
  algorithmFile?: string;
  protocolFile?: string;
}

interface ProtocolSection {
  section: string;
  protocols: Protocol[];
}

interface EmergencyProtocols {
  emergencyProtocols: ProtocolSection[];
}

export const getFormattedAge = (age: string): string => {
  if (age === "0 month") return "בן יומו";
  if (age === "1 month") return "חודש";
  if (age === "2 month") return "חודשיים";
  if (age === "1 year") return "שנה";
  if (age === "2 year") return "שנתיים";
  return age.replace("month", "חודשים").replace("year", "שנים");
};

export const getProtocolName = (protocolId: string): string => {
  const protocol = (emergencyProtocols as EmergencyProtocols).emergencyProtocols
    .flatMap((section): Protocol[] => section.protocols)
    .find((p): p is Protocol => p.id === protocolId);
  return protocol ? protocol.name : protocolId;
};

interface ArchivesListProps {
  onClose: () => void;
}

const ArchivesList: React.FC<ArchivesListProps> = ({ onClose }) => {
  const [archives, setArchives] = useState<any[]>([]);

  useEffect(() => {
    setArchives(loadArchivedCPRs());

    const unsubscribe = cprEventEmitter.subscribe(EVENTS.RESET_CPR, () => {
      // Remove the archive parameter but maintain the hash
      const newUrl = new URL(window.location.href);
      const hash = newUrl.hash.split('?')[0];
      newUrl.hash = hash;
      window.history.pushState({}, '', newUrl.toString());
    });

    return () => unsubscribe();
  }, []);

  const handleArchiveClick = (archiveId: string) => {
    restoreArchivedCPR(archiveId);
    
    // Update URL maintaining the hash router format and reload
    const newUrl = new URL(window.location.href);
    const baseHash = newUrl.hash.split('?')[0];
    newUrl.hash = `${baseHash}${baseHash.includes('?') ? '&' : '?'}archive=${archiveId}`;
    window.history.pushState({}, '', newUrl.toString());
    window.location.reload();
  };

  const handleClearHistory = () => {
    clearHistory();
    onClose();
  };

  const getOutcomeText = (archive: any) => {
    if (!archive.outcome) return '';
    return archive.outcome === 'ROSC' ? '(הסתיים בהצלחה)' : '(מוות)';
  };

  return (
    <div className="archives-overlay">
      <div className="archives-modal">
        <div className="archives-header">
          <h3>החייאות קודמות</h3>
          <button onClick={onClose} className="close-button">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="archives-list">
          {archives.map((archive) => (
            <div 
              key={archive.id} 
              className="archive-item"
              onClick={() => handleArchiveClick(archive.id)}
            >
                  <span>החייאה מתאריך: {new Date(archive.archivedAt).toLocaleString('he-IL')}</span>
                  <div className="archive-details">
                      {archive.resusContext && (<div>
                          {archive.resusContext.age && <span>גיל: {getFormattedAge(archive.resusContext.age)}</span>}
                          {archive.resusContext.weight && <span>משקל: {archive.resusContext.weight} ק"ג</span>}
                          {archive.resusContext.protocol && (
                              <span>פרוטוקול: {getProtocolName(archive.resusContext.protocol)}</span>
                          )}
                      </div>)}
                      {archive.outcome && <span>{getOutcomeText(archive)}</span>}
                  </div>
              </div>
          ))}
          {archives.length === 0 && (
            <div className="no-archives">אין החייאות קודמות</div>
          )}
        </div>
        {archives.length > 0 && (
          <div className="archives-footer">
            <button onClick={handleClearHistory} className="clear-history-button">
              נקה היסטוריה
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivesList;