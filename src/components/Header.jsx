import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faBell } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import './Header.css';

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const handleLogoClick = () => {
    navigate('/home');
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>QUASAR</h1>
          <nav className="main-nav">
            <a 
              href="#" 
              className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/home');
              }}
            >
              {t('inicio')}
            </a>
            <a 
              href="#" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/dashboard');
              }}
            >
              {t('dashboard')}
            </a>
            <a 
              href="#" 
              className={`nav-link ${location.pathname === '/training' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/training');
              }}
            >
              {t('Treinamentos')}
            </a>
            <a 
              href="#" 
              className={`nav-link ${location.pathname === '/checklists' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/checklists');
              }}
            >
              {t('checklists')}
            </a>
            <a 
              href="#" 
              className={`nav-link ${location.pathname === '/planos' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/planos');
              }}
            >
              {t('actionPlans')}
            </a>
            <a 
              href="#" 
              className={`nav-link ${location.pathname === '/areas' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/areas');
              }}
            >
              Áreas
            </a>
            <a 
              href="#" 
              className={`nav-link ${location.pathname === '/analistas' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/analistas');
              }}
            >
              Analistas
            </a>
            <a 
              href="#" 
              className={`nav-link ${location.pathname === '/relatorios' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('/relatorios');
              }}
            >
              {t('reports')}
            </a>
          </nav>
        </div>
        <div className="header-right">
          <LanguageSelector />
          <button className="icon-button">
            <FontAwesomeIcon icon={faBell} />
          </button>
          <button className="profile-button" onClick={onLogout}>
            <FontAwesomeIcon icon={faUserCircle} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;