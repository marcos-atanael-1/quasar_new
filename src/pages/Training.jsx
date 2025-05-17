import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CreateTrainingModal from '../components/CreateTrainingModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faPlus,
  faUsers,
  faStar,
  faEllipsisVertical,
  faFileUpload,
  faEdit,
  faTrash,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileImage,
  faFileVideo,
  faFileAlt,
  faLink,
  faDownload,
  faEye,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import './Training.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const APP_MODE = import.meta.env.VITE_APP_MODE;

// Mock data for DEV environment
const mockTrainings = [
  {
    id: 1,
    name: 'Introdução ao 5S',
    description: 'Fundamentos e princípios do programa 5S',
    image: 'https://i.ibb.co/TdnPT6v/icon-dashboard.png',
    participants: 24,
    lastUpdate: '15/06/2025',
    score: 4.5,
    documents: 5,
    status: 'active'
  },
  {
    id: 2,
    name: 'Auditoria 5S',
    description: 'Como realizar auditorias efetivas',
    image: 'https://i.ibb.co/DPRSYryh/icon-training.png',
    participants: 18,
    lastUpdate: '14/06/2025',
    score: 4.8,
    documents: 3,
    status: 'draft'
  },
  {
    id: 3,
    name: 'Gestão Visual',
    description: 'Implementação de controles visuais',
    image: 'https://i.ibb.co/TdnPT6v/icon-dashboard.png',
    participants: 32,
    lastUpdate: '13/06/2025',
    score: 4.2,
    documents: 7,
    status: 'active'
  }
];

const mockFiles = [
  {
    id: 1,
    name: 'Apresentação 5S.pdf',
    training: 'Introdução ao 5S',
    type: 'pdf',
    size: '2.4 MB',
    uploadedAt: '15/06/2025'
  },
  {
    id: 2,
    name: 'Manual do Programa.docx',
    training: 'Introdução ao 5S',
    type: 'doc',
    size: '1.8 MB',
    uploadedAt: '14/06/2025'
  },
  {
    id: 3,
    name: 'Planilha de Auditoria.xlsx',
    training: 'Auditoria 5S',
    type: 'excel',
    size: '512 KB',
    uploadedAt: '13/06/2025'
  },
  {
    id: 4,
    name: 'Vídeo Explicativo.mp4',
    training: 'Gestão Visual',
    type: 'video',
    size: '45.2 MB',
    uploadedAt: '12/06/2025'
  }
];

