import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import './VisualizarRespostas.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faSearch,
  faDownload,
  faEye,
  faFileExcel,
  faChevronLeft,
  faChevronRight,
  faSpinner,
  faCheck,
  faTimes,
  faExpand
} from '@fortawesome/free-solid-svg-icons';
import * as XLSX from 'xlsx';

const VisualizarRespostas = () => {
  const { id: checklistId } = useParams();
  const numericChecklistId = parseInt(checklistId, 10);
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState(null);
  const [groupedResponses, setGroupedResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [responsesPerPage] = useState(10);

  // URL base da API
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchChecklistAndResponses = async () => {
      setLoading(true);
      try {
        // Buscar detalhes do checklist
        const checklistResponse = await fetch(`${API_URL}/api/checklists/checklists/${checklistId}`);
        if (!checklistResponse.ok) {
          throw new Error('Falha ao buscar detalhes do checklist');
        }
        const checklistData = await checklistResponse.json();
        setChecklist(checklistData);

        // Buscar respostas do checklist
        const responsesResponse = await fetch(`${API_URL}/api/checklists/${numericChecklistId}/respostas`);
        if (!responsesResponse.ok) {
          throw new Error('Falha ao buscar respostas');
        }
        const responsesData = await responsesResponse.json();
        
        setGroupedResponses(responsesData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChecklistAndResponses();
  }, [checklistId, numericChecklistId, API_URL]);

  // Filtrar respostas com base na pesquisa
  const filteredResponses = groupedResponses.filter(submission => 
    submission.submission_id?.toString().includes(searchTerm)
  );

  // Paginação
  const indexOfLastResponse = currentPage * responsesPerPage;
  const indexOfFirstResponse = indexOfLastResponse - responsesPerPage;
  const currentResponses = filteredResponses.slice(indexOfFirstResponse, indexOfLastResponse);
  const totalPages = Math.ceil(filteredResponses.length / responsesPerPage);

  // Gerar range de páginas para paginação
  const pageNumbers = [];
  const displayedPageNumbers = 5; // Número de páginas a serem exibidas na paginação
  
  let startPage = Math.max(1, currentPage - Math.floor(displayedPageNumbers / 2));
  let endPage = Math.min(totalPages, startPage + displayedPageNumbers - 1);
  
  if (endPage - startPage + 1 < displayedPageNumbers) {
    startPage = Math.max(1, endPage - displayedPageNumbers + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const handleBack = () => {
    navigate('/checklists');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetar para a primeira página ao pesquisar
  };

  const handleViewDetails = (submission) => {
    setSelectedResponse(submission);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResponse(null);
  };

  const handleExpandImage = (imageUrl) => {
    setExpandedImage(imageUrl);
  };

  const handleCloseExpandedImage = () => {
    setExpandedImage(null);
  };

  const handleDownloadExcel = async (submission) => {
    try {
      if (!submission || !submission.respostas?.length) {
        alert("Nenhuma resposta encontrada para esta submissão.");
        return;
      }
  
      const rows = submission.respostas.map((response) => ({
        "ID da Submissão": submission.submission_id,
        "Checklist": submission.checklist_title || checklist?.title || "Desconhecido",
        "Data da Resposta": new Date(submission.created_at).toLocaleDateString(),
        "Respondido Por": response.user?.username || "Desconhecido",
        "Pergunta": response.question_text,
        "Resposta": response.answer_text,
        "Score": response.score ? "✅ Correta" : "❌ Errada",
        "Comentário": response.comment_text || "Sem comentário",
        "Evidência URL": response.evidence_url ? `${API_URL}${response.evidence_url}` : "Sem evidência",
      }));
  
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Submissão_${submission.submission_id}`);
  
      XLSX.writeFile(workbook, `Respostas_Submissão_${submission.submission_id}.xlsx`);
    } catch (error) {
      console.error("Erro ao gerar o download unitário:", error);
      alert("Erro ao gerar arquivo Excel. Tente novamente.");
    }
  };

  const handleDownloadAllExcel = async () => {
    try {
      const response = await fetch(`${API_URL}/api/checklists/${numericChecklistId}/respostas`);
      if (!response.ok) {
        throw new Error("Erro ao buscar respostas para download.");
      }
  
      const data = await response.json();
  
      const rows = data.flatMap((submission) =>
        submission.respostas.map((response) => ({
          "ID da Submissão": submission.submission_id,
          "Checklist": submission.checklist_title || checklist?.title || "Desconhecido",
          "Data da Resposta": new Date(submission.created_at).toLocaleDateString(),
          "Respondido Por": response.user?.username || "Desconhecido",
          "Pergunta": response.question_text,
          "Resposta": response.answer_text,
          "Score": response.score ? "✅ Correta" : "❌ Errada",
          "Comentário": response.comment_text || "Sem comentário",
          "Evidência URL": response.evidence_url ? `${API_URL}${response.evidence_url}` : "Sem evidência",
        }))
      );
  
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Respostas");
  
      XLSX.writeFile(workbook, `Respostas_Checklist_${checklistId}.xlsx`);
    } catch (error) {
      console.error("Erro ao gerar o download:", error);
      alert("Erro ao gerar arquivo Excel. Tente novamente.");
    }
  };

  // Formatar data
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="visualizar-respostas-container">
      <Header />
      <div className="visualizar-content">
        <button className="back-button" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Voltar
        </button>
        
        {loading ? (
          <div className="loading-state">
            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
            <p>Carregando respostas...</p>
          </div>
        ) : (
          <>
            <div className="responses-header">
              <div className="header-left">
                <h1 className="responses-title">{checklist?.title || 'Checklist'}</h1>
                <p className="responses-subtitle1">
                  {filteredResponses.length} {filteredResponses.length === 1 ? 'resposta encontrada' : 'respostas encontradas'}
                </p>
              </div>
              <div className="header-actions">
                <div className="responses-search">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Pesquisar por ID da submissão..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                {filteredResponses.length > 0 && (
                  <button 
                    className="download-all-btn"
                    onClick={handleDownloadAllExcel}
                    title="Baixar todas as respostas em Excel"
                  >
                    <FontAwesomeIcon icon={faFileExcel} />
                    Baixar Tudo
                  </button>
                )}
              </div>
            </div>
            
            {filteredResponses.length > 0 ? (
              <div className="table-container">
                <table className="responses-table">
                  <thead>
                    <tr>
                      <th>ID da Submissão</th>
                      <th>Nome do Checklist</th>
                      <th>Data da Resposta</th>
                      <th>Respondido Por</th>
                      <th>QTD Respostas</th>
                      <th>% Score</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentResponses.map((submission) => {
                      const firstResponse = submission.respostas?.[0];
                      return (
                        <tr key={submission.submission_id}>
                          <td>{submission.submission_id}</td>
                          <td>{submission.checklist_title || checklist?.title || "Desconhecido"}</td>
                          <td>{formatDate(submission.created_at)}</td>
                          <td>{firstResponse?.user?.username || "Desconhecido"}</td>
                          <td>{submission.respostas?.length || 0}</td>
                          <td>
                            <span className={`score-badge ${
                              submission.score_percentage >= 70 ? 'good' : 
                              submission.score_percentage >= 50 ? 'medium' : 'bad'
                            }`}>
                              {submission.score_percentage}%
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="action-button" 
                                onClick={() => handleViewDetails(submission)}
                                title="Visualizar detalhes"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                              <button 
                                className="action-button" 
                                onClick={() => handleDownloadExcel(submission)}
                                title="Baixar em Excel"
                              >
                                <FontAwesomeIcon icon={faDownload} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-button"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    
                    <div className="pagination-numbers">
                      {pageNumbers.map(number => (
                        <button
                          key={number}
                          className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                          onClick={() => setCurrentPage(number)}
                        >
                          {number}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      className="pagination-button"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-data">
                {searchTerm ? 'Nenhuma resposta encontrada para a busca realizada.' : 'Nenhuma resposta encontrada para este checklist.'}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modal de Detalhes da Resposta */}
      {showModal && selectedResponse && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="response-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Respostas da Submissão {selectedResponse.submission_id}</h3>
              <button className="close-modal" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              {selectedResponse.respostas?.map((response, index) => (
                <div key={index} className="response-item">
                  <div className="response-question">
                    <strong>Pergunta:</strong> {response.question_text || 'Sem texto'}
                  </div>
                  <div className="response-answer">
                    <strong>Resposta:</strong> {response.answer_text || 'Sem resposta'}
                  </div>
                  <div className="response-score">
                    <strong>Status:</strong> 
                    <span className={response.score ? "score-correct" : "score-incorrect"}>
                      {response.score ? (
                        <><FontAwesomeIcon icon={faCheck} /> Correta</>
                      ) : (
                        <><FontAwesomeIcon icon={faTimes} /> Errada</>
                      )}
                    </span>
                  </div>
                  {response.comment_text && (
                    <div className="response-comment">
                      <strong>Comentário:</strong> {response.comment_text}
                    </div>
                  )}
                  {response.evidence_url && (
                    <div className="response-evidence">
                      <strong>Evidência:</strong>
                      <div 
                        className="evidence-preview"
                        onClick={() => handleExpandImage(`${API_URL}${response.evidence_url}`)}
                      >
                        <img 
                          src={`${API_URL}${response.evidence_url}`}
                          alt="Evidência" 
                          className="evidence-thumbnail"
                        />
                        <div className="view-larger">
                          <FontAwesomeIcon icon={faExpand} /> Ampliar
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Visualização ampliada de imagem */}
      {expandedImage && (
        <div className="expanded-image-overlay" onClick={handleCloseExpandedImage}>
          <div className="expanded-image-container">
            <button className="close-expanded-image" onClick={handleCloseExpandedImage}>
              ×
            </button>
            <img src={expandedImage} alt="Evidência ampliada" className="expanded-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizarRespostas; 