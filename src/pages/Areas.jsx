import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faEdit,
  faTrash,
  faPlus,
  faSpinner,
  faSave,
  faTimes,
  faUserGroup,
  faCheck,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import './Areas.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Areas = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: "",
    Name: "",
    Description: ""
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = areas.filter(
      (area) =>
        area.Name.toLowerCase().includes(lowerCaseSearch) ||
        (area.Description && area.Description.toLowerCase().includes(lowerCaseSearch))
    );
    setFilteredAreas(filtered);
  }, [searchTerm, areas]);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/areas/`);
      if (!response.ok) {
        throw new Error("Erro ao carregar áreas.");
      }
      const data = await response.json();
      setAreas(Array.isArray(data) ? data : []);
      setFilteredAreas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar áreas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddOrEditArea = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editMode ? "PUT" : "POST";
      const endpoint = editMode
        ? `${API_URL}/api/areas/${formData.id}`
        : `${API_URL}/api/areas/create`;

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: formData.Name,
          Description: formData.Description,
        }),
      });

      if (response.ok) {
        alert(editMode ? "Área atualizada com sucesso!" : "Área criada com sucesso!");
        setFormData({ id: "", Name: "", Description: "" });
        setEditMode(false);
        fetchAreas();
        setShowModal(false);
      } else {
        const error = await response.json();
        alert(error.detail || "Erro ao salvar área.");
      }
    } catch (error) {
      console.error("Erro ao salvar área:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditArea = (area) => {
    setFormData({ id: area.Id, Name: area.Name, Description: area.Description });
    setEditMode(true);
    setShowModal(true);
  };

  const handleOpenAddModal = () => {
    setFormData({ id: "", Name: "", Description: "" });
    setEditMode(false);
    setShowModal(true);
  };

  const handleDeleteArea = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir esta área?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/areas/${id}`, { method: "DELETE" });
      if (response.ok) {
        alert("Área excluída com sucesso!");
        fetchAreas();
      } else {
        alert("Erro ao excluir área.");
      }
    } catch (error) {
      console.error("Erro ao excluir área:", error);
    }
  };

  const handleLogout = () => {
    // Implementar logout
    navigate('/login');
  };

  return (
    <div className="areas-container">
      <Header onLogout={handleLogout} />
      
      <main className="areas-content">
        {loading && (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
            <p>Carregando áreas</p>
          </div>
        )}
        
        {!loading && (
          <div className="content-card">
            <div className="card-header">
              <h2>Áreas</h2>
              <p className="area-subtitle">Gerencie as áreas do programa 5S</p>
              <div className="header-actions">
                <div className="search-box">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Pesquisar áreas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="add-button" onClick={handleOpenAddModal}>
                  <FontAwesomeIcon icon={faPlus} /> Adicionar Área
                </button>
              </div>
            </div>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAreas.length > 0 ? (
                    filteredAreas.map((area) => (
                      <tr key={area.Id}>
                        <td>{area.Id}</td>
                        <td>{area.Name}</td>
                        <td>{area.Description || "-"}</td>
                        <td className="action-cell">
                          <button className="action-button edit" onClick={() => handleEditArea(area)}>
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="action-button delete" onClick={() => handleDeleteArea(area.Id)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        Nenhuma área encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editMode ? (
                  <><FontAwesomeIcon icon={faEdit} /> Editar Área</>
                ) : (
                  <><FontAwesomeIcon icon={faPlus} /> Adicionar Área</>
                )}
              </h3>
              <button className="close-button" onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleAddOrEditArea}>
              <div className="form-group">
                <label htmlFor="Name">Nome da Área</label>
                <input
                  type="text"
                  id="Name"
                  name="Name"
                  placeholder="Digite o nome da área"
                  value={formData.Name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="Description">Descrição</label>
                <input
                  type="text"
                  id="Description"
                  name="Description"
                  placeholder="Digite uma descrição para a área"
                  value={formData.Description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>
                  <FontAwesomeIcon icon={faXmark} /> Cancelar
                </button>
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 
                   editMode ? <><FontAwesomeIcon icon={faSave} /> Atualizar</> : <><FontAwesomeIcon icon={faCheck} /> Cadastrar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Areas; 