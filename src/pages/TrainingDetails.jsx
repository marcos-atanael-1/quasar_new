import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faUsers,
  faStar,
  faCalendarDays,
  faFile,
  faDownload,
  faTrash,
  faEye,
  faSearch,
  faFileAlt,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileImage,
  faFileVideo,
  faLink,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import './TrainingDetails.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TrainingDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('content');
  const [searchTerm, setSearchTerm] = useState('');
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrainingDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/trainings/${id}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar detalhes do treinamento');
        }
        const data = await response.json();
        setTraining(data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar detalhes do treinamento:', err);
        setError(err.message);
        setLoading(false);
        // Se a API não estiver funcionando, usar dados mockados
        setTraining({
          id: id,
          name: 'Introdução ao 5S',
          description: 'Fundamentos e princípios do programa 5S para implementação efetiva na organização.',
          image: 'https://i.ibb.co/TdnPT6v/icon-dashboard.png',
          totalParticipants: 24,
          lastUpdate: '15/06/2025',
          score: 4.5,
          documents: [
            {
              id: 1,
              name: 'Apresentação 5S.pdf',
              size: '2.4 MB',
              uploadedAt: '14/06/2025',
              type: 'pdf',
              training: 'Introdução ao 5S'
            },
            {
              id: 2,
              name: 'Manual do Programa.pdf',
              size: '1.8 MB',
              uploadedAt: '13/06/2025',
              type: 'pdf',
              training: 'Introdução ao 5S'
            }
          ],
          participants: [
            {
              id: 1,
              name: 'João Silva',
              email: 'joao.silva@example.com',
              progress: 85
            },
            {
              id: 2,
              name: 'Maria Santos',
              email: 'maria.santos@example.com',
              progress: 60
            }
          ]
        });
      }
    };

    if (id) {
      fetchTrainingDetails();
    }
  }, [id]);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/training');
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return faFilePdf;
      case 'doc':
      case 'docx':
        return faFileWord;
      case 'xls':
      case 'xlsx':
        return faFileExcel;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'image':
        return faFileImage;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'video':
        return faFileVideo;
      case 'link':
        return faLink;
      default:
        return faFileAlt;
    }
  };

  const handleDocumentView = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleDocumentDownload = (url, name) => {
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (loading) {
    return (
      <div className="training-details-container">
        <Header onLogout={handleLogout} />
        <main className="training-details-content">
          <button className="back-button" onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Voltar
          </button>
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
            <p>Carregando detalhes do treinamento...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !training) {
    return (
      <div className="training-details-container">
        <Header onLogout={handleLogout} />
        <main className="training-details-content">
          <button className="back-button" onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Voltar
          </button>
          <div className="error-container">
            <p>Erro ao carregar detalhes do treinamento: {error || 'Treinamento não encontrado'}</p>
          </div>
        </main>
      </div>
    );
  }

  const filteredDocuments = (training.documents || []).filter(doc =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.training?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="training-details-container">
      <Header onLogout={handleLogout} />

      <main className="training-details-content">
        <button className="back-button" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Voltar
        </button>

        <div className="details-header">
          <div className="training-info">
            <img
              src={training.image || 'https://i.ibb.co/TdnPT6v/icon-dashboard.png'}
              alt={training.name}
              className="training-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://i.ibb.co/TdnPT6v/icon-dashboard.png';
              }}
            />
            <div className="training-header-info">
              <h1 className="training-header-title">{training.name}</h1>
              <p className="training-header-description">{training.description}</p>
              
              <div className="training-stats">
                <div className="stat-item">
                  <FontAwesomeIcon icon={faUsers} className="stat-icon" />
                  <span className="stat-label">Participantes:</span>
                  <span className="stat-value">{training.totalParticipants || 0}</span>
                </div>
                <div className="stat-item">
                  <FontAwesomeIcon icon={faStar} className="stat-icon" />
                  <span className="stat-label">Avaliação:</span>
                  <span className="stat-value">{training.score || 0}</span>
                </div>
                <div className="stat-item">
                  <FontAwesomeIcon icon={faCalendarDays} className="stat-icon" />
                  <span className="stat-label">Atualizado:</span>
                  <span className="stat-value">{training.lastUpdate || '-'}</span>
                </div>
                <div className="stat-item">
                  <FontAwesomeIcon icon={faFile} className="stat-icon" />
                  <span className="stat-label">Documentos:</span>
                  <span className="stat-value">{(training.documents || []).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="content-tabs">
          <button
            className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            Conteúdo
          </button>
          <button
            className={`tab-button ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            Participantes
          </button>
          <button
            className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            Arquivos
          </button>
        </div>

        <div className="content-section">
          {activeTab === 'content' && (
            <div className="documents-list">
              {(training.documents || []).length === 0 ? (
                <div className="empty-state">
                  <p>Nenhum documento disponível.</p>
                </div>
              ) : (
                (training.documents || []).map(doc => (
                  <div key={doc.id} className="document-item">
                    <FontAwesomeIcon icon={getFileIcon(doc.type)} className="document-icon" />
                    <div className="document-info">
                      <div className="document-name">{doc.name}</div>
                      <div className="document-meta">
                        {doc.size} • Enviado em {doc.uploadedAt}
                      </div>
                    </div>
                    <div className="document-actions">
                      <button 
                        className="document-button" 
                        title="Visualizar" 
                        onClick={() => handleDocumentView(doc.url)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button 
                        className="document-button" 
                        title="Download" 
                        onClick={() => handleDocumentDownload(doc.url, doc.name)}
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="participants-list">
              {(training.participants || []).length === 0 ? (
                <div className="empty-state">
                  <p>Nenhum participante registrado.</p>
                </div>
              ) : (
                (training.participants || []).map(participant => (
                  <div key={participant.id} className="participant-item">
                    <div className="participant-avatar">
                      {getInitials(participant.name)}
                    </div>
                    <div className="participant-info">
                      <div className="participant-name">{participant.name}</div>
                      <div className="participant-email">{participant.email}</div>
                    </div>
                    <div className="participant-progress">
                      <div className="progress-label">
                        <span>Progresso</span>
                        <span>{participant.progress || 0}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${participant.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="files-section">
              <div className="files-header">
                <div className="files-search">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Pesquisar arquivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="files-list">
                {filteredDocuments.length === 0 ? (
                  <div className="empty-state">
                    <p>Nenhum arquivo encontrado.</p>
                  </div>
                ) : (
                  filteredDocuments.map(doc => (
                    <div key={doc.id} className="file-item">
                      <FontAwesomeIcon icon={getFileIcon(doc.type)} className="file-icon" />
                      <div className="file-info">
                        <div className="file-name">{doc.name}</div>
                        <div className="file-meta">
                          <span className="file-training">{doc.training || training.name}</span>
                          <span className="file-details">
                            {doc.size} • Enviado em {doc.uploadedAt}
                          </span>
                        </div>
                      </div>
                      <div className="file-actions">
                        <button 
                          className="file-button" 
                          title="Visualizar"
                          onClick={() => handleDocumentView(doc.url)}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button 
                          className="file-button" 
                          title="Download"
                          onClick={() => handleDocumentDownload(doc.url, doc.name)}
                        >
                          <FontAwesomeIcon icon={faDownload} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrainingDetails;