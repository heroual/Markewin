// Fix: Provide full content for the EmailMarketing.tsx file.
import React, { useState, useEffect } from 'react';
import { FullEmailCampaignIdea, Language, Project, TaskId } from '../types';
import { generateEmailCampaigns } from '../services/geminiService';
import TaskCard from './common/TaskCard';
import LoadingSpinner from './common/LoadingSpinner';
import { translations } from '../i18n';
import ExportButton from './common/ExportButton';

interface EmailMarketingProps {
    language: Language;
    activeProject: Project | null;
    onUpdateProject: (data: { emailCampaigns: FullEmailCampaignIdea[] }) => void;
    onExportRequest: (reportType: TaskId, reportData: any, reportTitle: string) => void;
}

const campaignGoals = ['Sales', 'Awareness', 'ReEngagement', 'ProductLaunch', 'Retention', 'Education'];

const EmailMarketing: React.FC<EmailMarketingProps> = ({ language, activeProject, onUpdateProject, onExportRequest }) => {
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('Sales');
  const [country, setCountry] = useState('');
  const [product, setProduct] = useState('');
  const [campaigns, setCampaigns] = useState<FullEmailCampaignIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const t = translations[language];

  useEffect(() => {
    if (activeProject) {
        setAudience(activeProject.industry ? `professionals in the ${activeProject.industry} industry` : '');
        setGoal(activeProject.objective.includes('launch') ? 'ProductLaunch' : 'Sales');
        setProduct(activeProject.name || '');
        setCampaigns(activeProject.emailCampaigns || []);
    } else {
        setAudience('');
        setGoal('Sales');
        setCountry('');
        setProduct('');
        setCampaigns([]);
    }
  }, [activeProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audience || !goal || !country) return;
    setLoading(true);
    setCampaigns([]);
    const results = await generateEmailCampaigns(audience, goal, country, product);
    setCampaigns(results);
    if (activeProject) {
        onUpdateProject({ emailCampaigns: results });
    }
    setLoading(false);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <TaskCard
      title={t.emailMarketingName}
      description={t.emailMarketingDescription}
      action={campaigns.length > 0 && <ExportButton onClick={() => onExportRequest('email-marketing', { campaigns }, `${t.emailMarketingName} - ${goal}`)} />}
    >
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.emAudienceLabel}</label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder={t.emAudiencePlaceholder}
                  required
                  className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.emGoalLabel}</label>
                <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    required
                    className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                   {campaignGoals.map(g => <option key={g} value={g}>{t[`emGoal${g}`]}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.emCountryLabel}</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={t.emCountryPlaceholder}
                  required
                  className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
            </div>
        </div>
         <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.emProductLabel}</label>
            <textarea
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder={t.emProductPlaceholder}
              rows={2}
              className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
        </div>
        <button
          type="submit"
          disabled={loading || !audience || !goal || !country}
          className="bg-accent-600 text-white font-bold py-2 px-6 rounded-md hover:bg-accent-500 disabled:bg-accent-700/50 disabled:text-white/70 disabled:cursor-not-allowed transition-colors self-start"
        >
          {loading ? t.generating : t.emButton}
        </button>
      </form>

      {loading && <LoadingSpinner text={t.emLoading} />}

      {campaigns.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          {campaigns.map((campaign, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-beige-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-accent-700 dark:text-accent-500">{campaign.campaignTitle}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t.emTarget}: <span className="font-medium text-slate-700 dark:text-slate-300">{campaign.targetSegment}</span> | {t.emBestTime}: <span className="font-medium text-slate-700 dark:text-slate-300">{campaign.bestSendingTime}</span></p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.emSubjectLines}</h4>
                    <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                      {campaign.subjectLines.map((line, i) => <li key={i}>{line}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.emBodyOutline}</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-beige-50/50 dark:bg-slate-700/50 p-3 rounded-md border border-beige-200 dark:border-slate-600">{campaign.emailBodyOutline}</p>
                    <p className="text-sm font-bold text-accent-600 dark:text-accent-500 mt-2">{t.emCTA}: "{campaign.callToAction}"</p>
                  </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.emVisualConcept}</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-400 italic">"{campaign.visualIdea}"</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.smpTableAIPrompt}</h4>
                        <div className="flex items-start gap-2">
                             <code className="block flex-grow bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md p-2 text-xs text-slate-700 dark:text-slate-200 font-mono whitespace-pre-wrap">
                                {campaign.aiVisualPrompt}
                            </code>
                            <button
                                onClick={() => handleCopy(campaign.aiVisualPrompt, index)}
                                title={t.smpCopyPrompt}
                                className="flex-shrink-0 text-slate-400 dark:text-slate-500 hover:text-accent-600 dark:hover:text-accent-500 transition-colors mt-1"
                            >
                            {copiedIndex === index ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            )}
                            </button>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{t.emStrategyTips}</h4>
                        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                            <li><strong className="dark:text-slate-300">{t.emFrequency}:</strong> {campaign.strategyTips.frequency}</li>
                            <li><strong className="dark:text-slate-300">{t.emPersonalization}:</strong> {campaign.strategyTips.personalization.join(', ')}</li>
                            <li><strong className="dark:text-slate-300">{t.emKPIs}:</strong> {campaign.strategyTips.kpisToTrack.join(', ')}</li>
                        </ul>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </TaskCard>
  );
};

export default EmailMarketing;