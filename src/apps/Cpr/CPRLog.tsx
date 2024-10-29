import React, { useState, createContext, useContext, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import Image from '../../components/Image';
import EntryDialog from './EntryDialog';
import ExportButton from './CPRLogPDF';
import { loadCurrentState, saveCurrentState } from './CprState/storage';
import './CPRLog.css';

export interface LogEntry {
  id: string;
  timestamp: string;
  text: string;
  type: 'patientDetails' | 'medication' | 'action';
  isImportant: boolean;
}

export interface CPRLog {
  patientId: string;
  entries: LogEntry[];
}

interface CPRLogContextType {
  log: CPRLog;
  addEntry: (entry: Omit<LogEntry, 'id'>) => void;
  updateEntry: (id: string, updatedEntry: Partial<LogEntry>) => void;
  deleteEntry: (id: string) => void;
  clearAllEntries: () => void; 
}

const CPRLogContext = createContext<CPRLogContextType | undefined>(undefined);

export const CPRLogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [log, setLog] = useState<CPRLog>(() => {
    // Initialize from storage on mount
    const savedState = loadCurrentState();
    return savedState?.log || { patientId: '', entries: [] };
  });

  const addEntry = (entry: Omit<LogEntry, 'id'>) => {
    const newEntry = { ...entry, id: Date.now().toString() };
    const newLog = {
      ...log,
      entries: [...log.entries, newEntry]
    };
    
    // Update local state
    setLog(newLog);
    
    // Save to storage
    saveCurrentState({
      log: newLog
    }, 'log');
  };

  const updateEntry = (id: string, updatedEntry: Partial<LogEntry>) => {
    const newLog = {
      ...log,
      entries: log.entries.map(entry =>
        entry.id === id ? { ...entry, ...updatedEntry } : entry
      )
    };
    
    // Update local state
    setLog(newLog);
    
    // Save to storage
    saveCurrentState({
      log: newLog
    }, 'log');
  };

  const clearAllEntries = () => {
    const newLog = {
      ...log,
      entries: []
    };
    
    // Update local state
    setLog(newLog);
    
    // Save to storage
    saveCurrentState({
      log: newLog
    }, 'log');
  };

  const deleteEntry = (id: string) => {
    const newLog = {
      ...log,
      entries: log.entries.filter(entry => entry.id !== id)
    };
    
    // Update local state
    setLog(newLog);
    
    // Save to storage
    saveCurrentState({
      log: newLog
    }, 'log');
  };

  return (
    <CPRLogContext.Provider value={{ log, addEntry, updateEntry, deleteEntry, clearAllEntries }}>
      {children}
    </CPRLogContext.Provider>
  );
};

export const useCPRLog = () => {
  const context = useContext(CPRLogContext);
  if (context === undefined) {
    throw new Error('useCPRLog must be used within a CPRLogProvider');
  }
  return context;
};

const CPRLogComponent: React.FC = () => {
  const { log, addEntry, updateEntry, deleteEntry } = useCPRLog();
  const [dialogEntry, setDialogEntry] = useState<(LogEntry & { type: LogEntry['type'] }) | null>(null);
  const { hospital } = useParams<{
    hospital: string;
  }>();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const renderTable = (type: LogEntry['type'], title: string) => {
    const entries = log.entries.filter(entry => entry.type === type);

    return (
      <table className="cpr-log-table">
        <thead>
          <tr>
            <th colSpan={2}>
              <div className="table-header">
                <span>{title}</span>
                <button onClick={() => setDialogEntry({ id: '', timestamp: '', text: '', type, isImportant: false })}>
                  <FontAwesomeIcon icon={faCirclePlus} />
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry.id} className={index % 2 === 0 ? 'even' : 'odd'}>
              <td className="timestamp">{formatTime(entry.timestamp)}</td>
              <td>
                <div className="entry-content">
                  <span>
                    {entry.isImportant && <Image src="bullets/star.svg" alt="Important" className="important-icon" />}
                    {entry.text}
                  </span>
                  <div className="entry-actions">
                    <button onClick={() => setDialogEntry({...entry, type})}>
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => deleteEntry(entry.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="cpr-log-component">
      {renderTable('patientDetails', 'פרטי המטופל')}
      {renderTable('medication', 'תרופות שניתנו')}
      {renderTable('action', 'פעולות שנעשו')}

      <ExportButton entries={log.entries} hospital={hospital ? hospital: "apps"} />

      {dialogEntry && (
        <EntryDialog
          entry={dialogEntry.id ? dialogEntry : undefined}
          type={dialogEntry.type}
          onSave={(entry) => {
            if (dialogEntry.id) {
              updateEntry(dialogEntry.id, {...entry, type: dialogEntry.type});
            } else {
              addEntry({...entry, type: dialogEntry.type});
            }
            setDialogEntry(null);
          }}
          onClose={() => setDialogEntry(null)}
        />
      )}
    </div>
  );
};

export default CPRLogComponent;