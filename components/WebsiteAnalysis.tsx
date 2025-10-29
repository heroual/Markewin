import React, { useState, useEffect } from 'react';
import { WebsiteAnalysisReport, Language, Project, SearchIntent, TaskId } from '../types';
import { analyzeWebsite } from '../services/geminiService';
import TaskCard from './common/TaskCard';
import LoadingSpinner from './common/LoadingSpinner';
import { translations } from '../i18n';
import InfoTooltip from './common/InfoTooltip';
import ExportButton from './common/ExportButton';

interface WebsiteAnalysisProps {
    language: Language;
    activeProject: Project | null;
    onUpdateProject: (data: { websiteAnalysis: WebsiteAnalysisReport | null }) => void;
    onExportRequest: (reportType: TaskId, reportData: any, reportTitle: string) => void;
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-beige-100/70 dark:bg-slate-800/50 p-6 rounded-xl border border-beige-200 dark:border-slate-700 ${className}`}>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-beige-300 dark:border-slate-600 pb-2">{title}</h3>
        {children}
    </div>
);

const ReportSection: React.FC<{title: string, evaluation: string[] | undefined, recommendations: string[] | undefined, language: Language}> = ({ title, evaluation, recommendations, language }) => {
    const t = translations[language];
    return (
        <SectionCard title={title}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.waEvaluation}</h4>
                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        {(evaluation || []).map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-accent-700 dark:text-accent-500 mb-2">{t.waRecommendations}</h4>
                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        {(recommendations || []).map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
            </div>
        </SectionCard>
    );
};

const WebsiteAnalysis: React.FC<WebsiteAnalysisProps> = ({ language, activeProject, onUpdateProject, onExportRequest }) => {
  const [url, setUrl] = useState('');
  const [report, setReport] = useState<WebsiteAnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  useEffect(() => {
    if (activeProject) {
        setUrl(activeProject.websiteUrl || '');
        setReport(activeProject.websiteAnalysis || null);
    } else {
        setUrl('');
        setReport(null);
    }
  }, [activeProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setReport(null);
    const result = await analyzeWebsite(url);
    setReport(result);
    if (activeProject) {
        onUpdateProject({ websiteAnalysis: result });
    }
    setLoading(false);
  };
  
    const formatCpc = (cpc: any): string => {
        if (cpc === null || cpc === undefined) return 'N/A';
        const num = Number(String(cpc).replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 'N/A' : `$${num.toFixed(2)}`;
    };

    const getIntentClass = (intent: SearchIntent | string) => {
        switch (intent) {
            case 'Informational': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
            case 'Commercial': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
            case 'Transactional': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
            case 'Navigational': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
        }
    };
    
    const getImpactClass = (impact: 'High' | 'Medium' | 'Low') => {
        switch (impact) {
          case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
          case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
          case 'Low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
          default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
        }
    };

  return (
    <TaskCard
      title={t.websiteAnalysisName}
      description={t.websiteAnalysisDescription}
      action={report && <ExportButton onClick={() => onExportRequest('website-analysis', report, `${t.websiteAnalysisName} - ${url}`)} />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t.waPlaceholder}
          className="flex-grow bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <button
          type="submit"
          disabled={loading || !url}
          className="bg-accent-600 text-white font-bold py-2 px-6 rounded-md hover:bg-accent-500 disabled:bg-accent-700/50 disabled:text-white/70 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t.auditing : t.waButton}
        </button>
      </form>
      
      {loading && <LoadingSpinner text={t.waLoading} />}

      {report && (
        <div className="space-y-8 animate-fade-in">
            <SectionCard title={t.waGeneralOverview}>
                <div className="space-y-2 text-sm">
                    <p><span className="font-semibold text-slate-800 dark:text-slate-200">Description:</span> {report.generalOverview?.description}</p>
                    <p><span className="font-semibold text-slate-800 dark:text-slate-200">Main Goal:</span> {report.generalOverview?.mainGoal}</p>
                </div>
            </SectionCard>

            <ReportSection title={t.waDesignUx} evaluation={report.designAndUx?.evaluation} recommendations={report.designAndUx?.recommendations} language={language} />
            <ReportSection title={t.waPerformance} evaluation={report.performance?.evaluation} recommendations={report.performance?.recommendations} language={language} />
            
            <SectionCard title={t.waSeoAnalysis}>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">On-Page SEO</h4>
                        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            {(report.seo?.onPage || []).map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Off-Page SEO</h4>
                        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            {(report.seo?.offPage || []).map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.waKeywordOpportunities}</h4>
                         <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-beige-200 dark:bg-slate-700/50">
                                <tr>
                                    <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.waTableKeyword}</th>
                                    <th className="text-right font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.waTableVolume}</th>
                                    <th className="text-center font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.waTableDifficulty}</th>
                                    <th className="text-right font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.waTableCpc}</th>
                                    <th className="text-center font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.waTableIntent}</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-beige-200 dark:divide-slate-700">
                                {(report.seo?.keywordOpportunities || []).map((kw, i) => (
                                    <tr key={i}>
                                    <td className="px-4 py-2 font-medium">{kw.keyword}</td>
                                    <td className="px-4 py-2 text-right">{(kw.volume || 0).toLocaleString()}</td>
                                    <td className="px-4 py-2 text-center">{kw.difficulty}/100</td>
                                    <td className="px-4 py-2 text-right">{formatCpc(kw.cpc)}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getIntentClass(kw.intent)}`}>{kw.intent}</span>
                                    </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SectionCard>

            <ReportSection title={t.waContentQuality} evaluation={report.contentQuality?.evaluation} recommendations={report.contentQuality?.recommendations} language={language} />
            <ReportSection title={t.waConversionOpt} evaluation={report.conversionOptimization?.evaluation} recommendations={report.conversionOptimization?.recommendations} language={language} />
            <ReportSection title={t.waMarketing} evaluation={report.marketingAndAnalytics?.evaluation} recommendations={report.marketingAndAnalytics?.recommendations} language={language} />
            <ReportSection title={t.waSecurity} evaluation={report.securityAndCompliance?.evaluation} recommendations={report.securityAndCompliance?.recommendations} language={language} />

            <SectionCard title={t.waActionableSummary}>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.waTopRecommendations}</h4>
                        <div className="overflow-x-auto">
                           <table className="min-w-full text-sm">
                                <thead className="bg-beige-200 dark:bg-slate-700/50">
                                <tr>
                                    <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.waTableRecommendation}</th>
                                    <th className="text-center font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.waTableImpact}</th>
                                    <th className="text-center font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.waTablePriority}</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-beige-200 dark:divide-slate-700">
                                {(report.actionableSummary?.topRecommendations || []).map((rec, i) => (
                                    <tr key={i}>
                                    <td className="px-4 py-2">{rec.recommendation}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getImpactClass(rec.impact)}`}>{rec.impact}</span>
                                    </td>
                                     <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getImpactClass(rec.priority)}`}>{rec.priority}</span>
                                    </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.wa30DayPlan}</h4>
                        <ul className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1 bg-white dark:bg-slate-800 p-4 rounded-lg">
                            {(report.actionableSummary?.thirtyDayPlan || []).map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            </SectionCard>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-beige-200 dark:border-slate-700">
                <p>{t.disclaimer}: {t.waDisclaimer}</p>
            </div>
        </div>
      )}
    </TaskCard>
  );
};

export default WebsiteAnalysis;