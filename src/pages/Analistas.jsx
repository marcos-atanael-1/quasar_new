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
  faEye,
  faEyeSlash,
  faUser,
  faEnvelope,
  faLock,
  faIdCard,
  faBriefcase,
  faToggleOn,
  faBuilding,
  faSitemap,
  faCheck,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import './Analistas.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Analistas = () => {
  const navigate = useNavigate();
  const [analysts, setAnalysts] = useState([]);
  const [filteredAnalysts, setFilteredAnalysts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  const [areas, setAreas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    roleId: 2,
    status: 1,
    Company_ID: "",
    Area_ID: ""
  });

  // Efeito para carregar analistas, empresas e áreas
  useEffect(() => {
    fetchAnalysts();
    fetchCompanies();
    fetchAreas();
  }, []);

  // Efeito para filtrar analistas com base na pesquisa
  useEffect(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = analysts.filter(
      (analyst) =>
        analyst.username.toLowerCase().includes(lowerCaseSearch) ||
        analyst.email.toLowerCase().includes(lowerCaseSearch) ||
        (analyst.first_name && analyst.first_name.toLowerCase().includes(lowerCaseSearch)) ||
        (analyst.last_name && analyst.last_name.toLowerCase().includes(lowerCaseSearch))
    );
    setFilteredAnalysts(filtered);
  }, [searchTerm, analysts]);

  // Função para buscar analistas da API
  const fetchAnalysts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/`);
      if (!response.ok) {
        throw new Error("Erro ao carregar analistas.");
      }
      const data = await response.json();
      const filtered = data.filter((user) => user.roleId === 1 || user.roleId === 2);
      setAnalysts(filtered);
      setFilteredAnalysts(filtered);
    } catch (error) {
      console.error("Erro ao buscar analistas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar empresas da API
  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_URL}/api/companies/`);
      if (!response.ok) {
        throw new Error("Erro ao carregar empresas.");
      }
      const data = await response.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      setCompanies([]);
    }
  };

  // Função para buscar áreas da API
  const fetchAreas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/areas/`);
      if (!response.ok) {
        throw new Error("Erro ao carregar áreas.");
      }
      const data = await response.json();
      setAreas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar áreas:", error);
      setAreas([]);
    }
  };

  // Função para lidar com mudanças nos campos do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Função para adicionar ou editar um analista
  const handleAddOrEditAnalyst = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = editMode ? "PUT" : "POST";
      const endpoint = editMode
        ? `${API_URL}/api/users/${formData.id}`
        : `${API_URL}/api/users/create`;

      const requestBody = { ...formData };
      // Se estiver editando e a senha estiver vazia, remova-a do objeto de requisição
      if (editMode && !requestBody.password) {
        delete requestBody.password;
      }

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert(editMode ? "Usuário atualizado com sucesso!" : "Analista cadastrado com sucesso!");
        setFormData({
          id: "",
          username: "",
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          roleId: 2,
          status: 1,
          Company_ID: "",
          Area_ID: ""
        });
        setEditMode(false);
        fetchAnalysts();
        setShowModal(false);
      } else {
        const error = await response.json();
        alert(error.detail || "Erro ao salvar analista.");
      }
    } catch (error) {
      console.error("Erro ao salvar analista:", error);
      alert("Erro ao salvar analista: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função para editar um analista existente
  const handleEditAnalyst = (analyst) => {
    setFormData({
      id: analyst.Id,
      username: analyst.username,
      email: analyst.email,
      password: "",
      first_name: analyst.first_name || "",
      last_name: analyst.last_name || "",
      roleId: analyst.roleId,
      status: analyst.status,
      Company_ID: analyst.company?.Id || "",
      Area_ID: analyst.area?.Id || ""
    });
    setEditMode(true);
    setShowModal(true);
  };

  // Função para excluir um analista
  const handleDeleteAnalyst = async (id) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este analista?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${id}`, { method: "DELETE" });
      if (response.ok) {
        alert("Analista excluído com sucesso!");
        fetchAnalysts();
      } else {
        alert("Erro ao excluir analista.");
      }
    } catch (error) {
      console.error("Erro ao excluir analista:", error);
      alert("Erro ao excluir analista: " + error.message);
    }
  };

  // Função para lidar com o logout
  const handleLogout = () => {
    // Implementar logout
    navigate('/login');
  };

  // Toggle para mostrar/ocultar senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="analistas-container">
      <Header onLogout={handleLogout} />
      
      <main className="analistas-content">
        {loading && (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
            <p>Carregando analistas</p>
          </div>
        )}
        
        {!loading && (
          <div className="content-card">
            <div className="card-header">
              <h2>Analistas</h2>
              <div className="header-actions">
                <div className="search-box">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Pesquisar analistas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="add-button" onClick={() => setShowModal(true)}>
                  <FontAwesomeIcon icon={faPlus} /> Adicionar Analista
                </button>
              </div>
            </div>
            
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome de Usuário</th>
                    <th>Email</th>
                    <th>Nome Completo</th>
                    <th>Área</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnalysts.length > 0 ? (
                    filteredAnalysts.map((analyst) => (
                      <tr key={analyst.Id}>
                        <td>{analyst.Id}</td>
                        <td>{analyst.username}</td>
                        <td>{analyst.email}</td>
                        <td>{`${analyst.first_name || ''} ${analyst.last_name || ''}`.trim() || "-"}</td>
                        <td>{analyst.area?.Name || "-"}</td>
                        <td className="action-cell">
                          <button className="action-button edit" onClick={() => handleEditAnalyst(analyst)}>
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="action-button delete" onClick={() => handleDeleteAnalyst(analyst.Id)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        Nenhum analista encontrado
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
          <div className="modal-content analyst-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editMode ? (
                  <><FontAwesomeIcon icon={faEdit} /> Editar Analista</>
                ) : (
                  <><FontAwesomeIcon icon={faPlus} /> Adicionar Analista</>
                )}
              </h3>
              <button className="close-button" onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleAddOrEditAnalyst}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username"><FontAwesomeIcon icon={faUser} /> Nome de Usuário</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Digite o nome de usuário"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email"><FontAwesomeIcon icon={faEnvelope} /> Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Digite o email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group password-group">
                <label htmlFor="password"><FontAwesomeIcon icon={faLock} /> Senha {editMode && "(deixe em branco para manter a atual)"}</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Digite a senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editMode}
                  />
                  <button 
                    type="button" 
                    className="toggle-password" 
                    onClick={togglePasswordVisibility}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name"><FontAwesomeIcon icon={faIdCard} /> Primeiro Nome</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    placeholder="Digite o primeiro nome"
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last_name"><FontAwesomeIcon icon={faIdCard} /> Último Nome</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    placeholder="Digite o último nome"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="roleId"><FontAwesomeIcon icon={faBriefcase} /> Função</label>
                  <select
                    id="roleId"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="1">Administrador</option>
                    <option value="2">Analista</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status"><FontAwesomeIcon icon={faToggleOn} /> Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="1">Ativo</option>
                    <option value="0">Inativo</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="Company_ID"><FontAwesomeIcon icon={faBuilding} /> Empresa</label>
                  <select
                    id="Company_ID"
                    name="Company_ID"
                    value={formData.Company_ID}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione uma empresa</option>
                    {companies.map((company) => (
                      <option key={company.Id} value={company.Id}>
                        {company.Company_Name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="Area_ID"><FontAwesomeIcon icon={faSitemap} /> Área</label>
                  <select
                    id="Area_ID"
                    name="Area_ID"
                    value={formData.Area_ID}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione uma área</option>
                    {areas.map((area) => (
                      <option key={area.Id} value={area.Id}>
                        {area.Name}
                      </option>
                    ))}
                  </select>
                </div>
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

export default Analistas; 