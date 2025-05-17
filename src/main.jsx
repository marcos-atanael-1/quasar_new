import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Checklists from "./pages/Checklists.jsx";
import ChecklistResponses from "./pages/ChecklistResponses.jsx";
import Responder from "./pages/Responder.jsx";
import VisualizarRespostas from "./pages/VisualizarRespostas.jsx";
import Training from "./pages/Training.jsx";
import TrainingDetails from "./pages/TrainingDetails.jsx";
import ActionPlans from "./pages/ActionPlans.jsx";
import Areas from "./pages/Areas.jsx";
import Analistas from "./pages/Analistas.jsx";
import './pages/LandingPage.css';
import './pages/Login.css';
import './pages/Home.css';
import './pages/Dashboard.css';
import './pages/Checklists.css';
import './pages/ChecklistResponses.css';
import './pages/Responder.css';
import './pages/VisualizarRespostas.css';
import './pages/Training.css';
import './pages/TrainingDetails.css';
import './pages/ActionPlans.css';
import './pages/Areas.css';
import './pages/Analistas.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checklists" element={<Checklists />} />
          <Route path="/checklists/responses" element={<ChecklistResponses />} />
          <Route path="/checklists/:id/responder" element={<Responder />} />
          <Route path="/checklists/:id/respostas" element={<VisualizarRespostas />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/:id" element={<TrainingDetails />} />
          <Route path="/planos" element={<ActionPlans />} />
          <Route path="/areas" element={<Areas />} />
          <Route path="/analistas" element={<Analistas />} />
        </Routes>
      </Router>
    </LanguageProvider>
  </React.StrictMode>
);