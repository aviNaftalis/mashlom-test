import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPills, faFileInvoice, faHeartPulse } from '@fortawesome/free-solid-svg-icons';
import './ResusFooterNav.css'

interface FooterNavProps {
  hospital: string;
}

const FooterNav: React.FC<FooterNavProps> = ({ hospital }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePanel, setActivePanel] = useState<string | null>(null);

  useEffect(() => {
    const panel = location.pathname.split('/').pop();
    setActivePanel(panel || null);
  }, [location]);

  const openPanel = (panel: 'meds' | 'protocols' | 'cpr') => {
    const currentSearchParams = new URLSearchParams(location.search);
    navigate(`/${hospital}/resus/${panel}?${currentSearchParams.toString()}`);
  };

  const isActive = (panel: string) => {
    return activePanel === panel ? 'active' : '';
  };

  return (
    <footer className="text-center text-white footer">
      <div className="footer-container">
        {['meds', 'protocols', 'cpr'].map((panel) => (
          <button 
            key={panel}
            className={`footer-button ${isActive(panel)}`} 
            onClick={() => openPanel(panel as 'meds' | 'protocols' | 'cpr')}
          >
            <div className="bottom-menu-color">
              <FontAwesomeIcon 
                icon={
                  panel === 'meds' ? faPills :
                  panel === 'protocols' ? faFileInvoice :
                  faHeartPulse
                } 
              />
            </div>
            <div className="text">
              {panel === 'meds' ? 'תרופות' :
               panel === 'protocols' ? 'פרוטוקולי חירום' :
               'החייאה'}
            </div>
          </button>
        ))}
      </div>
    </footer>
  );
};

export default FooterNav;