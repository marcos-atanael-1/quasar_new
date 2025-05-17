import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faTimes,
  faCalendarAlt,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import './ActionPlans.css';

const ActionPlans = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('open');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const handleLogout = () => {
    navigate('/login');
  };

  const mockData = [
    {
      id: 1,
      checklist: 'Produção 2',
      question: 'Pergunta 1',
      answer: 'Sim',
      responsible: 'Não definido',
      dueDate: 'Não definido',
      createdAt: '28/01/2025',
      status: 'open'
    },
    {
      id: 2,
      checklist: 'Produção 2',
      question: 'Pergunta 1',
      answer: 'Sim',
      responsible: 'Não definido',
      dueDate: 'Não definido',
      createdAt: '28/01/2025',
      status: 'open'
    },
    {
      id: 3,
      checklist: 'Produção 2',
      question: 'Pergunta 1',
      answer: 'Sim',
      responsible: 'Quasar App',
      dueDate: 'Não definido',
      createdAt: '28/01/2025',
      status: 'open'
    }
  ];

  const mockResponsibles = [
    { id: 1, name: 'João Silva' },
    { id: 2, name: 'Maria Santos' },
    { id: 3, name: 'Pedro Oliveira' },
    { id: 4, name: 'Ana Costa' }
  ];

  const handleEditClick = (plan) => {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    // Handle save logic here
    setIsEditModalOpen(false);
    setEditingPlan(null);
  };

  const filteredData = mockData.filter(item => {
    const matchesSearch = Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesTab = activeTab === 'all' || item.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="action-plans-container">
      <Header onLogout={handleLogout} />

      <main className="action-plans-content">
        <div className="action-plans-header">
          <div className="header-left">
            <h1 className="action-plans-title">Planos de Ação</h1>
            <p className="action-plans-subtitle">Gerencie e acompanhe os planos de ação do programa 5S</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Pesquisar por pergunta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="tabs-section">
          <button
            className={`tab-button ${activeTab === 'open' ? 'active' : ''}`}
            onClick={() => setActiveTab('open')}
          >
            Aberto
          </button>
          <button
            className={`tab-button ${activeTab === 'inProgress' ? 'active' : ''}`}
            onClick={() => setActiveTab('inProgress')}
          >
            Andamento
          </button>
          <button
            className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Finalizados
          </button>
        </div>

        <div className="table-container">
          <table className="action-plans-table">
            <thead>
              <tr>
                <th>Checklist</th>
                <th>Pergunta</th>
                <th>Resposta</th>
                <th>Responsável</th>
                <th>Vencimento</th>
                <th>Data de Criação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td>{item.checklist}</td>
                  <td>{item.question}</td>
                  <td>{item.answer}</td>
                  <td>{item.responsible}</td>
                  <td>{item.dueDate}</td>
                  <td>{item.createdAt}</td>
                  <td>
                    <button 
                      className="view-button"
                      onClick={() => handleEditClick(item)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h2>Editar Plano de Ação</h2>
              <button 
                className="close-button"
                onClick={() => setIsEditModalOpen(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Pergunta:</label>
                <div className="readonly-field">{editingPlan?.question}</div>
              </div>

              <div className="form-group">
                <label>Resposta:</label>
                <div className="readonly-field">{editingPlan?.answer}</div>
              </div>

              <div className="form-group">
                <label>Responsável:</label>
                <div className="select-wrapper">
                  <FontAwesomeIcon icon={faUser} className="select-icon" />
                  <select className="form-select">
                    <option value="">Selecione um responsável</option>
                    {mockResponsibles.map(resp => (
                      <option key={resp.id} value={resp.id}>{resp.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Data de Vencimento:</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                  <input 
                    type="date" 
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                className="save-button"
                onClick={handleSave}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPlans;