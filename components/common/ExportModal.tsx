import React, { useState, useEffect } from 'react';
import { Language, TaskId, ExportOptions } from '../../types';
import { translations } from '../../i18n';
import { exportReport } from '../../services/exportService';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: {
        reportData: any;
        reportType: TaskId;
        projectName: string;
        reportTitle: string;
    };
    language: Language;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, config, language }) => {
    const [logo, setLogo] = useState<string | undefined>(undefined);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [includeExplanations, setIncludeExplanations] = useState(true);
    const [userName, setUserName] = useState('Marketing Team');
    const [isExporting, setIsExporting] = useState(false);
    const t = translations[language];

    useEffect(() => {
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        setTheme(currentTheme);
    }, [isOpen]);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setLogo(loadEvent.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExport = async (format: 'pdf' | 'docx') => {
        setIsExporting(true);
        const options: ExportOptions = {
            logo,
            theme,
            includeExplanations,
            userName,
            projectName: config.projectName,
            reportTitle: config.reportTitle,
        };
        try {
            await exportReport(config.reportType, config.reportData, format, options);
        } catch (error) {
            console.error(`Failed to export as ${format}`, error);
            alert(`An error occurred while exporting the ${format}. Please check the console.`);
        } finally {
            setIsExporting(false);
            onClose();
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-beige-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.exportReportTitle || 'Export Report'}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t.exportReportDesc || 'Customize your document before exporting.'}</p>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.exportUserName || 'Author/Company Name'}</label>
                        <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-3 py-2 text-sm" />
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-beige-100 dark:bg-slate-700 rounded-md flex items-center justify-center overflow-hidden border border-beige-200 dark:border-slate-600">
                           {logo ? <img src={logo} alt="Logo Preview" className="w-full h-full object-contain" /> : <span className="text-xs text-slate-400">Logo</span>}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.exportLogo || 'Company Logo (Optional)'}</label>
                            <input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent-100 file:text-accent-700 hover:file:bg-accent-100/80" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.exportTheme || 'Theme'}</label>
                        <div className="flex gap-2">
                           <button onClick={() => setTheme('light')} className={`px-4 py-2 text-sm rounded-md border ${theme === 'light' ? 'bg-accent-500 text-white border-accent-500' : 'bg-white dark:bg-slate-700 border-beige-300 dark:border-slate-600'}`}>Light</button>
                           <button onClick={() => setTheme('dark')} className={`px-4 py-2 text-sm rounded-md border ${theme === 'dark' ? 'bg-accent-500 text-white border-accent-500' : 'bg-white dark:bg-slate-700 border-beige-300 dark:border-slate-600'}`}>Dark</button>
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={includeExplanations} onChange={e => setIncludeExplanations(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500" />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{t.exportIncludeNotes || 'Include explanations & notes'}</span>
                        </label>
                    </div>
                </div>
                <div className="p-4 bg-beige-50 dark:bg-slate-800/50 flex justify-end items-center gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-beige-200 dark:hover:bg-slate-700 rounded-md">{t.cancel || 'Cancel'}</button>
                    <button onClick={() => handleExport('docx')} disabled={isExporting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md disabled:opacity-50">{isExporting ? t.exporting : t.exportDocx || 'Export DOCX'}</button>
                    <button onClick={() => handleExport('pdf')} disabled={isExporting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-md disabled:opacity-50">{isExporting ? t.exporting : t.exportPdf || 'Export PDF'}</button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
