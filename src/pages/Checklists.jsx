import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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
  faPencilAlt,
  faChartBar,
  faPowerOff,
  faClipboardCheck,
  faCalendarDays,
  faUndo,
  faGripVertical,
  faSpinner,
  faCopy,
  faQrcode
} from '@fortawesome/free-solid-svg-icons';
import { QRCodeSVG } from 'qrcode.react';
import './Checklists.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Adicione o URL padrão

const Checklists = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [checklists, setChecklists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [expirationEnabled, setExpirationEnabled] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [areas, setAreas] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    frequency: "Sem Frequência",
    areaResponsible: "",
    responsibleUser: "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  
  // Constantes
  const questionTypes = ["Texto", "Múltipla escolha", "Sim/Não"];

  // Efeitos para carregar dados
  useEffect(() => {
    setLoading(true);
    
    // Timer para simular o carregamento de 3 segundos
    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    fetchChecklists();
    fetchAreas();
    fetchUsers();
    
    return () => clearTimeout(loadingTimer);
  }, []);

  const fetchChecklists = async () => {
    try {
      console.log("Iniciando busca de checklists na URL:", `${API_URL}/api/checklists/`);
      const response = await fetch(`${API_URL}/api/checklists/`);
      console.log("Status da resposta:", response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error("Erro ao carregar checklists.");
      }
      const data = await response.json();
      console.log("Dados recebidos:", data);

      // Filtra apenas os checklists que NÃO estão marcados para exclusão vencida
      const filteredChecklists = data.filter(
        (checklist) => !checklist.deleted_at || new Date(checklist.deleted_at) > new Date()
      );
      console.log("Checklists filtrados:", filteredChecklists);

      // Atualiza os checklists com o status correto
      const updatedChecklists = await Promise.all(
        filteredChecklists.map(async (checklist) => {
          try {
            const statusResponse = await fetch(`${API_URL}/api/checklists/checklists/${checklist.id}/status`);
            if (!statusResponse.ok) {
              throw new Error(`Erro ao carregar status do checklist ${checklist.id}`);
            }
            const statusData = await statusResponse.json();
            return { ...checklist, status: statusData.status };
          } catch (error) {
            console.error("Erro ao buscar status:", error);
            return checklist; // Retorna o checklist sem alteração em caso de erro
          }
        })
      );

      console.log("Checklists com status atualizados:", updatedChecklists);
      setChecklists(updatedChecklists);
    } catch (error) {
      console.error("Erro ao buscar checklists:", error);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/areas/`);
      if (!response.ok) {
        throw new Error("Erro ao carregar áreas.");
      }
      const data = await response.json();
      setAreas(data);
    } catch (error) {
      console.error("Erro ao buscar áreas:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/`);
      if (!response.ok) {
        throw new Error("Erro ao carregar usuários.");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  // Handlers
  const handleLogout = () => {
    navigate('/login');
  };

  const handleResponses = (e) => {
    e.stopPropagation();
    navigate('/checklists/responses');
  };

  const toggleChecklistStatus = async (e, checklistId) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_URL}/api/checklists/checklists/${checklistId}/toggle-status`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Erro ao alterar status.");
      }

      const updatedChecklist = await response.json();
      setChecklists((prevChecklists) =>
        prevChecklists.map((checklist) =>
          checklist.id === checklistId ? { ...checklist, status: updatedChecklist.new_status } : checklist
        )
      );
    } catch (error) {
      console.error("Erro ao alterar status do checklist:", error);
    }
  };

  const scheduleDeleteChecklist = async (e, checklistId) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("Este checklist será removido da listagem após 7 dias. Deseja continuar?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/checklists/checklists/${checklistId}/schedule-delete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error("Erro ao marcar checklist para exclusão.");
      }

      const data = await response.json();
      alert(`Checklist será removido da listagem em: ${new Date(data.deleted_at).toLocaleString()}`);

      // Atualiza o estado sem remover imediatamente
      setChecklists((prevChecklists) =>
        prevChecklists.map((checklist) =>
          checklist.id === checklistId ? { ...checklist, deleted_at: data.deleted_at } : checklist
        )
      );
    } catch (error) {
      console.error("Erro ao marcar checklist para exclusão:", error);
      alert("Erro ao excluir o checklist.");
    }
  };

  const cancelDeleteChecklist = async (e, checklistId) => {
    e.stopPropagation();
    const confirmCancel = window.confirm("Deseja cancelar a exclusão deste checklist?");
    if (!confirmCancel) return;

    try {
      const response = await fetch(`${API_URL}/api/checklists/checklists/${checklistId}/cancel-delete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) {
        throw new Error("Erro ao cancelar exclusão.");
      }

      alert("Exclusão cancelada com sucesso!");

      // Atualiza a lista de checklists, removendo o deleted_at
      setChecklists((prevChecklists) =>
        prevChecklists.map((checklist) =>
          checklist.id === checklistId ? { ...checklist, deleted_at: null } : checklist
        )
      );
    } catch (error) {
      console.error("Erro ao cancelar exclusão:", error);
      alert("Erro ao cancelar exclusão.");
    }
  };

  const handleEdit = (e, id) => {
    e.stopPropagation();
    handleEditChecklist(id);
  };

  const handleView = (e, id) => {
    e.stopPropagation();
    navigate(`/checklists/${id}/respostas`);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    scheduleDeleteChecklist(e, id);
  };

  const handleDeactivate = (e, id) => {
    e.stopPropagation();
    toggleChecklistStatus(e, id);
  };

  const handleEditChecklist = async (checklistId) => {
    try {
      const response = await fetch(`${API_URL}/api/checklists/checklists/${checklistId}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar checklist.");
      }

      const data = await response.json();

      console.log("Dados do checklist carregado:", data); // Depuração

      // Verifica se a resposta da API contém dados esperados
      if (!data || !data.questions) {
        throw new Error("Dados inválidos retornados pela API.");
      }

      setFormData({
        id: data.id || null,
        title: data.title || "",
        description: data.description || "",
        frequency: data.frequency || "Sem Frequência",
        areaResponsible: data.area_responsible || "",
        responsibleUser: data.responsible_user || "",
      });

      // Garantir que cada pergunta tem os campos necessários
      setQuestions(
        data.questions.map((q) => ({
          id: q.id || `question-${Date.now()}`,
          text: q.text || "",
          type: q.type || "Texto",
          options: Array.isArray(q.options)
            ? q.options.map((opt) => ({
                text: opt.text || "",
                pontua: opt.pontua || false,
                condicional: opt.condicional || false,
              }))
            : [],
        }))
      );

      // Tratamento para data de expiração
      setExpirationEnabled(Boolean(data.expiration_date));
      setExpirationDate(data.expiration_date || "");

      setCoverImage(null);
      setEditMode(true);
      setShowModal(true);

    } catch (error) {
      console.error("Erro ao buscar checklist para edição:", error);
      alert("Erro ao carregar os dados do checklist. Verifique o console.");
    }
  };

  const handleQuestionTextChange = (id, newText) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === id ? { ...q, text: newText } : q))
    );
  };

  const handleQuestionTypeChange = (id, newType) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === id
          ? {
              ...q,
              type: newType,
              options:
                newType === "Texto"
                  ? []
                  : newType === "Sim/Não"
                  ? [
                      { text: "Sim", pontua: false, condicional: false },
                      { text: "Não", pontua: false, condicional: false },
                    ]
                  : [],
            }
          : q
      )
    );
  };

  const handleOptionChange = (questionId, optionIndex, newOption) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, idx) =>
                idx === optionIndex ? newOption : opt
              ),
            }
          : q
      )
    );
  };

  const handleAddOption = (questionId) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [
                ...q.options,
                { text: `Opção ${q.options.length + 1}`, pontua: false, condicional: false },
              ],
            }
          : q
      )
    );
  };

  const handleRemoveOption = (questionId, optionIndex) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
          : q
      )
    );
  };

  const handleRemoveQuestion = (id) => {
    setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== id));
  };

  const handleOptionFlagChange = (questionId, optionIndex, flag, value) => {
    setQuestions((prevQuestions) => {
      return prevQuestions.flatMap((q, index) => {
        if (q.id === questionId) {
          const updatedQuestion = {
            ...q,
            options: q.options.map((opt, idx) => {
              if (idx === optionIndex) {
                return { ...opt, [flag]: value };
              } else if ((flag === "pontua" || flag === "condicional") && value) {
                return { ...opt, [flag]: false };
              }
              return opt;
            }),
          };

          // Adicionar uma pergunta condicional abaixo se "condicional" for ativado
          if (flag === "condicional" && value) {
            const conditionalQuestion = {
              id: `question-${Date.now()}`,
              text: "", // Mantém o texto vazio inicialmente
              type: "Texto", // Tipo padrão para novas perguntas
              options: [],
              isConditional: true, // Flag indicando que é uma pergunta condicional
              parentQuestionId: questionId, // ID da pergunta original
              parentQuestionIndex: index + 1, // Índice da pergunta original
            };
            return [updatedQuestion, conditionalQuestion];
          }

          return [updatedQuestion];
        }
        return [q];
      });
    });
  };

  const handleQuestionConfigChange = (questionId, configKey, value) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId ? { ...q, [configKey]: value } : q
      )
    );
  };

  const handleSaveChecklist = async () => {
    if (!formData.title) {
      alert("Por favor, preencha o título do checklist");
      return;
    }

    const data = new FormData();

    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("frequency", formData.frequency);
    data.append("area_responsible", formData.areaResponsible);
    data.append("responsible_user", formData.responsibleUser);
    data.append("expiration_date", expirationEnabled ? expirationDate : null);
    if (coverImage) {
      data.append("cover_image", coverImage);
    }
    data.append(
      "questions",
      JSON.stringify(
        questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.options.map((opt) => ({
            text: opt.text,
            pontua: opt.pontua,
            condicional: opt.condicional,
          })),
          geraPlanoAcao: q.geraPlanoAcao || false,
          anexarEvidencia: q.anexarEvidencia || false,
          evidenciaObrigatoria: q.evidenciaObrigatoria || false,
        }))
      )
    );

    try {
      const url = editMode
        ? `${API_URL}/api/checklists/${formData.id}`
        : `${API_URL}/api/checklists/`;
      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao salvar checklist");
      }

      const result = await response.json();
      alert(editMode ? "Checklist atualizado com sucesso!" : "Checklist salvo com sucesso!");
      
      // Fechar o modal e atualizar a lista
      setShowModal(false);
      setStep(1);
      setQuestions([]);
      setFormData({
        id: null,
        title: "",
        description: "",
        frequency: "Sem Frequência",
        areaResponsible: "",
        responsibleUser: "",
      });
      setCoverImage(null);
      setEditMode(false);
      
      // Recarregar checklists
      fetchChecklists();
    } catch (error) {
      console.error("Erro ao salvar checklist:", error);
      alert("Erro ao salvar checklist. Verifique o console para mais detalhes.");
    }
  };

  const handleAddQuestion = () => {
    setQuestions((prevQuestions) => [
      ...prevQuestions,
      {
        id: `question-${Date.now()}`,
        text: "",
        type: "Texto",
        options: [],
      },
    ]);
  };

  const calculatePlaceholders = (itemCount) => {
    const itemsPerRow = 4;
    const totalItems = itemCount + 1;
    const remainder = totalItems % itemsPerRow;
    return remainder === 0 ? 0 : itemsPerRow - remainder;
  };

  const placeholderCount = calculatePlaceholders(
    checklists.filter(checklist => 
      checklist.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).length
  );

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    setQuestions((prevQuestions) => {
      const reorderedQuestions = Array.from(prevQuestions);
      const [movedQuestion] = reorderedQuestions.splice(result.source.index, 1);
      reorderedQuestions.splice(result.destination.index, 0, movedQuestion);
      return reorderedQuestions;
    });
  };

  // Handlers para gerenciar o modal
  const handleOpenModal = () => {
    console.log("Abrindo modal...");
    setStep(1);
    setEditMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setStep(1);
    setQuestions([]);
    setFormData({
      id: null,
      title: "",
      description: "",
      frequency: "Sem Frequência",
      areaResponsible: "",
      responsibleUser: "",
    });
    setCoverImage(null);
    setEditMode(false);
  };

  // Adicionar função para exibir o popup de compartilhamento
  const handleSharePopup = (e, id) => {
    e.stopPropagation();
    
    // Criar o link para respostas
    const linkToShare = `${window.location.origin}/checklists/${id}/responder`;
    setShareLink(linkToShare);
    setLinkCopied(false);
    setShowSharePopup(true);
  };



  // Adicionar função para copiar o link para a área de transferência
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch(err => {
        console.error('Erro ao copiar link:', err);
      });
  };

  // Referência para o elemento QR code
  const qrRef = useRef(null);

  // Função para baixar o QR code como imagem
  const downloadQRCode = () => {
    if (!qrRef.current) return;
    
    // Capturar o SVG
    const svgElement = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Configurar a conversão SVG para PNG
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Criar link de download
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qrcode-checklist.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Adicionar função para fechar o popup
  const closeSharePopup = () => {
    setShowSharePopup(false);
  };

  // Componente visual mantido da nova interface
  return (
    <div className="checklists-container">
      <Header onLogout={handleLogout} />
      
      <main className="checklists-content">
        {loading && (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
            <p>Carregando checklists</p>
          </div>
        )}
        
        {!loading && (
          <>
            <div className="checklists-header">
              <h1 className="checklists-title">Lista de Checklists</h1>
              
              <div className="search-actions">
                <div className="checklist-search">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Pesquisar checklists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <button 
                  className="view-responses"
                  onClick={(e) => navigate("/checklists/responses")}
                >
                  <FontAwesomeIcon icon={faEye} />
                  Visualizar Respostas
                </button>
              </div>
            </div>

            <div className="checklists-grid">
              {checklists
                .filter(checklist => 
                  checklist.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(checklist => (
                  <div key={checklist.id} className="checklist-card">
                    {checklist.cover_image_url ? (
                      <img
                        src={checklist.cover_image_url}
                        alt={checklist.title}
                        className="checklist-image"
                      />
                    ) : (
                      <img
                        src="https://i.ibb.co/TdnPT6v/icon-dashboard.png"
                        alt={checklist.title}
                        className="checklist-image"
                      />
                    )}
                    <div className="checklist-info">
                      <h3 className="checklist-name">{checklist.title}</h3>
                      <div className="checklist-stat">
                        <FontAwesomeIcon icon={faClipboardCheck} className="stat-icon" />
                        <span>{checklist.responses_count || 0} respostas</span>
                      </div>
                      <div className="checklist-stat">
                        <FontAwesomeIcon icon={faCalendarDays} className="stat-icon" />
                        <span>{checklist.updated_at ? new Date(checklist.updated_at).toLocaleDateString() : 'Sem data'}</span>
                      </div>
                      <div className="checklist-stat">
                        <FontAwesomeIcon icon={faUsers} className="stat-icon" />
                        <span>{checklist.users_count || 0} usuários</span>
                      </div>
                    </div>

                    <div className="hover-menu">
                      <button 
                        className="menu-icon edit"
                        onClick={(e) => handleEdit(e, checklist.id)}
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faPencilAlt} />
                      </button>
                      <button 
                        className="menu-icon view"
                        onClick={(e) => handleSharePopup(e, checklist.id)}
                        title="Compartilhar link"
                      >
                        <FontAwesomeIcon icon={faLink} />
                      </button>
                      <button 
                        className="menu-icon responses"
                        onClick={(e) => handleView(e, checklist.id)}
                        title="Respostas"
                      >
                        <FontAwesomeIcon icon={faChartBar} />
                      </button>
                      <button 
                        className={`menu-icon ${checklist.status ? "deactivate" : "activate"}`}
                        onClick={(e) => handleDeactivate(e, checklist.id)}
                        title={checklist.status ? "Desativar" : "Ativar"}
                      >
                        <FontAwesomeIcon icon={faPowerOff} />
                      </button>
                      {checklist.deleted_at ? (
                        <button 
                          className="menu-icon restore"
                          onClick={(e) => cancelDeleteChecklist(e, checklist.id)}
                          title="Restaurar"
                        >
                          <FontAwesomeIcon icon={faUndo} />
                        </button>
                      ) : (
                        <button 
                          className="menu-icon delete"
                          onClick={(e) => handleDelete(e, checklist.id)}
                          title="Excluir"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              
              <div 
                className="checklist-card add-checklist" 
                onClick={handleOpenModal}
                style={{ cursor: 'pointer' }}
              >
                <FontAwesomeIcon icon={faPlus} className="add-icon" />
                <span className="add-text">Adicionar</span>
              </div>

              {Array.from({ length: placeholderCount }).map((_, index) => (
                <div key={`placeholder-${index}`} className="checklist-card placeholder" />
              ))}
            </div>
          </>
        )}
      </main>
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button onClick={handleCloseModal} className="close-modal">X</button>
            
            {step === 1 && (
              <div>
                <h2>{editMode ? "Editar Checklist" : "Criar Checklist"}</h2>
                <label>Título</label>
                <input
                  type="text"
                  placeholder="Digite o título"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <label>Descrição</label>
                <textarea
                  placeholder="Descreva o checklist"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                <label>Frequência de Resposta</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  <option value="Sem Frequência">Sem Frequência</option>
                  <option value="Diária">Diária</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Quinzenal">Quinzenal</option>
                  <option value="Mensal">Mensal</option>
                  <option value="Anual">Anual</option>
                </select>

                <label>Área Responsável</label>
                <select
                  value={formData.areaResponsible}
                  onChange={(e) => setFormData({ ...formData, areaResponsible: e.target.value })}
                >
                  <option value="">Selecione uma área</option>
                  {areas.map((area) => (
                    <option key={area.Id} value={area.Id}>
                      {area.Name}
                    </option>
                  ))}
                </select>

                <label>Responsável</label>
                <select
                  value={formData.responsibleUser}
                  onChange={(e) => setFormData({ ...formData, responsibleUser: e.target.value })}
                >
                  <option value="">Selecione um responsável</option>
                  {users.map((user) => (
                    <option key={user.Id} value={user.Id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>

                <label>Expiração?</label>
                <select
                  value={expirationEnabled ? "Sim" : "Não"}
                  onChange={(e) => setExpirationEnabled(e.target.value === "Sim")}
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>

                {expirationEnabled && (
                  <div>
                    <label>Data de Expiração</label>
                    <input
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                    />
                  </div>
                )}
                
                <label>Upload de Imagem</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files[0])}
                />

                <div className="button-container">
                  <button onClick={() => setStep(2)}>Próximo</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2>Adicionar Perguntas</h2>
                {questions.length > 0 && (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="droppable-questions">
                      {(provided) => (
                        <div
                          className="questions-container"
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {questions.map((question, index) => (
                            <Draggable key={question.id} draggableId={question.id} index={index}>
                              {(provided) => (
                                <div
                                  className={`question-card ${
                                    question.isConditional ? "conditional-question" : ""
                                  }`}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  {question.isConditional && (
                                    <div className="conditional-label">
                                      Pergunta condicional da pergunta {question.parentQuestionIndex}
                                    </div>
                                  )}
                                  <div className="question-details">
                                    <div className="question-row">
                                      <FontAwesomeIcon icon={faGripVertical} className="drag-handle" />
                                      <input
                                        type="text"
                                        placeholder={`Pergunta ${index + 1}`}
                                        value={question.text}
                                        onChange={(e) =>
                                          handleQuestionTextChange(question.id, e.target.value)
                                        }
                                        className="question-input"
                                      />
                                      <select
                                        value={question.type}
                                        onChange={(e) => handleQuestionTypeChange(question.id, e.target.value)}
                                        className="question-type"
                                      >
                                        {questionTypes.map((type) => (
                                          <option key={type} value={type}>
                                            {type}
                                          </option>
                                        ))}
                                      </select>
                                      <FontAwesomeIcon
                                        icon={faTrash}
                                        className="remove-question"
                                        onClick={() => handleRemoveQuestion(question.id)}
                                      />
                                    </div>
          
                                    {(question.type === "Múltipla escolha" || question.type === "Sim/Não") && (
                                      <div className="options-container">
                                        {question.options.map((option, optIndex) => (
                                          <div key={optIndex} className="option">
                                            <input
                                              type="text"
                                              value={option.text}
                                              placeholder={`Opção ${optIndex + 1}`}
                                              onChange={(e) =>
                                                handleOptionChange(question.id, optIndex, {
                                                  ...option,
                                                  text: e.target.value
                                                })
                                              }
                                              disabled={question.type === "Sim/Não"}
                                            />
                                            <label>
                                              <span>Pontua?</span>
                                              <div className="toggle-switch">
                                                <input
                                                  type="checkbox"
                                                  checked={option.pontua || false}
                                                  onChange={(e) =>
                                                    handleOptionFlagChange(
                                                      question.id,
                                                      optIndex,
                                                      "pontua",
                                                      e.target.checked
                                                    )
                                                  }
                                                />
                                                <span className="toggle-slider" />
                                              </div>
                                            </label>
                                            <label>
                                              <span>Condicional?</span>
                                              <div className="toggle-switch">
                                                <input
                                                  type="checkbox"
                                                  checked={option.condicional || false}
                                                  onChange={(e) =>
                                                    handleOptionFlagChange(
                                                      question.id,
                                                      optIndex,
                                                      "condicional",
                                                      e.target.checked
                                                    )
                                                  }
                                                />
                                                <span className="toggle-slider" />
                                              </div>
                                            </label>
                                            {question.type !== "Sim/Não" && (
                                              <button
                                                className="remove-option-button"
                                                onClick={() => handleRemoveOption(question.id, optIndex)}
                                              >
                                                X
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                        {question.type !== "Sim/Não" && (
                                          <button
                                            onClick={() => handleAddOption(question.id)}
                                            className="add-option-button"
                                          >
                                            Adicionar Opção
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
          
                                  {/* Configurações da pergunta */}
                                  <div className="configurations-container">
                                    <h4>Configurações</h4>
                                    <label>
                                      <span>Plano de ação?</span>
                                      <div className="toggle-switch">
                                        <input
                                          type="checkbox"
                                          checked={question.geraPlanoAcao || false}
                                          onChange={(e) =>
                                            handleQuestionConfigChange(
                                              question.id,
                                              "geraPlanoAcao",
                                              e.target.checked
                                            )
                                          }
                                        />
                                        <span className="toggle-slider" />
                                      </div>
                                    </label>
                                    <label>
                                      <span>Evidência Obrigatória?</span>
                                      <div className="toggle-switch">
                                        <input
                                          type="checkbox"
                                          checked={question.evidenciaObrigatoria || false}
                                          onChange={(e) =>
                                            handleQuestionConfigChange(
                                              question.id,
                                              "evidenciaObrigatoria",
                                              e.target.checked
                                            )
                                          }
                                        />
                                        <span className="toggle-slider" />
                                      </div>
                                    </label>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
                <div className="add-question-container">
                  <span className="add-question-link" onClick={handleAddQuestion}>
                    + Adicionar Pergunta
                  </span>
                </div>
                <div className="button-container">
                  <button onClick={handleSaveChecklist}>Salvar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Popup de compartilhamento */}
      {showSharePopup && (
        <div className="modal-overlay" onClick={closeSharePopup}>
          <div className="share-popup" onClick={e => e.stopPropagation()}>
            <div className="share-popup-header">
              <h3>Compartilhar checklist</h3>
              <button className="close-popup" onClick={closeSharePopup}>×</button>
            </div>
            <div className="share-popup-content">
              <p>Copie o link abaixo para compartilhar este checklist:</p>
              <div className="share-link-container">
                <input 
                  type="text" 
                  className="share-link-input" 
                  value={shareLink} 
                  readOnly 
                  onClick={e => e.target.select()}
                />
                <button 
                  className="copy-link-button" 
                  onClick={copyLinkToClipboard}
                >
                  <FontAwesomeIcon icon={faCopy} />
                  {linkCopied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              
              <div className="qr-code-container" ref={qrRef}>
                <h4>QR Code</h4>
                <QRCodeSVG 
                  value={shareLink} 
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#9932cc"}
                  level={"H"}
                  includeMargin={true}
                  className="qr-code-image"
                />
                <button 
                  className="download-qr-button"
                  onClick={downloadQRCode}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Baixar QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checklists;

