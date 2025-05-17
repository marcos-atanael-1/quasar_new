import React from 'react';
import './LandingPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClipboardCheck, 
  faCamera, 
  faTasks, 
  faChartLine,
  faSortAmountUp
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div className="home-container">
      <div className="network-bg"></div>
      
      <header className="home-header">
        <div className="header-container">
          <div className="logo" style={{ color: 'black' }}>QUASAR</div>
          <nav className="main-nav">
            <a href="#inicio" className="nav-item active" onClick={(e) => { e.preventDefault(); scrollToSection('inicio'); }}>
              {t('inicio')}
            </a>
            <a href="#features" className="nav-item" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>
              {t('sobreNos')}
            </a>
            <a href="#dashboard" className="nav-item" onClick={(e) => { e.preventDefault(); scrollToSection('dashboard'); }}>
              {t('sistemas')}
            </a>
            <a href="#footer" className="nav-item" onClick={(e) => { e.preventDefault(); scrollToSection('footer'); }}>
              {t('faleConosco')}
            </a>
            {!isMobile && (
              <a href="/login" className="nav-item" onClick={handleLoginClick}>
                {t('login')}
              </a>
            )}
            <LanguageSelector />
          </nav>
        </div>
      </header>

      <main className="home-content">
        <div className="content-container">
          <div id="inicio" className="title-section">
            <h1 className="main-title">
              <span className="purple-text">QUASAR</span>
            </h1>
            <h2 className="subtitle">{t('subtitle')} <span className="purple-text">5S</span></h2>
            <p className="description">{t('description')}</p>
          </div>
          
          <div id="features" className="features-section">
            <div className="feature-box">
              <div className="feature-header">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faClipboardCheck} />
                </div>
                <h3 className="feature-title">{t('checklistsTitle')}</h3>
              </div>
              <p className="feature-description">{t('checklistsDesc')}</p>
            </div>
            
            <div className="feature-box">
              <div className="feature-header">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faCamera} />
                </div>
                <h3 className="feature-title">{t('captureTitle')}</h3>
              </div>
              <p className="feature-description">{t('captureDesc')}</p>
            </div>
            
            <div className="feature-box">
              <div className="feature-header">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={faTasks} />
                </div>
                <h3 className="feature-title">{t('actionPlansTitle')}</h3>
              </div>
              <p className="feature-description">{t('actionPlansDesc')}</p>
            </div>
          </div>
          
          <div id="dashboard" className="dashboard-preview">
            <div className="preview-content">
              <h3 className="preview-title">{t('dashboardTitle')}</h3>
              <p className="preview-description">{t('dashboardDesc')}</p>
              <Link to="/login" className="cta-button">
                {t('exploreSystem')}
              </Link>
            </div>
            
            <div className="preview-image">
              <div className="dashboard-mockup">
                <div className="mockup-header">
                  <div className="window-controls">
                    <div className="control red"></div>
                    <div className="control yellow"></div>
                    <div className="control green"></div>
                  </div>
                  <div className="window-title">Dashboard 5S - Visão Geral</div>
                </div>
                
                <div className="mockup-content">
                  <div className="metric-cards">
                    <div className="metric-card">
                      <div className="metric-label">Pontuação</div>
                      <div className="metric-value">87%</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Ações</div>
                      <div className="metric-value">24</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Concluídas</div>
                      <div className="metric-value">18</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Pendentes</div>
                      <div className="metric-value">6</div>
                    </div>
                  </div>
                  
                  <div className="chart-placeholders">
                    <div className="chart-placeholder"></div>
                    <div className="chart-placeholder"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer id="footer" className="home-footer">
        <div className="footer-container">
          <div className="copyright">Powered by Quasar© 2025</div>
          <div className="footer-tagline">
            <span className="tagline-text">{t('footer')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;