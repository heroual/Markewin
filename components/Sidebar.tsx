import logo from '../images/logo.png';
import { MARKETING_TASKS } from '../constants';
import { Language, TaskId } from '../types';
import { translations } from '../i18n';

interface SidebarProps {
  activeTask: TaskId | null;
  setActiveTask: (task: TaskId | null) => void;
  language: Language;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTask, setActiveTask, language, isOpen, setIsOpen }) => {
  const t = translations[language];
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-10 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <nav className={`w-64 bg-beige-100 dark:bg-slate-900 flex-shrink-0 flex-col h-full border-r border-beige-200 dark:border-slate-800
        transition-transform duration-300 ease-in-out z-20 
        md:relative md:translate-x-0 
        ${isOpen ? 'fixed translate-x-0' : 'fixed -translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-beige-200 dark:border-slate-800">
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTask(null)}>
            <img src={logo} alt="Markewin Logo" className="w-8 h-8 mr-3" />
            <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t.sidebarTitle}</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {MARKETING_TASKS.map((task) => {
            const Icon = task.icon;
            const isActive = activeTask === task.id;
            return (
              <li key={task.id}>
                <button
                  onClick={() => setActiveTask(task.id)}
                  className={`w-full flex items-center p-3 rounded-lg text-left transition-colors duration-200 ${
                    isActive
                      ? 'bg-accent-600 text-white shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-beige-200/60 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-6 h-6 mr-4 flex-shrink-0" />
                  <span className="font-medium">{t[task.nameKey]}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="p-4 border-t border-beige-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>{t.sidebarFooter1}</p>
          <p>{t.sidebarFooter2}</p>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;