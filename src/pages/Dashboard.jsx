import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faListCheck,
  faCircleCheck,
  faTriangleExclamation,
  faCalendarDays,
  faChevronRight,
  faSearch,
  faTools,
  faTag,
  faWrench,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30dias');
  const [recentActions, setRecentActions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('http://localhost:8000/api/dashboard/summary');
        setDashboardData(response.data);
        setRecentActions(response.data.planos_recentes || []);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        setError('Não foi possível carregar os dados do dashboard. Por favor, tente novamente mais tarde.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handlePeriodChange = async (period) => {
    setSelectedPeriod(period);
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:8000/api/dashboard/metrics/${period}`);
      // Atualizar apenas algumas métricas mantendo o resto dos dados
      setDashboardData(prevData => ({
        ...prevData,
        pontuacao_5s: response.data.pontuacao_5s,
        total_acoes: response.data.total_acoes,
        acoes_concluidas: response.data.acoes_concluidas,
      }));
      setLoading(false);
    } catch (error) {
      console.error(`Erro ao buscar dados para o período ${period}:`, error);
      setError(`Não foi possível carregar os dados para o período selecionado.`);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const getActionIcon = (description) => {
    if (!description) return faListCheck;
    
    const desc = description.toLowerCase();
    if (desc.includes('ferramentas')) return faTools;
    if (desc.includes('etiquetas')) return faTag;
    if (desc.includes('manutenção')) return faWrench;
    return faListCheck;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Header onLogout={handleLogout} />
        <main className="dashboard-content">
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} className="loading-icon fa-spin" />
            <p>Carregando dados do dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Header onLogout={handleLogout} />
        <main className="dashboard-content">
          <div className="error-container">
            <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
            <h3>Ocorreu um erro</h3>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header onLogout={handleLogout} />

      <main className="dashboard-content">
        <div className="page-title-section">
          <div className="title-group">
            <h1>Auditoria 5S</h1>
            <span className="date-info">Atualizado: {dashboardData?.ultima_atualizacao || '15/06/2025'}</span>
          </div>
        </div>
        
        <p className="subtitle">Acompanhamento de indicadores e planos de ação</p>

        <div className="filter-section">
          <button 
            className={`filter-button ${selectedPeriod === '30dias' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('30dias')}
          >
            <FontAwesomeIcon icon={faCalendarDays} />
            Últimos 30 dias
          </button>
          <button 
            className={`filter-button ${selectedPeriod === 'trimestre' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('trimestre')}
          >
            Este Trimestre
          </button>
          <button 
            className={`filter-button ${selectedPeriod === 'ano' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('ano')}
          >
            Este Ano
          </button>
          <button className="filter-button">
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        <div className="metrics-grid">
          {/* Pontuação 5S Card */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Pontuação 5S</span>
              <div className="metric-icon chart">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
            </div>
            <div className="metric-value percentage">{dashboardData?.pontuacao_5s || 87}</div>
            <div className="metric-trend">
              <span className="trend-value positive">3.2%</span>
              <span>vs. mês anterior</span>
            </div>
            <div className="metric-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${dashboardData?.pontuacao_5s || 87}%` }}></div>
              </div>
              <div className="progress-info">
                <span>Meta: 90%</span>
                <span>{dashboardData?.pontuacao_5s || 87}%</span>
              </div>
            </div>
          </div>

          {/* Total de Ações Card */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Total de Ações</span>
              <div className="metric-icon list">
                <FontAwesomeIcon icon={faListCheck} />
              </div>
            </div>
            <div className="metric-value">{dashboardData?.total_acoes || 24}</div>
            <div className="metric-trend">
              <span className="trend-value positive">{dashboardData?.acoes_novas_mes || 8}</span>
              <span>novas este mês</span>
            </div>
            <div className="metric-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-dot critical"></span>
                <span>{dashboardData?.acoes_criticas || 16} Críticas</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-dot improvement"></span>
                <span>{dashboardData?.acoes_melhorias || 8} Melhorias</span>
              </div>
            </div>
          </div>

          {/* Ações Concluídas Card */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Ações Concluídas</span>
              <div className="metric-icon check">
                <FontAwesomeIcon icon={faCircleCheck} />
              </div>
            </div>
            <div className="metric-value">{dashboardData?.acoes_concluidas || 18}</div>
            <div className="metric-trend">
              Taxa de conclusão: {dashboardData?.total_acoes > 0 
                ? Math.round((dashboardData?.acoes_concluidas / dashboardData?.total_acoes) * 100) 
                : 75}%
            </div>
            <div className="metric-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ 
                  width: `${dashboardData?.total_acoes > 0 
                    ? Math.round((dashboardData?.acoes_concluidas / dashboardData?.total_acoes) * 100)
                    : 75}%` 
                }}></div>
              </div>
              <div className="progress-info">
                <span>Progresso</span>
                <span>{dashboardData?.acoes_concluidas || 18}/{dashboardData?.total_acoes || 24}</span>
              </div>
            </div>
          </div>

          {/* Ações Pendentes Card */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-title">Ações Pendentes</span>
              <div className="metric-icon warning">
                <FontAwesomeIcon icon={faTriangleExclamation} />
              </div>
            </div>
            <div className="metric-value">{dashboardData?.acoes_pendentes || 6}</div>
            <div className="metric-trend">
              <span className="trend-value" style={{ color: '#ef4444' }}>{dashboardData?.acoes_atrasadas || 2}</span>
              <span>em atraso</span>
            </div>
            <div className="metric-breakdown">
              <div className="breakdown-item">{dashboardData?.acoes_em_andamento || 4} Em andamento</div>
              <div className="breakdown-item">{(dashboardData?.acoes_pendentes - dashboardData?.acoes_em_andamento - dashboardData?.acoes_atrasadas) || 2} Pendente</div>
              <div className="breakdown-item">{dashboardData?.acoes_atrasadas || 2} Atrasado</div>
            </div>
          </div>
        </div>

        <div className="charts-section">
          {/* Pontuação 5S por Área */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Pontuação 5S por Área</h3>
              <a href="#" className="chart-link">
                Ver detalhes <FontAwesomeIcon icon={faChevronRight} />
              </a>
            </div>
            <div className="area-scores">
              {dashboardData?.pontuacao_por_area?.length > 0 ? 
                dashboardData.pontuacao_por_area.map((area, index) => (
                  <div className="area-score" key={index}>
                    <span className="area-name">{area.area_name}</span>
                    <span className="area-value">{area.area_value}</span>
                  </div>
                )) : (
                  <>
                    <div className="area-score">
                      <span className="area-name">Produção</span>
                      <span className="area-value">92%</span>
                    </div>
                    <div className="area-score">
                      <span className="area-name">Estoque</span>
                      <span className="area-value">78%</span>
                    </div>
                    <div className="area-score">
                      <span className="area-name">Manutenção</span>
                      <span className="area-value">85%</span>
                    </div>
                    <div className="area-score">
                      <span className="area-name">Admin</span>
                      <span className="area-value">95%</span>
                    </div>
                    <div className="area-score">
                      <span className="area-name">Expedição</span>
                      <span className="area-value">82%</span>
                    </div>
                  </>
                )
              }
            </div>
          </div>

          {/* Status dos Planos de Ação */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Status dos Planos de Ação</h3>
              <a href="#" className="chart-link">
                Ver todos <FontAwesomeIcon icon={faChevronRight} />
              </a>
            </div>
            <div className="status-list">
              <div className="status-item">
                <div className="status-label">
                  <span className="status-dot completed"></span>
                  <span>Concluído</span>
                </div>
                <div className="status-count">
                  <span className="count-number">{dashboardData?.status_planos?.concluido?.count || 18}</span>
                  <span className="count-percentage">({dashboardData?.status_planos?.concluido?.percentage || 75}%)</span>
                </div>
              </div>
              <div className="status-item">
                <div className="status-label">
                  <span className="status-dot in-progress"></span>
                  <span>Em andamento</span>
                </div>
                <div className="status-count">
                  <span className="count-number">{dashboardData?.status_planos?.em_andamento?.count || 4}</span>
                  <span className="count-percentage">({dashboardData?.status_planos?.em_andamento?.percentage || 17}%)</span>
                </div>
              </div>
              <div className="status-item">
                <div className="status-label">
                  <span className="status-dot pending"></span>
                  <span>Pendente</span>
                </div>
                <div className="status-count">
                  <span className="count-number">{dashboardData?.status_planos?.pendente?.count || 2}</span>
                  <span className="count-percentage">({dashboardData?.status_planos?.pendente?.percentage || 8}%)</span>
                </div>
              </div>
              <div className="status-item">
                <div className="status-label">
                  <span className="status-dot delayed"></span>
                  <span>Em atraso</span>
                </div>
                <div className="status-count">
                  <span className="count-number">{dashboardData?.status_planos?.atrasado?.count || 2}</span>
                  <span className="count-percentage">({dashboardData?.status_planos?.atrasado?.percentage || 8}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Action Plans Section */}
        <div className="recent-actions-section">
          <div className="recent-actions-header">
            <div className="header-left">
              <FontAwesomeIcon icon={faListCheck} className="section-icon" />
              <h3>Planos de Ação Recentes</h3>
            </div>
            <div className="header-right">
              <div className="filter-buttons">
                <button className="filter-chip active">Todos</button>
                <button className="filter-chip">Críticos</button>
              </div>
              <div className="search-box">
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input type="text" placeholder="Buscar ação..." />
              </div>
            </div>
          </div>

          <div className="recent-actions-list">
            {recentActions?.length > 0 ? (
              recentActions.map((action, index) => (
                <div key={action.id || index} className="action-item">
                  <div className="action-icon">
                    <FontAwesomeIcon icon={getActionIcon(action.description)} />
                  </div>
                  <div className="action-info">
                    <div className="action-description">{action.description || "Sem descrição"}</div>
                    <div className="action-area">{action.area || "Área não definida"}</div>
                  </div>
                  <div className="action-responsible">
                    <div className="responsible-avatar" style={{ backgroundColor: `hsl(${(action.id || index) * 100}, 70%, 90%)` }}>
                      {action.responsible?.initials || "NA"}
                    </div>
                    <div className="responsible-name">{action.responsible?.name || "Não atribuído"}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Nenhum plano de ação recente encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;