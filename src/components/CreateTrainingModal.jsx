import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFile, 
  faTimes, 
  faGripVertical,
  faTrash,
  faPlus,
  faChevronRight,
  faUsers,
  faUserGroup,
  faCheck,
  faChevronDown,
  faChevronUp,
  faExclamationTriangle,
  faSpinner,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './CreateTrainingModal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const APP_MODE = import.meta.env.VITE_APP_MODE;

// Mock data for DEV environment
const mockAreas = [
  { Id: 1, Name: 'Produção' },
  { Id: 2, Name: 'Manutenção' },
  { Id: 3, Name: 'Qualidade' },
  { Id: 4, Name: 'Logística' }
];

const mockUsers = [
  { Id: 1, first_name: 'João', last_name: 'Silva', email: 'joao@example.com' },
  { Id: 2, first_name: 'Maria', last_name: 'Santos', email: 'maria@example.com' },
  { Id: 3, first_name: 'Pedro', last_name: 'Oliveira', email: 'pedro@example.com' },
  { Id: 4, first_name: 'Ana', last_name: 'Costa', email: 'ana@example.com' }
];

const CreateTrainingModal = ({ isOpen, onClose, onSave }) => {
  const [activeSection, setActiveSection] = useState('basic');
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, questionIndex: null });
  const [areas, setAreas] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [areaFilter, setAreaFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const materialsListRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    materials: [],
    deadline: '',
    evaluationType: 'quiz',
    minScore: 70,
    assignedGroups: [],
    assignedUsers: [],
    notifications: {
      onStart: true,
      onDeadline: true,
      reminderDays: 3
    },
    questions: []
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      setLoadingAreas(true);
      setLoadingUsers(true);

      try {
        if (APP_MODE === 'PRD') {
          // Production mode - fetch from API
          const areasResponse = await fetch(`${API_URL}/api/areas/`);
          if (!areasResponse.ok) {
            throw new Error("Erro ao carregar áreas.");
          }
          const areasData = await areasResponse.json();
          setAreas(Array.isArray(areasData) ? areasData : []);

          const usersResponse = await fetch(`${API_URL}/api/users/`);
          if (!usersResponse.ok) {
            throw new Error("Erro ao carregar usuários.");
          }
          const usersData = await usersResponse.json();
          setUsers(Array.isArray(usersData) ? usersData : []);
        } else {
          // Development mode - use mock data
          setAreas(mockAreas);
          setUsers(mockUsers);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        // In DEV mode, still set mock data even if API calls fail
        if (APP_MODE !== 'PRD') {
          setAreas(mockAreas);
          setUsers(mockUsers);
        }
      } finally {
        setLoadingAreas(false);
        setLoadingUsers(false);
      }
    };

    fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (materialsListRef.current) {
      updateScrollThumbPosition();
    }
  }, [formData.materials]);

  if (!isOpen) return null;

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handleAddMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [
        ...prev.materials,
        {
          id: `material-${Date.now()}`,
          type: 'document',
          name: '',
          file: null,
          order: prev.materials.length
        }
      ]
    }));
  };

  const handleMaterialChange = (index, field, value) => {
    setFormData(prev => {
      const newMaterials = [...prev.materials];
      newMaterials[index] = {
        ...newMaterials[index],
        [field]: value
      };
      return {
        ...prev,
        materials: newMaterials
      };
    });
  };

  const handleRemoveMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleAddQuestion = () => {
    const newQuestionId = `question-${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: newQuestionId,
          text: '',
          options: [
            { id: `option-${Date.now()}-1`, text: '', isCorrect: false },
            { id: `option-${Date.now()}-2`, text: '', isCorrect: false }
          ],
          points: 10
        }
      ]
    }));
    setExpandedQuestions(prev => new Set([...prev, newQuestionId]));
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        [field]: value
      };
      return {
        ...prev,
        questions: newQuestions
      };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      const newOptions = [...newQuestions[questionIndex].options];
      
      if (field === 'isCorrect') {
        newOptions.forEach((opt, idx) => {
          opt.isCorrect = idx === optionIndex ? value : false;
        });
      } else {
        newOptions[optionIndex] = {
          ...newOptions[optionIndex],
          [field]: value
        };
      }
      
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        options: newOptions
      };
      
      return {
        ...prev,
        questions: newQuestions
      };
    });
  };

  const handleAddOption = (questionIndex) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].options.push({
        id: `option-${Date.now()}`,
        text: '',
        isCorrect: false
      });
      return {
        ...prev,
        questions: newQuestions
      };
    });
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
        (_, idx) => idx !== optionIndex
      );
      return {
        ...prev,
        questions: newQuestions
      };
    });
  };

  const handleRemoveQuestion = (questionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== questionIndex)
    }));
  };

  const handleDeleteClick = (e, questionIndex) => {
    e.stopPropagation();
    setDeleteConfirmation({ show: true, questionIndex });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.questionIndex !== null) {
      handleRemoveQuestion(deleteConfirmation.questionIndex);
    }
    setDeleteConfirmation({ show: false, questionIndex: null });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ show: false, questionIndex: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    setFormData(prev => {
      const newMaterials = Array.from(prev.materials);
      const [removed] = newMaterials.splice(sourceIndex, 1);
      newMaterials.splice(destinationIndex, 0, removed);
      
      return {
        ...prev,
        materials: newMaterials.map((material, index) => ({
          ...material,
          order: index
        }))
      };
    });

    setTimeout(() => {
      updateScrollThumbPosition();
    }, 0);
  };

  const onDragStart = () => {
    document.body.classList.add('dragging');
  };

  const handleScrollLeft = () => {
    if (materialsListRef.current) {
      const container = materialsListRef.current;
      const scrollAmount = container.clientHeight * 0.5;
      container.scrollTop = Math.max(0, container.scrollTop - scrollAmount);
      updateScrollThumbPosition();
    }
  };

  const handleScrollRight = () => {
    if (materialsListRef.current) {
      const container = materialsListRef.current;
      const scrollAmount = container.clientHeight * 0.5;
      container.scrollTop = Math.min(
        container.scrollHeight - container.clientHeight,
        container.scrollTop + scrollAmount
      );
      updateScrollThumbPosition();
    }
  };

  const updateScrollThumbPosition = () => {
    if (materialsListRef.current) {
      const container = materialsListRef.current;
      const scrollPercentage = container.scrollTop / (container.scrollHeight - container.clientHeight);
      setScrollPosition(scrollPercentage);
    }
  };

  const handleScroll = () => {
    updateScrollThumbPosition();
  };

  const sections = [
    { id: 'basic', name: 'Informações Básicas' },
    { id: 'materials', name: 'Materiais do Treinamento' },
    { id: 'deadline', name: 'Prazo e Notificações' },
    { id: 'assignment', name: 'Atribuição' },
    { id: 'evaluation', name: 'Avaliação Final' }
  ];

  return (
    <div className="modal-overlay">
      {deleteConfirmation.show && (
        <div className="delete-confirmation-modal">
          <div className="delete-confirmation-content">
            <div className="delete-confirmation-icon">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir esta questão?</p>
            <div className="delete-confirmation-actions">
              <button 
                className="cancel-delete-button"
                onClick={handleCancelDelete}
              >
                Cancelar
              </button>
              <button 
                className="confirm-delete-button"
                onClick={handleConfirmDelete}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="modal-container">
        <div className="modal-header">
          <h2>Novo Treinamento</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-content-wrapper">
          <div className="modal-sidebar">
            {sections.map(section => (
              <button
                key={section.id}
                className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span>{section.name}</span>
                <FontAwesomeIcon icon={faChevronRight} className="sidebar-icon" />
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="modal-content">
            {activeSection === 'basic' && (
              <div className="form-section">
                <h3>Informações Básicas</h3>
                <div className="form-group">
                  <label htmlFor="title">Título</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Digite o título do treinamento"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Descrição</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Digite uma descrição para o treinamento"
                    rows="3"
                    required
                  />
                </div>
              </div>
            )}

            {activeSection === 'materials' && (
              <div className="form-section">
                <h3>Materiais do Treinamento</h3>
                <div className="materials-container">
                  <DragDropContext 
                    onDragEnd={onDragEnd} 
                    onDragStart={onDragStart}
                  >
                    <Droppable droppableId="materials">
                      {(provided) => (
                        <div
                          ref={(el) => {
                            provided.innerRef(el);
                            materialsListRef.current = el;
                          }}
                          {...provided.droppableProps}
                          className="materials-list"
                          onScroll={handleScroll}
                        >
                          {formData.materials.map((material, index) => (
                            <Draggable
                              key={material.id}
                              draggableId={material.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`material-item ${snapshot.isDragging ? 'dragging' : ''}`}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="material-drag-handle"
                                  >
                                    <FontAwesomeIcon icon={faGripVertical} />
                                  </div>

                                  <div className="material-content">
                                    <div className="material-first-row">
                                      <select
                                        value={material.type}
                                        onChange={(e) => handleMaterialChange(index, 'type', e.target.value)}
                                        className="type-select"
                                      >
                                        <option value="document">Documento</option>
                                        <option value="video">Vídeo</option>
                                        <option value="link">Link</option>
                                      </select>

                                      <input
                                        type="text"
                                        value={material.name}
                                        onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
                                        placeholder="Nome do material"
                                        className="material-name-input"
                                      />
                                    </div>

                                    <div className="material-second-row">
                                      <div className="file-upload-wrapper">
                                        <input
                                          type="file"
                                          className="file-input"
                                          onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                              handleMaterialChange(index, 'file', file);
                                              if (!material.name) {
                                                handleMaterialChange(index, 'name', file.name);
                                              }
                                            }
                                          }}
                                        />
                                        <div className="file-upload-placeholder">
                                          <FontAwesomeIcon icon={faFile} />
                                          <span className="file-name">
                                            {material.file ? material.file.name : 'Selecionar arquivo'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="material-actions">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveMaterial(index)}
                                      className="remove-material-button"
                                      title="Remover material"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    {material.file && (
                                      <button
                                        type="button"
                                        onClick={() => handleMaterialChange(index, 'file', null)}
                                        className="remove-file-button"
                                        title="Remover arquivo"
                                      >
                                        <FontAwesomeIcon icon={faTimes} />
                                      </button>
                                    )}
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

                  <div className="scroll-indicator">
                    <FontAwesomeIcon 
                      icon={faChevronLeft} 
                      className="scroll-arrow left" 
                      onClick={handleScrollLeft}
                    />
                    <div className="scroll-track">
                      <div 
                        className="scroll-thumb" 
                        style={{ 
                          left: `${scrollPosition * 70}%`,
                          width: formData.materials.length > 3 ? '30%' : '60%'
                        }}
                      ></div>
                    </div>
                    <FontAwesomeIcon 
                      icon={faChevronRight} 
                      className="scroll-arrow right" 
                      onClick={handleScrollRight}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="add-material-button"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    Adicionar Material
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'deadline' && (
              <div className="form-section">
                <h3>Prazo e Notificações</h3>
                
                <div className="form-group">
                  <label htmlFor="deadline">Prazo de Conclusão</label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label>Notificações</label>
                  <div className="notifications-settings">
                    <label className="notification-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.notifications.onStart}
                        onChange={(e) => handleNotificationChange('onStart', e.target.checked)}
                      />
                      <span>Notificar no início do treinamento</span>
                    </label>
                    
                    <label className="notification-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.notifications.onDeadline}
                        onChange={(e) => handleNotificationChange('onDeadline', e.target.checked)}
                      />
                      <span>Notificar próximo ao prazo</span>
                    </label>

                    <div className="reminder-days">
                      <span>Lembrete</span>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={formData.notifications.reminderDays}
                        onChange={(e) => handleNotificationChange('reminderDays', parseInt(e.target.value))}
                        className="days-input"
                      />
                      <span>dias antes do prazo</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'assignment' && (
              <div className="form-section">
                <h3>Atribuição de Participantes</h3>

                <div className="form-group">
                  <div className="assignment-tabs">
                    <button
                      type="button"
                      className={`assignment-tab ${formData.assignmentType === 'groups' ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, assignmentType: 'groups' }))}
                    >
                      <FontAwesomeIcon icon={faUserGroup} />
                      Grupos
                    </button>
                    <button
                      type="button"
                      className={`assignment-tab ${formData.assignmentType === 'users' ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, assignmentType: 'users' }))}
                    >
                      <FontAwesomeIcon icon={faUsers} />
                      Usuários
                    </button>
                  </div>

                  {formData.assignmentType === 'groups' ? (
                    <div className="select-container">
                      <label>Selecione as áreas:</label>
                      {loadingAreas ? (
                        <div className="loading-areas">
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <span>Carregando áreas...</span>
                        </div>
                      ) : (
                        <>
                          <div className="search-filter">
                            <input
                              type="text"
                              placeholder="Filtrar áreas..."
                              value={areaFilter}
                              onChange={(e) => setAreaFilter(e.target.value)}
                              className="filter-input"
                            />
                          </div>
                          <div className="select-header">
                            <div className="selection-info">
                              <span className="selected-count">
                                {formData.assignedGroups.length} de {areas.length} áreas selecionadas
                              </span>
                            </div>
                            <div className="select-actions">
                              <button 
                                type="button"
                                className="select-all-btn"
                                onClick={() => {
                                  const filteredAreaIds = areas
                                    .filter(area => area.Name.toLowerCase().includes(areaFilter.toLowerCase()))
                                    .map(area => area.Id);
                                  setFormData(prev => ({ ...prev, assignedGroups: filteredAreaIds }));
                                }}
                              >
                                Selecionar todos
                              </button>
                              <button 
                                type="button"
                                className="clear-selection-btn"
                                onClick={() => setFormData(prev => ({ ...prev, assignedGroups: [] }))}
                              >
                                Limpar seleção
                              </button>
                            </div>
                          </div>
                          <div className="custom-select-list">
                            {areas.length > 0 ? (
                              areas
                                .filter(area => 
                                  area.Name.toLowerCase().includes(areaFilter.toLowerCase())
                                )
                                .map(area => (
                                  <div key={area.Id} className="select-item">
                                    <label className="custom-checkbox">
                                      <input
                                        type="checkbox"
                                        checked={formData.assignedGroups.includes(area.Id)}
                                        onChange={(e) => {
                                          const newGroups = e.target.checked
                                            ? [...formData.assignedGroups, area.Id]
                                            : formData.assignedGroups.filter(g => g !== area.Id);
                                          setFormData(prev => ({ ...prev, assignedGroups: newGroups }));
                                        }}
                                      />
                                      <span className="checkmark"></span>
                                      <span className="item-text">{area.Name}</span>
                                    </label>
                                  </div>
                                ))
                            ) : (
                              <div className="no-areas-message">
                                Nenhuma área encontrada. Adicione áreas no menu de gerenciamento.
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="select-container">
                      <label>Selecione os usuários:</label>
                      {loadingUsers ? (
                        <div className="loading-areas">
                          <FontAwesomeIcon icon={faSpinner} spin />
                          <span>Carregando usuários...</span>
                        </div>
                      ) : (
                        <>
                          <div className="search-filter">
                            <input
                              type="text"
                              placeholder="Filtrar usuários..."
                              value={userFilter}
                              onChange={(e) => setUserFilter(e.target.value)}
                              className="filter-input"
                            />
                          </div>
                          <div className="select-header">
                            <div className="selection-info">
                              <span className="selected-count">
                                {formData.assignedUsers.length} de {users.length} usuários selecionados
                              </span>
                            </div>
                            <div className="select-actions">
                              <button 
                                type="button"
                                className="select-all-btn"
                                onClick={() => {
                                  const filteredUserIds = users
                                    .filter(user => 
                                      (user.first_name || '').toLowerCase().includes(userFilter.toLowerCase()) ||
                                      (user.last_name || '').toLowerCase().includes(userFilter.toLowerCase()) ||
                                      (user.email || '').toLowerCase().includes(userFilter.toLowerCase())
                                    )
                                    .map(user => user.Id);
                                  setFormData(prev => ({ ...prev, assignedUsers: filteredUserIds }));
                                }}
                              >
                                Selecionar todos
                              </button>
                              <button 
                                type="button"
                                className="clear-selection-btn"
                                onClick={() => setFormData(prev => ({ ...prev, assignedUsers: [] }))}
                              >
                                Limpar seleção
                              </button>
                            </div>
                          </div>
                          <div className="custom-select-list">
                            {users.length > 0 ? (
                              users
                                .filter(user => 
                                  (user.first_name || '').toLowerCase().includes(userFilter.toLowerCase()) ||
                                  (user.last_name || '').toLowerCase().includes(userFilter.toLowerCase()) ||
                                  (user.email || '').toLowerCase().includes(userFilter.toLowerCase())
                                )
                                .map(user => (
                                  <div key={user.Id} className="select-item">
                                    <label className="custom-checkbox">
                                      <input
                                        type="checkbox"
                                        checked={formData.assignedUsers.includes(user.Id)}
                                        onChange={(e) => {
                                          const newUsers = e.target.checked
                                            ? [...formData.assignedUsers, user.Id]
                                            : formData.assignedUsers.filter(u => u !== user.Id);
                                          setFormData(prev => ({ ...prev, assignedUsers: newUsers }));
                                        }}
                                      />
                                      <span className="checkmark"></span>
                                      <span className="item-text">
                                        {user.first_name} {user.last_name} {user.email && `(${user.email})`}
                                      </span>
                                    </label>
                                  </div>
                                ))
                            ) : (
                              <div className="no-items-message">
                                Nenhum usuário encontrado.
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'evaluation' && (
              <div className="form-section">
                <h3>Avaliação Final</h3>
                
                <div className="form-group">
                  <label htmlFor="evaluationType">Tipo de Avaliação</label>
                  <select
                    id="evaluationType"
                    name="evaluationType"
                    value={formData.evaluationType}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="quiz">Questionário</option>
                    <option value="project">Projeto Prático</option>
                    <option value="presentation">Apresentação</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="minScore">Nota Mínima para Aprovação (%)</label>
                  <input
                    type="number"
                    id="minScore"
                    name="minScore"
                    value={formData.minScore}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                    max="100"
                  />
                </div>

                {formData.evaluationType === 'quiz' && (
                  <div className="questions-section">
                    <div className="questions-header">
                      <h4>Questões</h4>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="add-question-button"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                        Adicionar Questão
                      </button>
                    </div>

                    {formData.questions.map((question, questionIndex) => (
                      <div key={question.id} className="question-card">
                        <div 
                          className="question-header"
                          onClick={() => toggleQuestion(question.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="question-header-content">
                            <div className="question-number">Questão {questionIndex + 1}</div>
                            <div className="question-preview">
                              {question.text || 'Nova questão'}
                            </div>
                          </div>
                          <div className="question-header-actions">
                            <button
                              type="button"
                              onClick={(e) => handleDeleteClick(e, questionIndex)}
                              className="remove-question-button"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <FontAwesomeIcon 
                              icon={expandedQuestions.has(question.id) ? faChevronUp : faChevronDown}
                              className="expand-icon"
                            />
                          </div>
                        </div>

                        {expandedQuestions.has(question.id) && (
                          <div className="question-content">
                            <div className="form-group">
                              <label>Pergunta</label>
                              <input
                                type="text"
                                value={question.text}
                                onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                                className="form-input"
                                placeholder="Digite a pergunta"
                              />
                            </div>

                            <div className="form-group">
                              <label>Pontuação</label>
                              <input
                                type="number"
                                value={question.points}
                                onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value))}
                                className="form-input"
                                min="1"
                                max="100"
                              />
                            </div>

                            <div className="options-list">
                              {question.options.map((option, optionIndex) => (
                                <div key={option.id} className="option-item">
                                  <div className="option-content">
                                    <label className="correct-option">
                                      <input
                                        type="radio"
                                        name={`correct-${question.id}`}
                                        checked={option.isCorrect}
                                        onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                                      />
                                      <span className="radio-custom">
                                        <FontAwesomeIcon icon={faCheck} className="check-icon" />
                                      </span>
                                    </label>
                                    <input
                                      type="text"
                                      value={option.text}
                                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, 'text', e.target.value)}
                                      className="form-input"
                                      placeholder={`Opção ${optionIndex + 1}`}
                                    />
                                    {question.options.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                                        className="remove-option-button"
                                      >
                                        <FontAwesomeIcon icon={faTrash} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => handleAddOption(questionIndex)}
                                className="add-option-button"
                              >
                                <FontAwesomeIcon icon={faPlus} />
                                Adicionar Opção
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="modal-footer">
          <div className="footer-navigation">
            {activeSection !== sections[0].id && (
              <button
                type="button"
                className="nav-button prev"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  setActiveSection(sections[currentIndex - 1].id);
                  document.querySelector('.modal-content').scrollTop = 0;
                }}
              >
                <FontAwesomeIcon icon={faChevronLeft} className="nav-icon" />
                Anterior
              </button>
            )}
            {activeSection !== sections[sections.length - 1].id && (
              <button
                type="button"
                className="nav-button next"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  setActiveSection(sections[currentIndex + 1].id);
                  document.querySelector('.modal-content').scrollTop = 0;
                }}
              >
                Próximo
                <FontAwesomeIcon icon={faChevronRight} className="nav-icon" />
              </button>
            )}
          </div>
          
          <div className="steps-indicator">
            {sections.map((section, index) => (
              <div 
                key={section.id}
                className={`step-dot ${activeSection === section.id ? 'active' : ''} ${
                  sections.findIndex(s => s.id === activeSection) > index ? 'completed' : ''
                }`}
                onClick={() => {
                  setActiveSection(section.id);
                  document.querySelector('.modal-content').scrollTop = 0;
                }}
                title={section.name}
              />
            ))}
          </div>
          
          <div className="footer-actions">
            {activeSection === sections[sections.length - 1].id && (
              <button type="submit" className="save-button">
                Criar Treinamento
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrainingModal;