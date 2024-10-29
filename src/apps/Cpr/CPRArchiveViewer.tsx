import React from 'react';
import { CPRState, CPRStateManager } from './CPRStateManager';

interface CPRArchiveViewerProps {
  onSelect: (state: CPRState) => void;
  onClose: () => void;
}

const CPRArchiveViewer: React.FC<CPRArchiveViewerProps> = ({ onSelect, onClose }) => {
  const archivedStates = CPRStateManager.getArchivedStates();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (state: CPRState) => {
    if (!state.endTime) return 'N/A';
    const start = new Date(state.startTime).getTime();
    const end = new Date(state.endTime).getTime();
    const minutes = Math.floor((end - start) / 60000);
    return `${minutes} דקות`;
  };

  return (
    <div className="archive-viewer">
      <h2>החייאות קודמות</h2>
      <div className="archived-states">
        {archivedStates.length === 0 ? (
          <p>אין החייאות קודמות</p>
        ) : (
          archivedStates.map((state) => (
            <div 
              key={state.id}
              className="archived-state-item"
              onClick={() => onSelect(state)}
            >
              <div className="state-time">
                {formatDate(state.startTime)}
              </div>
              <div className="state-details">
                <span className="duration">משך: {getDuration(state)}</span>
                <span className={`outcome ${state.outcome?.toLowerCase()}`}>
                  {state.outcome === 'ROSC' ? 'הצלחה' : 'מוות'}
                </span>
              </div>
              <div className="state-summary">
                אדרנלין: {state.managerState.adrenalineCount} | 
                שוקים: {state.managerState.shockCount}
              </div>
            </div>
          ))
        )}
      </div>
      <button onClick={onClose}>סגור</button>
    </div>
  );
};

export default CPRArchiveViewer;