const Training = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('trainings');
  const [trainings, setTrainings] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (APP_MODE === 'PRD') {
          // Production mode - fetch from API
          const response = await fetch(`${API_URL}/api/trainings/`);
          if (!response.ok) {
            throw new Error('Erro ao buscar treinamentos');
          }
          const data = await response.json();
          setTrainings(data);
          
          // Fetch files from API
          const filesResponse = await fetch(`${API_URL}/api/trainings/files`);
          if (!filesResponse.ok) {
            throw new Error('Erro ao buscar arquivos');
          }
          const filesData = await filesResponse.json();
          setFiles(filesData);
        } else {
          // Development mode - use mock data
          setTrainings(mockTrainings);
          setFiles(mockFiles);
        }
      } catch (err) {
        console.error('Erro:', err);
        setError(err.message);
        // In DEV mode, still set mock data even if API call fails
        if (APP_MODE !== 'PRD') {
          setTrainings(mockTrainings);
          setFiles(mockFiles);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    navigate('/login');
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
      case 'png':
      case 'gif':
        return faFileImage;
      case 'mp4':
      case 'video':
        return faFileVideo;
      case 'link':
        return faLink;
      default:
        return faFileAlt;
    }
  };

  const filteredTrainings = searchTerm
    ? trainings.filter(training =>
        training.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : trainings;

  const filteredFiles = searchTerm
    ? files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.training.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : files;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-badge active';
      case 'draft':
        return 'status-badge draft';
      case 'archived':
        return 'status-badge archived';
      default:
        return 'status-badge';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'draft':
        return 'Rascunho';
      case 'archived':
        return 'Arquivado';
      default:
        return status;
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/training/${id}`);
  };

  const handleCreateTraining = async (formData) => {
    try {
      setLoading(true);
      
      if (APP_MODE === 'PRD') {
        // Production mode - send to API
        const form = new FormData();
        form.append('title', formData.title);
        form.append('description', formData.description);
        form.append('evaluation_type', formData.evaluationType);
        form.append('min_score', formData.minScore);
        if (formData.deadline) {
          form.append('deadline', formData.deadline);
        }
        if (formData.coverImage) {
          form.append('cover_image', formData.coverImage);
        }
        form.append('materials', JSON.stringify(formData.materials || []));
        form.append('questions', JSON.stringify(formData.questions || []));
        form.append('assigned_users', JSON.stringify(formData.assignedUsers || []));
        form.append('assigned_groups', JSON.stringify(formData.assignedGroups || []));

        const response = await fetch(`${API_URL}/api/trainings/`, {
          method: 'POST',
          body: form,
        });

        if (!response.ok) {
          throw new Error('Erro ao criar treinamento');
        }

        const updatedResponse = await fetch(`${API_URL}/api/trainings/`);
        const updatedData = await updatedResponse.json();
        setTrainings(updatedData);
      } else {
        // Development mode - simulate creation
        const newTraining = {
          id: trainings.length + 1,
          name: formData.title,
          description: formData.description,
          image: 'https://i.ibb.co/TdnPT6v/icon-dashboard.png',
          participants: 0,
          lastUpdate: new Date().toLocaleDateString(),
          score: 0,
          documents: 0,
          status: 'draft'
        };
        setTrainings([...trainings, newTraining]);
      }
      
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao criar treinamento:', err);
      alert(`Erro ao criar treinamento: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTraining = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este treinamento?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      if (APP_MODE === 'PRD') {
        // Production mode - delete from API
        const response = await fetch(`${API_URL}/api/trainings/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Erro ao excluir treinamento');
        }
      }
      
      // Update state in both modes
      setTrainings(trainings.filter(training => training.id !== id));
    } catch (err) {
      console.error('Erro ao excluir treinamento:', err);
      alert(`Erro ao excluir treinamento: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="training-container">
      <Header onLogout={handleLogout} />

      <main className="training-content">
        <div className="training-header">
          <div className="header-left">
            <h1 className="training-title">Treinamentos</h1>
            <p className="training-subtitle">Gerencie e acompanhe os treinamentos do programa 5S</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Pesquisar treinamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="create-training-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <FontAwesomeIcon icon={faPlus} />
              Novo Treinamento
            </button>
          </div>
        </div>

        <div className="content-tabs">
          <button
            className={`tab-button ${activeTab === 'trainings' ? 'active' : ''}`}
            onClick={() => setActiveTab('trainings')}
          >
            Treinamentos
          </button>
          <button
            className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            Arquivos
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
            <p>Carregando...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>Erro ao carregar dados: {error}</p>
          </div>
        ) : activeTab === 'trainings' ? (
          <div className="training-table-container">
            {trainings.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum treinamento encontrado.</p>
                <button 
                  className="create-training-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Criar Primeiro Treinamento
                </button>
              </div>
            ) : (
              <table className="training-table">
                <thead>
                  <tr>
                    <th>Treinamento</th>
                    <th>Status</th>
                    <th>Participantes</th>
                    <th>Última Atualização</th>
                    <th>Avaliação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrainings.map(training => (
                    <tr key={training.id}>
                      <td>
                        <div className="training-name-cell">
                          <img
                            src={training.image || 'https://i.ibb.co/TdnPT6v/icon-dashboard.png'}
                            alt={training.name}
                            className="training-icon"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://i.ibb.co/TdnPT6v/icon-dashboard.png';
                            }}
                          />
                          <div className="training-name-info">
                            <span className="training-name">{training.name}</span>
                            <span className="training-description">{training.description}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(training.status)}>
                          {getStatusText(training.status)}
                        </span>
                      </td>
                      <td>
                        <div className="participants-cell">
                          <FontAwesomeIcon icon={faUsers} className="participants-icon" />
                          <span>{training.participants}</span>
                        </div>
                      </td>
                      <td>{training.lastUpdate}</td>
                      <td>
                        <div className="score-cell">
                          <FontAwesomeIcon icon={faStar} className="star-icon" />
                          <span>{training.score}</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-cell">
                          <button 
                            className="view-button"
                            onClick={() => handleViewDetails(training.id)}
                          >
                            Ver Detalhes
                          </button>
                          <button 
                            className="action-button" 
                            title="Excluir"
                            onClick={() => handleDeleteTraining(training.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="files-table-container">
            {files.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum arquivo encontrado.</p>
              </div>
            ) : (
              <table className="files-table">
                <thead>
                  <tr>
                    <th>Arquivo</th>
                    <th>Treinamento</th>
                    <th>Tamanho</th>
                    <th>Data de Upload</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map(file => (
                    <tr key={file.id}>
                      <td>
                        <div className="file-name-cell">
                          <FontAwesomeIcon 
                            icon={getFileIcon(file.type)} 
                            className={`file-icon ${file.type}`}
                          />
                          <span className="file-name">{file.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="file-training">{file.training}</span>
                      </td>
                      <td>{file.size}</td>
                      <td>{file.uploadedAt}</td>
                      <td>
                        <div className="file-actions">
                          <button className="action-button" title="Visualizar" onClick={() => window.open(file.url, '_blank')}>
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="action-button" title="Download">
                            <FontAwesomeIcon icon={faDownload} />
                          </button>
                          <button className="action-button" title="Excluir">
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      <CreateTrainingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateTraining}
      />
    </div>
  );
};

export default Training;