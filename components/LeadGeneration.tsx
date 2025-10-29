import React, { useState, useEffect } from 'react';
import { LeadGenerationStrategyReport, Language, Project, LeadFunnelStage, KeywordTarget, SearchIntent, TaskId } from '../types';
import { generateLeadGenerationStrategy } from '../services/geminiService';
import TaskCard from './common/TaskCard';
import LoadingSpinner from './common/LoadingSpinner';
import { translations } from '../i18n';
import InfoTooltip from './common/InfoTooltip';
import ExportButton from './common/ExportButton';

interface LeadGenerationProps {
    language: Language;
    activeProject: Project | null;
    onUpdateProject: (data: { leadGenerationStrategy: LeadGenerationStrategyReport | null }) => void;
    onExportRequest: (reportType: TaskId, reportData: any, reportTitle: string) => void;
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-beige-100/70 dark:bg-slate-800/50 p-6 rounded-xl border border-beige-200 dark:border-slate-700 ${className}`}>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-beige-300 dark:border-slate-600 pb-2">{title}</h3>
        {children}
    </div>
);

const formatCpc = (cpc: any): string => {
    if (cpc === null || cpc === undefined) return 'N/A';
    const num = Number(String(cpc).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 'N/A' : `$${num.toFixed(2)}`;
};

const LeadGeneration: React.FC<LeadGenerationProps> = ({ language, activeProject, onUpdateProject, onExportRequest }) => {
  const [industry, setIndustry] = useState('');
  const [report, setReport] = useState<LeadGenerationStrategyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  useEffect(() => {
    if (activeProject) {
        setIndustry(activeProject.industry || '');
        setReport(activeProject.leadGenerationStrategy || null);
    } else {
        setIndustry('');
        setReport(null);
    }
  }, [activeProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry) return;
    setLoading(true);
    setReport(null);
    const results = await generateLeadGenerationStrategy(industry);
    setReport(results);
    if (activeProject) {
        onUpdateProject({ leadGenerationStrategy: results });
    }
    setLoading(false);
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
  
   const getOpportunityClass = (opportunity: string) => {
    switch (opportunity?.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };
  
  const getFunnelStageColor = (stage: LeadFunnelStage['stage']) => {
    switch (stage) {
        case 'Awareness': return 'border-blue-500';
        case 'Interest': return 'border-purple-500';
        case 'Decision': return 'border-yellow-500';
        case 'Action': return 'border-green-500';
        default: return 'border-slate-500';
    }
  }

  return (
    <TaskCard
      title={t.leadGenerationName}
      description={t.leadGenerationDescription}
      action={report && <ExportButton onClick={() => onExportRequest('lead-generation', report, `${t.leadGenerationName} - ${industry}`)} />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          placeholder={t.lgPlaceholder}
          className="flex-grow bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <button
          type="submit"
          disabled={loading || !industry}
          className="bg-accent-600 text-white font-bold py-2 px-6 rounded-md hover:bg-accent-500 disabled:bg-accent-700/50 disabled:text-white/70 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t.finding : t.lgButton}
        </button>
      </form>
      
      {loading && <LoadingSpinner text={t.lgLoading} />}

      {report && (
        <div className="space-y-8 animate-fade-in">
          <SectionCard title={t.lgICPTitle}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Demographics</h4>
                      <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">{(report.idealCustomerProfile?.demographics || []).map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Interests & Behaviors</h4>
                      <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">{(report.idealCustomerProfile?.interestsAndBehaviors || []).map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Pain Points & Needs</h4>
                      <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">{(report.idealCustomerProfile?.painPointsAndNeeds || []).map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
              </div>
          </SectionCard>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title={t.lgLeadSourcesTitle}>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1 text-sm">{(report.leadSources || []).map((item, i) => <li key={i}>{item}</li>)}</ul>
            </SectionCard>
            <SectionCard title={t.lgLeadMagnetsTitle}>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1 text-sm">{(report.leadMagnets || []).map((item, i) => <li key={i}>{item}</li>)}</ul>
            </SectionCard>
          </div>
          
          <SectionCard title={t.lgFunnelTitle}>
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-4">
                {(report.leadFunnelStrategy || []).map((stage, i) => (
                    <div key={i} className={`flex-1 bg-white dark:bg-slate-800 p-4 rounded-lg border-t-4 ${getFunnelStageColor(stage.stage)}`}>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">{stage.stage}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{stage.contentAndMessaging}</p>
                        <p className="text-xs font-bold text-accent-700 dark:text-accent-500 mt-3 border-t border-beige-200 dark:border-slate-700 pt-2">CTA: {stage.callToAction}</p>
                    </div>
                ))}
            </div>
          </SectionCard>

          <SectionCard title={t.lgKeywordsTitle}>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-beige-200 dark:bg-slate-700/50">
                      <tr>
                        <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.krTableKeyword}</th>
                        <th className="text-right font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">
                           <div className="flex items-center justify-end">
                             {t.krTableVolume}
                             <InfoTooltip text={t.dataDisclaimerContent} />
                           </div>
                        </th>
                        <th className="text-right font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">
                            <div className="flex items-center justify-end">
                                {t.krTableCpc}
                                <InfoTooltip text={t.dataDisclaimerContent} />
                            </div>
                        </th>
                        <th className="text-center font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.krTableIntent}</th>
                        <th className="text-center font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.krTableOpportunity}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-beige-200 dark:divide-slate-700">
                      {(report.keywordTargeting || []).map((kw, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 font-medium">{kw.keyword}</td>
                          <td className="px-4 py-2 text-right">{kw.volume.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right">{formatCpc(kw.cpc)}</td>
                          <td className="px-4 py-2 text-center">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getIntentClass(kw.intent)}`}>{kw.intent}</span>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getOpportunityClass(kw.opportunity)}`}>{kw.opportunity}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                </table>
            </div>
          </SectionCard>

           <SectionCard title={t.lgSummaryTableTitle}>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-beige-200 dark:bg-slate-700/50">
                      <tr>
                        <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.lgTableSource}</th>
                        <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.lgTableKeyword}</th>
                        <th className="text-right font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">
                           <div className="flex items-center justify-end">
                             {t.lgTableCPC}
                             <InfoTooltip text={t.dataDisclaimerContent} />
                           </div>
                        </th>
                        <th className="text-center font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.lgTablePotential}</th>
                        <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.lgTableNotes}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-beige-200 dark:divide-slate-700">
                      {(report.summaryTable || []).map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 font-medium">{item.source}</td>
                          <td className="px-4 py-2">{item.keywordOrInterest}</td>
                          <td className="px-4 py-2 text-right">{formatCpc(item.cpc)}</td>
                          <td className="px-4 py-2 text-center">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getOpportunityClass(item.potential)}`}>{item.potential}</span>
                          </td>
                          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{item.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                </table>
            </div>
          </SectionCard>
          
           <SectionCard title={t.lgTopOpportunitiesTitle}>
                <ul className="space-y-2">
                    {(report.topOpportunities || []).map((opp, i) => (
                        <li key={i} className="flex items-start p-3 bg-white dark:bg-slate-800 rounded-lg">
                            <span className="bg-accent-600 text-white font-bold rounded-full h-6 w-6 text-sm flex items-center justify-center mr-3 flex-shrink-0">{i + 1}</span>
                            <span className="text-slate-700 dark:text-slate-300 text-sm">{opp}</span>
                        </li>
                    ))}
                </ul>
           </SectionCard>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-beige-200 dark:border-slate-700">
            <p>{t.disclaimer}: {t.lgDisclaimer}</p>
          </div>
        </div>
      )}
    </TaskCard>
  );
};

export default LeadGeneration;