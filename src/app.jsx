import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App'
import './pages/LandingPage.css'
import './pages/Login.css'
import VisualizarRespostas from './pages/VisualizarRespostas'
import Responder from './pages/Responder'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Redirect to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checklists" element={<Checklists />} />
        <Route path="/checklists/responses" element={<ChecklistResponses />} />
        <Route path="/checklists/:id/respostas" element={<Responder />} />
        <Route path="/visualizarrespostas/:id" element={<VisualizarRespostas />} />
        <Route path="/planos" element={<PlanosAcao />} />
      </Routes>
    </Router>
  </React.StrictMode>
)