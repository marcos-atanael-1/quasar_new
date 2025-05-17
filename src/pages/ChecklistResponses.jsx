import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faEye,
  faDownload,
  faFileExcel,
  faArrowLeft,
  faChevronLeft,
  faChevronRight,
  faSpinner,
  faTimes,
  faCheck,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import './ChecklistResponses.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ChecklistResponses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [groupedResponses, setGroupedResponses] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllResponses();
  }, []);

  const fetchAllResponses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/checklists/responses/all`);
      if (!response.ok) {
        throw new Error("Erro ao buscar respostas.");
      }
      const data = await response.json();
      setGroupedResponses(data);
    } catch (error) {
      console.error("Erro ao buscar respostas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/checklists');
  };

  // Transformar dados agrupados em lista plana para paginação
  const flattenedResponses = Object.keys(groupedResponses)
    .filter(checklist => checklist.toLowerCase().includes(searchTerm.toLowerCase()))
    .flatMap(checklist => 
      groupedResponses[checklist].map(submission => ({
        id: submission.submission_id,
        checklist: checklist,
        date: new Date(submission.created_at).toLocaleDateString(),
        respondedBy: submission.user?.username || "Desconhecido",
        totalResponses: submission.respostas.length,
        score: submission.score_percentage,
        originalData: { checklist, submission }
      }))
    );

  // Pagination logic
  const totalPages = Math.ceil(flattenedResponses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResponses = flattenedResponses.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = (responseData) => {
    const { checklist, submission } = responseData.originalData;
    setSelectedSubmission(submission);
    setModalContent(submission.respostas);
    setShowModal(true);
  };

  const handleDownload = async (responseData) => {
    const { checklist, submission } = responseData.originalData;
    try {
      const rows = submission.respostas.map((response) => ({
        "ID da Submissão": submission.submission_id,
        Checklist: checklist,
        "Data da Resposta": new Date(submission.created_at).toLocaleDateString(),
        "Respondido Por": response.user?.username || "Desconhecido",
        Pergunta: response.question_text,
        Resposta: response.answer_text,
        "Score": response.score ? "✅ Correta" : "❌ Errada",
        "Evidência URL": response.evidence_url ? `${API_URL}${response.evidence_url}` : "Sem evidência",
      }));

      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Submissão_${submission.submission_id}`);
      XLSX.writeFile(workbook, `Respostas_Submissão_${submission.submission_id}.xlsx`);
    } catch (error) {
      console.error("Erro ao baixar respostas:", error);
      alert("Erro ao baixar respostas. Tente novamente.");
    }
  };

  const handleDownloadAll = async () => {
    try {
      const rows = Object.keys(groupedResponses).flatMap((checklist) =>
        groupedResponses[checklist].flatMap((submission) =>
          submission.respostas.map((response) => ({
            "ID da Submissão": submission.submission_id,
            Checklist: checklist,
            "Data da Resposta": new Date(submission.created_at).toLocaleDateString(),
            "Respondido Por": response.user?.username || "Desconhecido",
            Pergunta: response.question_text,
            Resposta: response.answer_text,
            "Score": response.score ? "✅ Correta" : "❌ Errada",
            "Evidência URL": response.evidence_url ? `${API_URL}${response.evidence_url}` : "Sem evidência",
          }))
        )
      );

      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Respostas");
      XLSX.writeFile(workbook, `Todas_Respostas.xlsx`);
    } catch (error) {
      console.error("Erro ao gerar download:", error);
      alert("Erro ao gerar download. Tente novamente.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubmission(null);
    setModalContent([]);
  };

  const handleExpandImage = (imageUrl) => {
    setExpandedImage(imageUrl);
  };

  const closeExpandedImage = () => {
    setExpandedImage(null);
  };

  return (
    <div className="responses-container">
      <Header onLogout={handleLogout} />

      <main className="responses-content">
        <button className="back-button" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Voltar
        </button>

        <div className="responses-header">
          <div className="header-left">
            <h1 className="responses-title">Todas as Respostas</h1>
            <p className="responses-subtitle">Visualize e analise todas as respostas dos checklists</p>
          </div>
          
          <div className="header-actions">
            <div className="responses-search">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Pesquisar por checklist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              className="download-all-btn"
              onClick={handleDownloadAll}
            >
              <FontAwesomeIcon icon={faFileExcel} />
              Baixar Tudo
            </button>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-state">
              <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
              <p>Carregando respostas...</p>
            </div>
          ) : (
            <>
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
                  {currentResponses.length > 0 ? (
                    currentResponses.map(response => (
                      <tr key={response.id}>
                        <td>{response.id}</td>
                        <td>{response.checklist}</td>
                        <td>{response.date}</td>
                        <td>{response.respondedBy}</td>
                        <td>{response.totalResponses}</td>
                        <td>
                          <span className={`score-badge ${
                            response.score >= 70 ? 'good' : 
                            response.score >= 50 ? 'medium' : 'bad'
                          }`}>
                            {response.score}%
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-button"
                              onClick={() => handleView(response)}
                              title="Visualizar"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button
                              className="action-button"
                              onClick={() => handleDownload(response)}
                              title="Download"
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        Nenhuma resposta encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  
                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    className="pagination-button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="response-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Respostas da Submissão {selectedSubmission.submission_id}</h3>
              <button className="close-modal" onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              {modalContent.map((response, index) => (
                <div key={index} className="response-item">
                  <div className="response-question">
                    <strong>Pergunta:</strong> {response.question_text}
                  </div>
                  <div className="response-answer">
                    <strong>Resposta:</strong> {response.answer_text}
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
                  {response.evidence_url && (
                    <div className="response-evidence">
                      <div className="evidence-preview" onClick={() => handleExpandImage(`${API_URL}${response.evidence_url}`)}>
                        <img 
                          src={`${API_URL}${response.evidence_url}`} 
                          alt="Evidência" 
                          className="evidence-thumbnail" 
                        />
                        <div className="view-larger">
                          <FontAwesomeIcon icon={faImage} /> Ver imagem
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

      {expandedImage && (
        <div className="expanded-image-overlay" onClick={closeExpandedImage}>
          <div className="expanded-image-container">
            <button className="close-expanded-image" onClick={closeExpandedImage}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <img src={expandedImage} alt="Imagem Expandida" className="expanded-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistResponses;