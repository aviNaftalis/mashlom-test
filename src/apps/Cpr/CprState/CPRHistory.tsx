import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loadArchivedCPRs, ArchivedCPR } from './storage';

export const CPRHistory: React.FC = () => {
  const navigate = useNavigate();
  const archivedCPRs = loadArchivedCPRs();

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('he-IL', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="cpr-history">
      <h2>היסטוריית החייאות</h2>
      <div className="archived-cprs">
        {archivedCPRs.map((cpr: ArchivedCPR) => (
          <div 
            key={cpr.id}
            className="archived-cpr-item"
            onClick={() => navigate(`/?archive=${cpr.id}`)}
          >
            <div>תאריך: {formatDate(cpr.startTime)}</div>
            <div>סטטוס: {cpr.status === 'DEATH' ? 'מוות' : 'החייאה מוצלחת'}</div>
            <div>משך: {Math.floor((new Date(cpr.endTime).getTime() - new Date(cpr.startTime).getTime()) / 1000 / 60)} דקות</div>
          </div>
        ))}
      </div>
    </div>
  );
};