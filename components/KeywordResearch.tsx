import React, { useState, useEffect } from 'react';
import { KeywordReport, Language, Project, SearchIntent, TaskId } from '../types';
import { generateKeywordReport } from '../services/geminiService';
import TaskCard from './common/TaskCard';
import LoadingSpinner from './common/LoadingSpinner';
import { translations } from '../i18n';
import InfoTooltip from './common/InfoTooltip';
import ExportButton from './common/ExportButton';

interface KeywordResearchProps {
  language: Language;
  activeProject: Project | null;
  onUpdateProject: (data: { keywordReport: KeywordReport | null }) => void;
  onExportRequest: (reportType: TaskId, reportData: any, reportTitle: string) => void;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-beige-100/70 dark:bg-slate-800/50 p-5 rounded-xl border border-beige-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 border-b border-beige-300 dark:border-slate-600 pb-2">{title}</h3>
        <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">{children}</div>
    </div>
);

const formatCpc = (cpc: any): string => {
    if (cpc === null || cpc === undefined) return 'N/A';
    const num = Number(String(cpc).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 'N/A' : `$${num.toFixed(2)}`;
};

const KeywordResearch: React.FC<KeywordResearchProps> = ({ language, activeProject, onUpdateProject, onExportRequest }) => {
  const [topic, setTopic] = useState('');
  const [report, setReport] = useState<KeywordReport | null>(null);
  const [loading, setLoading] = useState(false);
  const t = translations[language];
  
  useEffect(() => {
    if (activeProject) {
        setTopic(activeProject.industry || '');
        setReport(activeProject.keywordReport || null);
    } else {
        setTopic('');
        setReport(null);
    }
  }, [activeProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setLoading(true);
    setReport(null);
    const results = await generateKeywordReport(topic);
    setReport(results);
    if (activeProject) {
        onUpdateProject({ keywordReport: results });
    }
    setLoading(false);
  };

  const getIntentClass = (intent: SearchIntent) => {
    switch (intent) {
      case 'Informational': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
      case 'Commercial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
      case 'Transactional': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      case 'Navigational': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };
  
   const getOpportunityClass = (opportunity: string) => {
    switch (opportunity?.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  return (
    <TaskCard
      title={t.keywordResearchName}
      description={t.keywordResearchDescription}
      action={report && <ExportButton onClick={() => onExportRequest('keyword-research', report, `${t.keywordResearchName} - ${topic}`)} />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t.krPlaceholder}
          className="flex-grow bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <button
          type="submit"
          disabled={loading || !topic}
          className="bg-accent-600 text-white font-bold py-2 px-6 rounded-md hover:bg-accent-500 disabled:bg-accent-700/50 disabled:text-white/70 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t.generating : t.krButton}
        </button>
      </form>

      {loading && <LoadingSpinner text={t.krLoading} />}

      {report && (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InfoCard title={t.krPainPoints}>{report.painPointsAndMotivations}</InfoCard>
                <InfoCard title={t.krTrending}>{report.trendingTopicsAndSeasonality}</InfoCard>
                <InfoCard title={t.krCompetitors}>{report.competitorInsights}</InfoCard>
                <InfoCard title={t.krOpportunities}>
                    <ul className="list-disc list-inside space-y-1">
                        {report.opportunitiesAndRecommendations?.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                </InfoCard>
            </div>
            
            <div className="overflow-x-auto bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-beige-200 dark:border-slate-700">
              <table className="min-w-full text-sm">
                <thead className="bg-beige-100 dark:bg-slate-700/50">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3 text-slate-700 dark:text-slate-200">{t.krTableKeyword}</th>
                    <th className="text-right font-semibold px-4 py-3 text-slate-700 dark:text-slate-200">
                        <div className="flex items-center justify-end">
                            {t.krTableVolume}
                            <InfoTooltip text={t.dataDisclaimerContent} />
                        </div>
                    </th>
                    <th className="text-center font-semibold px-4 py-3 text-slate-700 dark:text-slate-200">{t.krTableIntent}</th>
                    <th className="text-center font-semibold px-4 py-3 text-slate-700 dark:text-slate-200">{t.krTableDifficulty}</th>
                    <th className="text-right font-semibold px-4 py-3 text-slate-700 dark:text-slate-200">
                        <div className="flex items-center justify-end">
                            {t.krTableCpc}
                             <InfoTooltip text={t.dataDisclaimerContent} />
                        </div>
                    </th>
                    <th className="text-center font-semibold px-4 py-3 text-slate-700 dark:text-slate-200">{t.krTableOpportunity}</th>
                    <th className="text-left font-semibold px-4 py-3 text-slate-700 dark:text-slate-200">{t.krTableNotes}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-200 dark:divide-slate-700">
                  {report.keywords?.map((kw, index) => (
                    <tr key={index} className="hover:bg-beige-50 dark:hover:bg-slate-800">
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{kw.keyword}</td>
                      <td className="px-4 py-3 text-right">{kw.volume.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getIntentClass(kw.intent)}`}>
                          {kw.intent}
                        </span>
                      </td>
                       <td className="px-4 py-3 text-center">{kw.difficulty}/100</td>
                      <td className="px-4 py-3 text-right">{formatCpc(kw.cpc)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getOpportunityClass(kw.opportunity)}`}>
                            {kw.opportunity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{kw.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      )}
    </TaskCard>
  );
};

export default KeywordResearch;