import React, { useState, useEffect } from 'react';
import { FullCompetitorReport, Language, Project, SWOTComparison, TaskId } from '../types';
import { generateCompetitorReport } from '../services/geminiService';
import TaskCard from './common/TaskCard';
import LoadingSpinner from './common/LoadingSpinner';
import { translations } from '../i18n';
import ExportButton from './common/ExportButton';

interface CompetitorBenchmarkingProps {
    language: Language;
    activeProject: Project | null;
    onUpdateProject: (data: { competitorReport: FullCompetitorReport | null }) => void;
    onExportRequest: (reportType: TaskId, reportData: any, reportTitle: string) => void;
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-beige-100/70 dark:bg-slate-800/50 p-6 rounded-xl border border-beige-200 dark:border-slate-700 ${className}`}>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-beige-300 dark:border-slate-600 pb-2">{title}</h3>
        {children}
    </div>
);

const SWOTList: React.FC<{ title: string; items: string[] | undefined; color: string }> = ({ title, items, color }) => (
    <div className={`bg-${color}-50 dark:bg-${color}-900/40 p-4 rounded-lg border-l-4 border-${color}-400 dark:border-${color}-500`}>
        <h4 className={`text-lg font-semibold text-${color}-800 dark:text-${color}-200 mb-2`}>{title}</h4>
        <ul className="space-y-1 text-sm list-disc list-inside text-slate-700 dark:text-slate-300">
            {(items || []).map((item, i) => <li key={i}>{item}</li>)}
        </ul>
    </div>
);

const CompetitorBenchmarking: React.FC<CompetitorBenchmarkingProps> = ({ language, activeProject, onUpdateProject, onExportRequest }) => {
  const [description, setDescription] = useState('');
  const [report, setReport] = useState<FullCompetitorReport | null>(null);
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  useEffect(() => {
    if (activeProject) {
        const defaultDesc = `A company in the ${activeProject.industry} industry, focusing on ${activeProject.objective}. Our website is ${activeProject.websiteUrl}.`;
        setDescription(defaultDesc);
        setReport(activeProject.competitorReport || null);
    } else {
        setDescription('A company in the tourism and event industry in Morocco, offering cultural experiences, traditional photo sessions, tours, and events.');
        setReport(null);
    }
  }, [activeProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    setLoading(true);
    setReport(null);
    try {
        const result = await generateCompetitorReport(description);
        setReport(result);
        if (result && activeProject) {
            onUpdateProject({ competitorReport: result });
        }
    } catch(error) {
        console.error("Report generation failed", error);
    }
    setLoading(false);
  };

  return (
    <TaskCard
      title={t.competitorBenchmarkingName}
      description={t.competitorBenchmarkingDescription}
      action={report && <ExportButton onClick={() => onExportRequest('competitor-benchmarking', report, t.competitorBenchmarkingName)} />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.cbPlaceholder}
          rows={4}
          className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <button
          type="submit"
          disabled={loading || !description}
          className="bg-accent-600 text-white font-bold py-2 px-6 rounded-md hover:bg-accent-500 disabled:bg-accent-700/50 disabled:text-white/70 disabled:cursor-not-allowed transition-colors self-start"
        >
          {loading ? t.analyzing : t.cbButton}
        </button>
      </form>
      
      {loading && <LoadingSpinner text={t.cbLoading} />}

      {report && (
        <div className="space-y-8 animate-fade-in">
          {/* Executive Summary */}
          <SectionCard title={t.cbExecSummary}>
            <p className="text-slate-700 dark:text-slate-300 italic">{report.executiveSummary}</p>
          </SectionCard>

          {/* Market Overview */}
          <SectionCard title={t.cbMarketOverview}>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">Market Size & Growth</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{report.marketOverview?.marketSizeAndGrowth}</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">Key Trends & Innovations</h4>
                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400">
                    {report.marketOverview?.keyTrendsAndInnovations?.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">Customer Behaviors</h4>
                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400">
                    {report.marketOverview?.customerBehaviors?.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            </div>
          </SectionCard>
          
          {/* Competitor Profiles */}
          <SectionCard title={t.cbCompetitorProfiles}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(report.competitors || []).map((comp, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-beige-200 dark:border-slate-700 space-y-3">
                        <h4 className="text-lg font-bold text-accent-700 dark:text-accent-500">{comp.companyName} <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2 capitalize">({comp.positioning})</span></h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{comp.description}</p>
                        <div>
                            <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Core Services:</h5>
                            <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400">
                                {comp.coreServices?.map((s, si) => <li key={si}>{s}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">USP:</h5>
                            <p className="text-xs italic text-slate-600 dark:text-slate-400">"{comp.uniqueSellingProposition}"</p>
                        </div>
                    </div>
                ))}
              </div>
          </SectionCard>

          {/* Comparative Analysis */}
          <SectionCard title={t.cbComparativeAnalysis}>
             <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-slate-800 text-sm">
                    <thead className="bg-beige-200 dark:bg-slate-700/50">
                        <tr>
                            <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">Criteria</th>
                            <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">Your Company</th>
                            {(report.competitors || []).map(c => <th key={c.companyName} className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{c.companyName}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-beige-200 dark:divide-slate-700">
                        {(report.comparativeAnalysisTable || []).map((row, i) => (
                            <tr key={i}>
                                <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{row.criteria}</td>
                                <td className="px-4 py-2 text-slate-600 dark:text-slate-400 italic">{row.yourCompany}</td>
                                {(report.competitors || []).map(c => {
                                    const competitorValue = row.competitorValues?.find(rc => rc.companyName === c.companyName)?.value || 'N/A';
                                    return <td key={c.companyName} className="px-4 py-2 text-slate-600 dark:text-slate-400">{competitorValue}</td>;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
          </SectionCard>

          {/* SWOT Comparison */}
          <SectionCard title={t.cbSwot}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SWOTList title="Strengths" items={report.swotComparison?.strengths} color="green" />
              <SWOTList title="Weaknesses" items={report.swotComparison?.weaknesses} color="red" />
              <SWOTList title="Opportunities" items={report.swotComparison?.opportunities} color="blue" />
              <SWOTList title="Threats" items={report.swotComparison?.threats} color="yellow" />
            </div>
          </SectionCard>
          
          {/* Strategic Recommendations */}
          <SectionCard title={t.cbRecommendations}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-accent-700 dark:text-accent-500 mb-2">Positioning & Advantage</h4>
                    <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                        {report.strategicRecommendations?.positioningImprovements?.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-accent-700 dark:text-accent-500 mb-2">Innovation & Differentiation</h4>
                    <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                        {report.strategicRecommendations?.innovationAndDifferentiation?.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </div>
            </div>
          </SectionCard>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-beige-200 dark:border-slate-700">
            <p>{t.disclaimer}: {t.cbDisclaimer}</p>
          </div>

        </div>
      )}
    </TaskCard>
  );
};

export default CompetitorBenchmarking;