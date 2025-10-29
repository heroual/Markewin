import React, { useState, useEffect } from 'react';
import { FullMarketResearchReport, Language, Project, TaskId } from '../types';
import { researchMarket } from '../services/geminiService';
import TaskCard from './common/TaskCard';
import LoadingSpinner from './common/LoadingSpinner';
import { translations } from '../i18n';
import ExportButton from './common/ExportButton';

interface MarketResearchProps {
    language: Language;
    activeProject: Project | null;
    onUpdateProject: (data: { marketResearch: FullMarketResearchReport | null }) => void;
    onExportRequest: (reportType: TaskId, reportData: any, reportTitle: string) => void;
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-beige-100/70 dark:bg-slate-800/50 p-6 rounded-xl border border-beige-200 dark:border-slate-700 ${className}`}>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-beige-300 dark:border-slate-600 pb-2">{title}</h3>
        {children}
    </div>
);


const MarketResearch: React.FC<MarketResearchProps> = ({ language, activeProject, onUpdateProject, onExportRequest }) => {
  const [topic, setTopic] = useState('');
  const [report, setReport] = useState<FullMarketResearchReport | null>(null);
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  useEffect(() => {
    if (activeProject) {
        setTopic(activeProject.industry || '');
        setReport(activeProject.marketResearch || null);
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
    const results = await researchMarket(topic);
    setReport(results);
    if(activeProject) {
        onUpdateProject({ marketResearch: results });
    }
    setLoading(false);
  };

  return (
    <TaskCard
      title={t.marketResearchName}
      description={t.marketResearchDescription}
      action={report && <ExportButton onClick={() => onExportRequest('market-research', report, `${t.marketResearchName} - ${topic}`)} />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t.mrPlaceholder}
          className="flex-grow bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <button
          type="submit"
          disabled={loading || !topic}
          className="bg-accent-600 text-white font-bold py-2 px-6 rounded-md hover:bg-accent-500 disabled:bg-accent-700/50 disabled:text-white/70 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t.researching : t.mrButton}
        </button>
      </form>
      
      {loading && <LoadingSpinner text={t.mrLoading} />}

      {report && (
        <div className="space-y-8 animate-fade-in">
            <SectionCard title={t.mrExecSummary}>
                <p className="text-slate-700 dark:text-slate-300 italic">{report.executiveSummary}</p>
            </SectionCard>

            <SectionCard title={t.mrMarketOverview}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">{t.mrMarketSize}</h4>
                        <p className="text-lg text-accent-700 dark:text-accent-500 font-semibold">{report.marketOverview?.marketSize}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">{t.mrGrowthRate}</h4>
                        <p className="text-lg text-accent-700 dark:text-accent-500 font-semibold">{report.marketOverview?.growthRate}</p>
                    </div>
                     <div className="bg-white dark:bg-slate-800 p-4 rounded-lg md:col-span-2">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">{t.mrTrends}</h4>
                        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            {report.marketOverview?.trends?.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                     <div className="bg-white dark:bg-slate-800 p-4 rounded-lg md:col-span-2">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">{t.mrChallenges}</h4>
                        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            {report.marketOverview?.challenges?.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            </SectionCard>
            
            <SectionCard title={t.mrCompetitorAnalysis}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(report.competitorAnalysis || []).map((comp, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-beige-200 dark:border-slate-700 space-y-3">
                        <h4 className="text-lg font-bold text-accent-700 dark:text-accent-500">{comp.name}</h4>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic">Positioning: {comp.positioning}</p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-green-50 dark:bg-green-900/40 p-2 rounded">
                                <h5 className="font-semibold text-green-800 dark:text-green-200 mb-1">Strengths</h5>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                                    {(comp.strengths || []).map((s, si) => <li key={si}>{s}</li>)}
                                </ul>
                            </div>
                             <div className="bg-red-50 dark:bg-red-900/40 p-2 rounded">
                                <h5 className="font-semibold text-red-800 dark:text-red-200 mb-1">Weaknesses</h5>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                                    {(comp.weaknesses || []).map((w, wi) => <li key={wi}>{w}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title={t.mrTargetAudience}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(report.targetAudience || []).map((segment, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-beige-200 dark:border-slate-700 space-y-2">
                            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">{segment.segmentName}</h4>
                            <p className="text-sm"><span className="font-semibold">Demographics:</span> {segment.demographics}</p>
                            <p className="text-sm"><span className="font-semibold">Behavior:</span> {segment.behavior}</p>
                            <p className="text-sm"><span className="font-semibold">Pain Points:</span> {segment.painPoints}</p>
                        </div>
                    ))}
                </div>
            </SectionCard>
            
            <SectionCard title={t.mrMarketingChannels}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-accent-700 dark:text-accent-500 mb-2">Suggested Channels</h4>
                        <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                            {report.marketingChannelsAndStrategy?.suggestedChannels?.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                     <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="font-semibold text-accent-700 dark:text-accent-500 mb-2">Strategy Highlights</h4>
                        <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                            {report.marketingChannelsAndStrategy?.strategyHighlights?.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title={t.mrOpportunitiesAndThreats}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`bg-blue-50 dark:bg-blue-900/40 p-4 rounded-lg border-l-4 border-blue-400 dark:border-blue-500`}>
                      <h4 className={`text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2`}>{t.mrOpportunities}</h4>
                      <ul className="space-y-1 text-sm list-disc list-inside text-slate-700 dark:text-slate-300">
                          {(report.opportunitiesAndThreats?.opportunities || []).map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                  </div>
                   <div className={`bg-yellow-50 dark:bg-yellow-900/40 p-4 rounded-lg border-l-4 border-yellow-400 dark:border-yellow-500`}>
                      <h4 className={`text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2`}>{t.mrThreats}</h4>
                      <ul className="space-y-1 text-sm list-disc list-inside text-slate-700 dark:text-slate-300">
                          {(report.opportunitiesAndThreats?.threats || []).map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                  </div>
                </div>
            </SectionCard>

            <SectionCard title={t.mrKeyTakeaways}>
                <ul className="list-decimal list-inside text-slate-700 dark:text-slate-300 space-y-2 text-md">
                  {(report.keyTakeaways || []).map((item, i) => <li key={i} className="pl-2">{item}</li>)}
                </ul>
            </SectionCard>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 mt-4 border-t border-beige-200 dark:border-slate-700">
              <p>{t.disclaimer}: {t.mrDisclaimer}</p>
          </div>
        </div>
      )}
    </TaskCard>
  );
};

export default MarketResearch;