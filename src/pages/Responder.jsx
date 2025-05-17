import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCamera,
  faComment,
  faSpinner,
  faPaperPlane,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import './Responder.css';

// Verificação explícita da variável de ambiente
const VITE_API_URL = import.meta.env.VITE_API_URL;
console.log("VITE_API_URL:", VITE_API_URL);
const API_URL = VITE_API_URL || 'http://localhost:8000';
console.log("API_URL usado:", API_URL);

const Responder = () => {
  const { id: checklistId } = useParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState(null);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState({});
  const [previewImages, setPreviewImages] = useState({});

  useEffect(() => {
    const fetchChecklistDetails = async () => {
      setLoading(true);
      try {
        // Buscamos os detalhes do checklist com base no ID
        console.log("Buscando detalhes do checklist:", checklistId);
        const response = await fetch(`${API_URL}/api/checklists/${checklistId}/details`);
        if (!response.ok) {
          throw new Error("Erro ao buscar detalhes do checklist.");
        }
        
        const data = await response.json();
        console.log("Dados do checklist recebidos:", data);
        
        // O backend já nos fornece a URL completa da imagem em cover_image_url
        setChecklist(data);
      } catch (error) {
        console.error("Erro ao buscar checklist:", error);
        alert("Erro ao carregar o checklist. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchChecklistDetails();
  }, [checklistId]);

  const handleInputChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleFileChange = (questionId, file) => {
    setFiles((prev) => ({ ...prev, [questionId]: file }));
    
    // Criar preview da imagem
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => ({
          ...prev,
          [questionId]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImages(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[questionId];
        return newPreviews;
      });
    }
  };

  const handleCommentChange = (questionId, value) => {
    setComments((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleCommentBox = (questionId) => {
    setShowCommentBox((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  // Filtra as perguntas para exibir apenas as que devem aparecer
  const getVisibleQuestions = () => {
    if (!checklist) return [];
    return checklist.questions.filter((question) => {
      if (!question.isConditional) {
        return true;
      }
      // Verifica se a pergunta pai foi respondida com a opção correta
      const parentQuestion = checklist.questions.find(q => q.id === question.parentQuestionId);
      return parentQuestion && parentQuestion.options.some(option =>
        option.condicional && option.text === answers[parentQuestion.id]
      );
    });
  };

  const handleSubmit = async () => {
    if (!checklist) return;
  
    // Validar respostas
    const missingAnswers = getVisibleQuestions().filter(
      (q) => !answers[q.id] || answers[q.id].trim() === ""
    );
    
    if (missingAnswers.length > 0) {
      alert("Por favor, responda todas as perguntas antes de enviar.");
      return;
    }
    
    // Validar evidências obrigatórias
    const missingEvidence = getVisibleQuestions().filter(
      (q) => q.evidenciaObrigatoria && !files[q.id]
    );
    
    if (missingEvidence.length > 0) {
      alert(`A pergunta "${missingEvidence[0].text}" exige uma evidência!`);
      return;
    }
  
    setSubmitting(true);
    const formData = new FormData();
    formData.append("user_id", 1); // Substituir pelo ID real do usuário
  
    const answersData = getVisibleQuestions().map((q) => ({
      question_id: q.id,
      question_text: q.text,
      answer_text: answers[q.id] || "",
      comment: comments[q.id] || "",
    }));
  
    formData.append("answers", JSON.stringify(answersData));
  
    getVisibleQuestions().forEach((q) => {
      if (files[q.id]) {
        const fileName = `${q.id}_${files[q.id].name}`;
        const file = new File([files[q.id]], fileName, { type: files[q.id].type });
        formData.append("files", file);
      }
    });
  
    try {
      const response = await fetch(`${API_URL}/api/checklists/${checklistId}/respostas`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Erro ao enviar respostas.");
      }
  
      const actionPlans = await response.json();
  
      if (actionPlans.length > 0) {
        navigate("/planos", { state: { planosAcao: actionPlans } });
      } else {
        alert("Respostas enviadas com sucesso!");
        navigate("/checklists");
      }
    } catch (error) {
      console.error("Erro ao enviar respostas:", error);
      alert("Erro ao enviar respostas. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="responder-container">
      <main className="responder-content">
        {loading ? (
          <div className="loading-state">
            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
            <p>Carregando checklist...</p>
          </div>
        ) : checklist ? (
          <div className="checklist-form">
            <div className="form-header">
              {checklist.cover_image_url ? (
                <img
                  src={checklist.cover_image_url}
                  alt={checklist.title}
                  className="checklist-thumbnail"
                  onError={(e) => {
                    console.error("Erro ao carregar imagem:", e.target.src);
                    e.target.src = "https://i.ibb.co/TdnPT6v/icon-dashboard.png";
                  }}
                />
              ) : (
                <img
                  src="https://i.ibb.co/TdnPT6v/icon-dashboard.png"
                  alt={checklist.title}
                  className="checklist-thumbnail"
                />
              )}
              <div className="checklist-info">
                <h1 className="checklist-title">{checklist.title}</h1>
                <p className="checklist-description">{checklist.description}</p>
              </div>
            </div>
            
            <div className="questions-list">
              {getVisibleQuestions().map((question) => (
                <div key={question.id} className="question-card">
                  <div className="question-text">
                    <h3>{question.text}</h3>
                    {question.evidenciaObrigatoria && (
                      <span className="evidence-required">Evidência Obrigatória</span>
                    )}
                  </div>
                  
                  <div className="question-answer">
                    {question.type === "Texto" ? (
                      <input
                        type="text"
                        value={answers[question.id] || ""}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        placeholder="Digite sua resposta"
                        className="text-input"
                      />
                    ) : (
                      <select
                        value={answers[question.id] || ""}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        className="select-input"
                      >
                        <option value="">Selecione uma opção</option>
                        {question.options.map((option, index) => (
                          <option key={index} value={option.text}>
                            {option.text}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  <div className="question-actions">
                    <div className="action-group">
                      <button 
                        className="action-button camera"
                        onClick={() => document.getElementById(`file-input-${question.id}`).click()}
                        title="Adicionar Evidência"
                      >
                        <FontAwesomeIcon icon={faCamera} />
                        <span>Evidência</span>
                      </button>
                      <input
                        type="file"
                        id={`file-input-${question.id}`}
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleFileChange(question.id, e.target.files[0])}
                      />
                    </div>
                    
                    <div className="action-group">
                      <button 
                        className="action-button comment"
                        onClick={() => toggleCommentBox(question.id)}
                        title="Adicionar Comentário"
                      >
                        <FontAwesomeIcon icon={faComment} />
                        <span>Comentário</span>
                      </button>
                    </div>
                  </div>
                  
                  {previewImages[question.id] && (
                    <div className="evidence-preview">
                      <div className="preview-header">
                        <h4>Evidência</h4>
                        <button 
                          className="remove-evidence" 
                          onClick={() => handleFileChange(question.id, null)}
                        >
                          Remover
                        </button>
                      </div>
                      <div className="preview-image-container">
                        <img 
                          src={previewImages[question.id]} 
                          alt="Preview" 
                          className="preview-image" 
                        />
                      </div>
                    </div>
                  )}
                  
                  {showCommentBox[question.id] && (
                    <div className="comment-box">
                      <textarea
                        placeholder="Digite seu comentário..."
                        value={comments[question.id] || ""}
                        onChange={(e) => handleCommentChange(question.id, e.target.value)}
                        className="comment-input"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="form-actions">
              <button 
                className="submit-button" 
                onClick={handleSubmit} 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    <span>Enviar Respostas</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="error-state">
            <p>Não foi possível carregar o checklist. Tente novamente.</p>
            <button onClick={() => window.location.reload()} className="reload-button">
              Recarregar
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Responder; 