import React from 'react';
import { Language, Project } from '../../types';
import { translations } from '../../i18n';

interface ProjectSelectorProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  language: Language;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ projects, activeProjectId, onSelectProject, language }) => {
  const t = translations[language];

  return (
    <div className="relative">
      <select
        value={activeProjectId || 'none'}
        onChange={(e) => onSelectProject(e.target.value === 'none' ? null : e.target.value)}
        className="bg-white hover:bg-beige-50 border border-beige-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-300 font-medium py-2 pl-4 pr-10 rounded-md transition-colors text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent-500 min-w-[150px]"
        aria-label={t.psSelectProject}
      >
        <option value="none">{t.psNoProject}</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-slate-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.402l2.904-2.854c.436-.446 1.144-.446 1.58 0 .436.446.436 1.167 0 1.613l-3.704 3.64-3.704-3.64c-.436-.446-.436-1.167 0-1.613z" />
        </svg>
      </div>
    </div>
  );
};

export default ProjectSelector;