import React from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
    onClick: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="bg-white hover:bg-beige-100 border border-beige-200 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:border-slate-600 dark:text-slate-300 font-medium py-2 px-4 rounded-md transition-colors text-sm flex items-center gap-2"
            aria-label="Export Report"
        >
            <Download className="w-4 h-4" />
            <span>Export</span>
        </button>
    );
};

export default ExportButton;
