import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faRobot,
  faTimes,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../contexts/LanguageContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [userName, setUserName] = useState('');
  const [showPulse, setShowPulse] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    setUserName(user.firstName || 'Usuário');

    const timer = setTimeout(() => {
      setShowPulse(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleChecklistsClick = () => {
    navigate('/checklists');
  };

  const handleTrainingClick = () => {
    navigate('/training');
  };

  const handleActionPlanClick = () => {
    navigate('/planos');
  };
  
  const handleAreasClick = () => {
    navigate('/areas');
  };
  
  const handleAnalistasClick = () => {
    navigate('/analistas');
  };

  const handleImageError = (e) => {
    e.target.src = 'https://i.ibb.co/hxHxstH1/icon-managers.png';
  };

  const handleAIAssistantClick = () => {
    setShowChat(!showChat);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Message sent:', message);
      setMessage('');
    }
  };

  const menuItems = [
    { id: 'dashboard', title: 'Dashboard', icon: 'https://i.ibb.co/TdnPT6v/icon-dashboard.png', onClick: handleDashboardClick },
    { id: 'training', title: 'Treinamentos', icon: 'https://i.ibb.co/DPRSYryh/icon-training.png', onClick: handleTrainingClick },
    { id: 'checklists', title: 'Checklists', icon: 'https://i.ibb.co/Vp3Y5fHY/icon-checklists.png', onClick: handleChecklistsClick },
    { id: 'action-plan', title: 'Plano de Ação', icon: 'https://i.ibb.co/J8nxF6B/icon-actionplan.png', onClick: handleActionPlanClick },
    { id: 'areas', title: 'Áreas', icon: 'https://i.ibb.co/hxHxstH1/icon-managers.png', onClick: handleAreasClick },
    { id: 'analysts', title: 'Analistas', icon: 'https://i.ibb.co/hxHxstH1/icon-managers.png', onClick: handleAnalistasClick },
    { id: 'reports', title: 'Relatórios', icon: 'https://i.ibb.co/hxHxstH1/icon-managers.png' },
    { id: 'analysis', title: 'Análises', icon: 'https://i.ibb.co/hxHxstH1/icon-managers.png' }
  ];

  const filteredMenuItems = searchTerm
    ? menuItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : menuItems;

  return (
    <div className="home-page">
      <Header onLogout={handleLogout} />

      <main className="app-main">
        <div className="top-section">
          <h1 className="welcome-title">Bem vindo(a), {userName}!</h1>
          
          <div className="search-container">
            <div className="search-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                className="main-search"
                placeholder="Pesquisar módulos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="menu-grid">
          {filteredMenuItems.map(item => (
            <div 
              key={item.id}
              className="menu-item"
              onClick={item.onClick}
              data-testid={`menu-item-${item.id}`}
            >
              <img 
                src={item.icon}
                alt={item.title}
                onError={handleImageError}
              />
              <span>{item.title}</span>
            </div>
          ))}
        </div>
      </main>

      <div className="ai-assistant" onClick={handleAIAssistantClick} title="Assistente Virtual">
        {showPulse && <div className="pulse-animation" />}
        <FontAwesomeIcon icon={faRobot} className="ai-assistant-icon" />
      </div>

      {showChat && (
        <div className="chat-interface">
          <div className="chat-header">
            <div className="chat-title">
              <FontAwesomeIcon icon={faRobot} />
              Assistente Virtual
            </div>
            <button className="close-chat" onClick={() => setShowChat(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="chat-messages">
            {/* Messages will be added here */}
          </div>
          <form className="chat-input-container" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chat-input"
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="send-message">
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Home;