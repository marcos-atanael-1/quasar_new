import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faLock,
  faWifi,
  faCheckCircle,
  faCircle,
  faEllipsisH,
  faClipboardCheck,
  faChartPie
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import axios from 'axios';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL;
const APP_MODE = import.meta.env.VITE_APP_MODE;

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberMe') === 'true' ? localStorage.getItem('username') : '';
    if (savedUsername) {
      setCredentials(prev => ({
        ...prev,
        username: savedUsername,
        rememberMe: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials({
      ...credentials,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Development mode login
    if (APP_MODE === 'DEV') {
      if (credentials.username === 'quasar' && credentials.password === '12345') {
        const mockUserData = {
          id: 1,
          username: credentials.username,
          email: 'dev@example.com',
          first_name: 'Dev',
          last_name: 'User',
          role_id: 1,
          company_id: 1,
          avatar_url: null,
          token: 'dev-token'
        };

        localStorage.setItem('loggedUser', JSON.stringify(mockUserData));

        if (credentials.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('username', credentials.username);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('username');
        }

        navigate('/home');
        return;
      } else {
        setMessage('Credenciais inválidas. Em modo DEV, use: quasar/12345');
        return;
      }
    }

    // Production mode login
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username: credentials.username,
        password: credentials.password,
      });

      const userData = response.data;

      localStorage.setItem(
        'loggedUser',
        JSON.stringify({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          roleId: userData.role_id,
          companyId: userData.company_id,
          avatarUrl: userData.avatar_url,
          token: userData.token,
        })
      );

      if (credentials.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('username', credentials.username);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('username');
      }

      navigate('/home');
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-form-container">
          <div className="login-form-wrapper">
            <div className="login-header">
              <Link to="/" className="login-logo">QUASAR</Link>
              <LanguageSelector />
            </div>
            
            <h2 className="login-title">{t('welcome')}</h2>
            <p className="login-subtitle">{t('accessSystem')}</p>
            
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  {t('username')}
                </label>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faUser} className="input-icon" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-input"
                    placeholder={t('username')}
                    value={credentials.username}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <div className="password-header">
                  <label htmlFor="password" className="form-label">
                    {t('password')}
                  </label>
                  <a href="#" className="forgot-password">
                    {t('forgot')}
                  </a>
                </div>
                <div className="input-with-icon">
                  <FontAwesomeIcon icon={faLock} className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-input"
                    placeholder={t('password')}
                    value={credentials.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="form-group-checkbox">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={credentials.rememberMe}
                  onChange={handleChange}
                  className="form-checkbox"
                />
                <label htmlFor="rememberMe" className="checkbox-label">
                  {t('rememberMe')}
                </label>
              </div>
              
              <button type="submit" className="login-button">
                {t('enter')}
              </button>

              {message && (
                <div className="login-footer" style={{ color: '#dc2626' }}>
                  {message}
                </div>
              )}
            </form>
            
            <div className="login-footer">
              {t('authorizedOnly')}
            </div>
          </div>
        </div>
        
        <div className="login-illustration">
          <div className="app-mockup">
            <div className="app-header">
              <div className="app-logo">QUASAR</div>
              <div className="app-status-icons">
                <FontAwesomeIcon icon={faWifi} />
              </div>
            </div>
            
            <div className="app-content">
              <div className="app-title-bar">
                <div className="app-title">Auditoria 5S</div>
                <div className="app-time">14:25</div>
              </div>
              
              <div className="app-card">
                <div className="card-header">
                  <div className="card-title">Visão Geral</div>
                  <FontAwesomeIcon icon={faEllipsisH} />
                </div>
                
                <div className="dashboard-metrics">
                  <div className="metric-card">
                    <div className="metric-label">{t('metrics.score')}</div>
                    <div className="metric-value">87%</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">{t('metrics.actions')}</div>
                    <div className="metric-value">12</div>
                  </div>
                </div>
              </div>
              
              <div className="app-card checklist-preview">
                <div className="card-title">{t('Checklist Recente')}</div>
                <div className="checklist-items">
                  <div className="checklist-item completed">
                    <div className="check-icon">
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                    <div className="checklist-text">Organização</div>
                  </div>
                  <div className="checklist-item completed">
                    <div className="check-icon">
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                    <div className="checklist-text">Sistematização</div>
                  </div>
                  <div className="checklist-item">
                    <div className="circle-icon">
                      <FontAwesomeIcon icon={faCircle} />
                    </div>
                    <div className="checklist-text">Limpeza</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="floating-icon clipboard">
            <FontAwesomeIcon icon={faClipboardCheck} />
          </div>
          <div className="floating-icon chart">
            <FontAwesomeIcon icon={faChartPie} />
          </div>
        </div>
      </div>
      
      <footer className="login-page-footer">
        <div>Powered by Quasar© 2025</div>
        <div>
          <a href="#" className="genspark-link">
            {t('footer')}
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Login;