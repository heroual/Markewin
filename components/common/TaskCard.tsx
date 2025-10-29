
import React from 'react';

interface TaskCardProps {
    title: string;
    description: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}

const TaskCard: React.FC<TaskCardProps> = ({ title, description, children, action }) => {
    return (
        <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-beige-200/80 dark:bg-slate-800/60 dark:border-slate-700/80 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-beige-200 dark:border-slate-700">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
                    </div>
                    {action && <div className="ml-4 flex-shrink-0">{action}</div>}
                </div>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}

export default TaskCard;