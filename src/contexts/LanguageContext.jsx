import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const languages = {
  'pt-BR': {
    name: 'Português',
    flag: '🇧🇷',
    translations: {
      // Landing Page
      inicio: 'Início',
      sobreNos: 'Sobre Nós',
      sistemas: 'Sistemas',
      faleConosco: 'Fale Conosco',
      login: 'Login',
      subtitle: 'Sistema de Auditoria',
      description: 'Transforme sua gestão da qualidade com a solução completa para implementação, monitoramento e melhoria contínua do programa 5S',
      checklistsTitle: 'Checklists Dinâmicos',
      checklistsDesc: 'Crie e personalize checklists para auditorias 5S em diferentes áreas, compare com padrões estabelecidos',
      captureTitle: 'Captura e Documentação',
      captureDesc: 'Registre não-conformidades com fotos, adicione descrições detalhadas diretamente no aplicativo',
      actionPlansTitle: 'Planos de Ação',
      actionPlansDesc: 'Gerencie ações corretivas, atribua responsáveis, defina prazos e acompanhe a implementação em tempo real',
      dashboardTitle: 'Dashboard Inteligente',
      dashboardDesc: 'Visualize indicadores de desempenho, métricas de progresso e acompanhe tendências em tempo real',
      exploreSystem: 'Explorar Sistema',
      requestDemo: 'Solicitar Demo',
      footer: 'Simplifique • Padronize • Melhore',

      // Login Page
      welcome: 'Bem-vindo',
      accessSystem: 'Acesse o sistema de auditoria 5S',
      username: 'Nome de Usuário',
      password: 'Senha',
      forgot: 'Esqueceu?',
      rememberMe: 'Lembrar acesso',
      enter: 'Entrar',
      authorizedOnly: 'Acesso apenas para usuários autorizados',

      // Dashboard
      dashboard: 'Dashboard',
      checklists: 'Checklists',
      actionPlans: 'Planos de Ação',
      reports: 'Relatórios',
      search: 'Pesquisar...',
      profile: 'Perfil',
      lastUpdate: 'Atualizado',
      metrics: {
        score: 'PONTUAÇÃO 5S',
        actions: 'TOTAL DE AÇÕES',
        completed: 'AÇÕES CONCLUÍDAS',
        pending: 'AÇÕES PENDENTES'
      }
    }
  },
  'en': {
    name: 'English',
    flag: '🇺🇸',
    translations: {
      // Landing Page
      inicio: 'Home',
      sobreNos: 'About Us',
      sistemas: 'Systems',
      faleConosco: 'Contact Us',
      login: 'Login',
      subtitle: 'Audit System',
      description: 'Transform your quality management with the complete solution for implementing, monitoring, and continuously improving the 5S program',
      checklistsTitle: 'Dynamic Checklists',
      checklistsDesc: 'Create and customize checklists for 5S audits in different areas, compare with established standards',
      captureTitle: 'Capture and Documentation',
      captureDesc: 'Record non-conformities with photos, add detailed descriptions directly in the application',
      actionPlansTitle: 'Action Plans',
      actionPlansDesc: 'Manage corrective actions, assign responsibilities, set deadlines, and monitor implementation in real-time',
      dashboardTitle: 'Smart Dashboard',
      dashboardDesc: 'Visualize performance indicators, progress metrics, and track trends in real-time',
      exploreSystem: 'Explore System',
      requestDemo: 'Request Demo',
      footer: 'Simplify • Standardize • Improve',

      // Login Page
      welcome: 'Welcome',
      accessSystem: 'Access the 5S audit system',
      username: 'Username',
      password: 'Password',
      forgot: 'Forgot?',
      rememberMe: 'Remember me',
      enter: 'Enter',
      authorizedOnly: 'Access for authorized users only',

      // Dashboard
      dashboard: 'Dashboard',
      checklists: 'Checklists',
      actionPlans: 'Action Plans',
      reports: 'Reports',
      search: 'Search...',
      profile: 'Profile',
      lastUpdate: 'Updated',
      metrics: {
        score: '5S SCORE',
        actions: 'TOTAL ACTIONS',
        completed: 'COMPLETED ACTIONS',
        pending: 'PENDING ACTIONS'
      }
    }
  },
  'es': {
    name: 'Español',
    flag: '🇪🇸',
    translations: {
      // Landing Page
      inicio: 'Inicio',
      sobreNos: 'Sobre Nosotros',
      sistemas: 'Sistemas',
      faleConosco: 'Contáctenos',
      login: 'Iniciar Sesión',
      subtitle: 'Sistema de Auditoría',
      description: 'Transforme su gestión de calidad con la solución completa para implementar, monitorear y mejorar continuamente el programa 5S',
      checklistsTitle: 'Listas de Verificación Dinámicas',
      checklistsDesc: 'Cree y personalice listas de verificación para auditorías 5S en diferentes áreas, compare con estándares establecidos',
      captureTitle: 'Captura y Documentación',
      captureDesc: 'Registre no conformidades con fotos, agregue descripciones detalladas directamente en la aplicación',
      actionPlansTitle: 'Planes de Acción',
      actionPlansDesc: 'Gestione acciones correctivas, asigne responsables, establezca plazos y monitoree la implementación en tiempo real',
      dashboardTitle: 'Panel Inteligente',
      dashboardDesc: 'Visualice indicadores de desempeño, métricas de progreso y siga tendencias en tiempo real',
      exploreSystem: 'Explorar Sistema',
      requestDemo: 'Solicitar Demo',
      footer: 'Simplificar • Estandarizar • Mejorar',

      // Login Page
      welcome: 'Bienvenido',
      accessSystem: 'Acceda al sistema de auditoría 5S',
      username: 'Nombre de Usuario',
      password: 'Contraseña',
      forgot: '¿Olvidó?',
      rememberMe: 'Recordar acceso',
      enter: 'Entrar',
      authorizedOnly: 'Acceso solo para usuarios autorizados',

      // Dashboard
      dashboard: 'Panel',
      checklists: 'Listas de Verificación',
      actionPlans: 'Planes de Acción',
      reports: 'Informes',
      search: 'Buscar...',
      profile: 'Perfil',
      lastUpdate: 'Actualizado',
      metrics: {
        score: 'PUNTUACIÓN 5S',
        actions: 'TOTAL DE ACCIONES',
        completed: 'ACCIONES COMPLETADAS',
        pending: 'ACCIONES PENDIENTES'
      }
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'pt-BR';
  });

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  const value = {
    currentLanguage,
    setCurrentLanguage,
    t: (key) => {
      const keys = key.split('.');
      let translation = languages[currentLanguage].translations;
      
      for (const k of keys) {
        if (translation[k] === undefined) return key;
        translation = translation[k];
      }
      
      return translation;
    }
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};