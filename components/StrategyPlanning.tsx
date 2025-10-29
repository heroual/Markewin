import React, { useState, useEffect } from 'react';
import { FullStrategyPlan, Language, Project, TaskId } from '../types';
import { generateStrategy } from '../services/geminiService';
import TaskCard from './common/TaskCard';
import LoadingSpinner from './common/LoadingSpinner';
import { translations } from '../i18n';
import ExportButton from './common/ExportButton';

interface StrategyPlanningProps {
    language: Language;
    activeProject: Project | null;
    onUpdateProject: (data: { strategy: FullStrategyPlan | null }) => void;
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


const StrategyPlanning: React.FC<StrategyPlanningProps> = ({ language, activeProject, onUpdateProject, onExportRequest }) => {
  const [objective, setObjective] = useState('');
  const [strategyResult, setStrategyResult] = useState<FullStrategyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  useEffect(() => {
    if (activeProject) {
        setObjective(activeProject.objective || '');
        setStrategyResult(activeProject.strategy || null);
    } else {
        setObjective('');
        setStrategyResult(null);
    }
  }, [activeProject]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective) return;
    setLoading(true);
    setStrategyResult(null);
    const result = await generateStrategy(objective);
    setStrategyResult(result);
    if(activeProject) {
        onUpdateProject({ strategy: result });
    }
    setLoading(false);
  };

  return (
    <TaskCard
      title={t.strategyPlanningName}
      description={t.strategyPlanningDescription}
      action={strategyResult && <ExportButton onClick={() => onExportRequest('strategy-planning', strategyResult, `${t.strategyPlanningName} - ${objective}`)} />}
    >
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder={t.spPlaceholder}
          className="flex-grow bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
        <button
          type="submit"
          disabled={loading || !objective}
          className="bg-accent-600 text-white font-bold py-2 px-6 rounded-md hover:bg-accent-500 disabled:bg-accent-700/50 disabled:text-white/70 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t.generating : t.spButton}
        </button>
      </form>
      
      {loading && <LoadingSpinner text={t.spLoading} />}

      {strategyResult && (
        <div className="space-y-8 animate-fade-in">
            <SectionCard title={t.spExecSummary}>
                <p className="text-slate-700 dark:text-slate-300 italic">{strategyResult.executiveSummary}</p>
            </SectionCard>

            <SectionCard title={t.spSituationAnalysis}>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Market Position</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-400">{strategyResult.situationAnalysis?.marketPosition}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SWOTList title={t.spStrengths} items={strategyResult.situationAnalysis?.swot?.strengths} color="green" />
                        <SWOTList title={t.spWeaknesses} items={strategyResult.situationAnalysis?.swot?.weaknesses} color="red" />
                        <SWOTList title={t.spOpportunities} items={strategyResult.situationAnalysis?.swot?.opportunities} color="blue" />
                        <SWOTList title={t.spThreats} items={strategyResult.situationAnalysis?.swot?.threats} color="yellow" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.spInternalFactors}</h4>
                             <ul className="space-y-1 text-sm list-disc list-inside text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-4 rounded-lg">
                                {(strategyResult.situationAnalysis?.internalFactors || []).map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.spExternalFactors}</h4>
                            <ul className="space-y-1 text-sm list-disc list-inside text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-4 rounded-lg">
                                {(strategyResult.situationAnalysis?.externalFactors || []).map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title={t.spSmartObjectives}>
                <div className="space-y-4">
                {(strategyResult.objectives || []).map((obj, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-beige-200 dark:border-slate-700">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">{obj.objective}</h4>
                        <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                            <li><span className="font-semibold text-slate-700 dark:text-slate-300">S:</span> {obj.specific}</li>
                            <li><span className="font-semibold text-slate-700 dark:text-slate-300">M:</span> {obj.measurable}</li>
                            <li><span className="font-semibold text-slate-700 dark:text-slate-300">A:</span> {obj.achievable}</li>
                            <li><span className="font-semibold text-slate-700 dark:text-slate-300">R:</span> {obj.relevant}</li>
                            <li><span className="font-semibold text-slate-700 dark:text-slate-300">T:</span> {obj.timeBound}</li>
                        </ul>
                    </div>
                ))}
                </div>
            </SectionCard>

            <SectionCard title={t.spStrategicApproach}>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-lg font-bold text-accent-700 dark:text-accent-500">{strategyResult.strategicApproach?.approach}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic my-2">{strategyResult.strategicApproach?.justification}</p>
                    <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-3">Key Pillars:</h5>
                    <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300">
                        {(strategyResult.strategicApproach?.keyPillars || []).map((pillar, i) => <li key={i}>{pillar}</li>)}
                    </ul>
                </div>
            </SectionCard>
            
            <SectionCard title={t.spActionPlan}>
                 <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-slate-800 text-sm">
                        <thead className="bg-beige-200 dark:bg-slate-700/50">
                            <tr>
                                <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.spActionStep}</th>
                                <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.spActionTimeline}</th>
                                <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.spActionResponsibility}</th>
                                <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.spActionKpi}</th>
                                <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.spActionBudget}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-beige-200 dark:divide-slate-700">
                        {(strategyResult.actionPlan || []).map((item, i) => (
                            <tr key={i}>
                                <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{item.step}</td>
                                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{item.timeline}</td>
                                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{item.responsibility}</td>
                                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{item.kpi}</td>
                                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{item.budget}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                 </div>
            </SectionCard>

            <SectionCard title={t.spRiskManagement}>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-slate-800 text-sm">
                        <thead className="bg-beige-200 dark:bg-slate-700/50">
                            <tr>
                                <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.spRisk}</th>
                                <th className="text-left font-semibold px-4 py-2 text-slate-700 dark:text-slate-200">{t.spRiskMitigation}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-beige-200 dark:divide-slate-700">
                        {(strategyResult.riskManagement || []).map((item, i) => (
                            <tr key={i}>
                                <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{item.risk}</td>
                                <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{item.mitigation}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                 </div>
            </SectionCard>
            
            <SectionCard title={t.spConclusion}>
                <p className="text-slate-700 dark:text-slate-300 text-sm">{strategyResult.conclusionAndRecommendations}</p>
            </SectionCard>

            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 mt-4 border-t border-beige-200 dark:border-slate-700">
              <p>{t.disclaimer}: {t.spDisclaimer}</p>
            </div>
        </div>
      )}
    </TaskCard>
  );
};

export default StrategyPlanning;