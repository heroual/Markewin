import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import KeywordResearch from './components/KeywordResearch';
import CompetitorBenchmarking from './components/CompetitorBenchmarking';
import LeadGeneration from './components/LeadGeneration';
import WebsiteAnalysis from './components/WebsiteAnalysis';
import MarketResearch from './components/MarketResearch';
import StrategyPlanning from './components/StrategyPlanning';
import SocialMediaPlanner from './components/SocialMediaPlanner';
import ImageGeneration from './components/ImageGeneration';
import ReelGenerator from './components/ReelGenerator';
import EmailMarketing from './components/EmailMarketing';
import CommercialEmail from './components/CommercialEmail';
import ProjectManager from './components/ProjectManager';
import ProjectDashboard from './components/ProjectDashboard';
import { Language, Project, TaskId } from './types';
import { translations } from './i18n';
import ThemeSwitcher from './components/common/ThemeSwitcher';
import LanguageSwitcher from './components/common/LanguageSwitcher';
import ProjectSelector from './components/common/ProjectSelector';
import MarkwinAgent from './components/MarkwinAgent';
import ExportModal from './components/common/ExportModal';

const App: React.FC = () => {
  const [activeTask, setActiveTask] = useState<TaskId | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [exportConfig, setExportConfig] = useState<{ reportData: any; reportType: TaskId; projectName: string; reportTitle: string; } | null>(null);

  useEffect(() => {
    const savedProjects = localStorage.getItem('markwin-projects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setProjects(parsedProjects);
      // Set the first project as active if none is selected
      if (!activeProjectId && parsedProjects.length > 0) {
        setActiveProjectId(parsedProjects[0].id);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('markwin-projects', JSON.stringify(projects));
  }, [projects]);
  
  const handleSetActiveTask = (task: TaskId | null) => {
    setActiveTask(task);
    setIsSidebarOpen(false); // Close sidebar on task selection
  }

  const handleCreateProject = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = { ...projectData, id: `proj_${Date.now()}` };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setActiveTask(null); // Ensure dashboard is shown
  };

  const handleUpdateProject = (projectId: string, data: Partial<Omit<Project, 'id' | 'name'>>) => {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...data } : p));
  }

  const getActiveProject = (): Project | null => {
    if (!activeProjectId) return null;
    return projects.find(p => p.id === activeProjectId) || null;
  }

  const handleProjectUpdate = (data: Partial<Omit<Project, 'id' | 'name'>>) => {
    if (activeProjectId) {
      handleUpdateProject(activeProjectId, data);
    }
  }

  const openExportModal = (reportType: TaskId, reportData: any, reportTitle: string) => {
    const activeProject = getActiveProject();
    const projectName = activeProject ? activeProject.name : (translations[language].psNoProject || "No Project");
    setExportConfig({
      reportData,
      reportType,
      projectName: projectName,
      reportTitle,
    });
  };

  const renderActiveTask = () => {
    const activeProject = getActiveProject();
    const t = translations[language];

    // If a task is selected, render it
    if (activeTask) {
        switch (activeTask) {
          case 'keyword-research':
            return <KeywordResearch language={language} activeProject={activeProject} onUpdateProject={handleProjectUpdate} onExportRequest={openExportModal} />;
          case 'competitor-benchmarking':
            return <CompetitorBenchmarking language={language} activeProject={activeProject} onUpdateProject={handleProjectUpdate} onExportRequest={openExportModal} />;
          case 'lead-generation':
            return <LeadGeneration language={language} activeProject={activeProject} onUpdateProject={handleProjectUpdate} onExportRequest={openExportModal} />;
          case 'website-analysis':
            return <WebsiteAnalysis language={language} activeProject={activeProject} onUpdateProject={handleProjectUpdate} onExportRequest={openExportModal} />;
          case 'market-research':
            return <MarketResearch language={language} activeProject={activeProject} onUpdateProject={handleProjectUpdate} onExportRequest={openExportModal} />;
          case 'strategy-planning':
            return <StrategyPlanning language={language} activeProject={activeProject} onUpdateProject={handleProjectUpdate} onExportRequest={openExportModal} />;
          case 'social-media-planner':
            return <SocialMediaPlanner language={language} activeProject={activeProject} onUpdateProject={handleProjectUpdate} onExportRequest={openExportModal} />;
          case 'image-generation':
            return <ImageGeneration language={language} activeProject={activeProject} onUpdateProject={handleProjectUpdate} />;
           case 'reel-generator':
            return <ReelGenerator language={language} activeProject={activeProject} onUpdateProject={handleProjectUpdate} />;
           case 'email-marketing':
            return <EmailMarketing language={language} activeProject={activeProject} onUpdateProject={handleProjectUpdate} onExportRequest={openExportModal} />;
           case 'commercial-email':
            return <CommercialEmail language={language} activeProject={activeProject} onUpdateProject={handleProjectUpdate} onExportRequest={openExportModal} />;
          default:
            // Fallback to project manager if task is unknown
            return <ProjectManager projects={projects} onCreateProject={handleCreateProject} language={language} />;
        }
    }

    // If no task is selected, check for an active project
    if (activeProject) {
      return <ProjectDashboard project={activeProject} language={language} setActiveTask={handleSetActiveTask} />;
    }
    
    // If no task and no project, show the project manager/welcome screen
    return <ProjectManager projects={projects} onCreateProject={handleCreateProject} language={language} />;
  };

  return (
    <div className="flex h-screen bg-beige-50 dark:bg-slate-950 font-sans">
      <Sidebar 
        activeTask={activeTask} 
        setActiveTask={handleSetActiveTask} 
        language={language}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b border-beige-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
           <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <ProjectSelector
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={(id) => {
                setActiveProjectId(id);
                setActiveTask(null); // Go to dashboard when switching projects
              }}
              language={language}
            />
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher language={language} onLanguageChange={setLanguage} />
            <ThemeSwitcher language={language} />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderActiveTask()}
        </div>
      </main>
      <MarkwinAgent language={language} />
      {exportConfig && (
        <ExportModal
          isOpen={!!exportConfig}
          onClose={() => setExportConfig(null)}
          config={exportConfig}
          language={language}
        />
      )}
    </div>
  );
};

export default App;