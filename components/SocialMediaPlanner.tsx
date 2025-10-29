import React, { useState, useEffect } from 'react';
import { SocialMediaPlanResult, Language, Project, TaskId } from '../types';
import { generateSocialMediaPlan } from '../services/geminiService';
import TaskCard from './common/TaskCard';
import LoadingSpinner from './common/LoadingSpinner';
import { translations } from '../i18n';
import ExportButton from './common/ExportButton';

interface SocialMediaPlannerProps {
    language: Language;
    activeProject: Project | null;
    onUpdateProject: (data: { socialMediaPlan: SocialMediaPlanResult | null }) => void;
    onExportRequest: (reportType: TaskId, reportData: any, reportTitle: string) => void;
}

const contentTypes = ['Educational', 'Promotional', 'Inspirational', 'Entertaining', 'Informative', 'Storytelling', 'Mixed'];

const SocialMediaPlanner: React.FC<SocialMediaPlannerProps> = ({ language, activeProject, onUpdateProject, onExportRequest }) => {
  const [topic, setTopic] = useState('');
  const [country, setCountry] = useState('');
  const [contentType, setContentType] = useState('Mixed');
  const [audience, setAudience] = useState('');
  const [planResult, setPlanResult] = useState<SocialMediaPlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const t = translations[language];

  useEffect(() => {
    if (activeProject) {
        setTopic(activeProject.objective || activeProject.industry || '');
        setPlanResult(activeProject.socialMediaPlan || null);
    } else {
        setTopic('');
        setCountry('');
        setContentType('Mixed');
        setAudience('');
        setPlanResult(null);
    }
  }, [activeProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !country || !contentType) return;
    setLoading(true);
    setPlanResult(null);
    const result = await generateSocialMediaPlan(topic, country, contentType, audience);
    setPlanResult(result);
    if(activeProject) {
        onUpdateProject({ socialMediaPlan: result });
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
      title={t.socialMediaPlannerName}
      description={t.socialMediaPlannerDescription}
      action={planResult && <ExportButton onClick={() => onExportRequest('social-media-planner', planResult, `${t.socialMediaPlannerName} - ${topic}`)} />}
    >
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.smpTopicLabel}</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.smpTopicPlaceholder}
                required
                className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
          </div>
          <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.smpCountryLabel}</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={t.smpCountryPlaceholder}
                required
                className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.smpContentTypeLabel}</label>
            <select 
              value={contentType} 
              onChange={e => setContentType(e.target.value)}
              className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              {contentTypes.map(type => (
                <option key={type} value={type}>{t[`smpType${type}`]}</option>
              ))}
            </select>
          </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.smpAudienceLabel}</label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder={t.smpAudiencePlaceholder}
                className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !topic || !country}
          className="bg-accent-600 text-white font-bold py-2 px-6 rounded-md hover:bg-accent-500 disabled:bg-accent-700/50 disabled:text-white/70 disabled:cursor-not-allowed transition-colors self-start"
        >
          {loading ? t.planning : t.smpButton}
        </button>
      </form>
      
      {loading && <LoadingSpinner text={t.smpLoading} />}

      {planResult && planResult.plan.length > 0 && (
        <div className="animate-fade-in">
          <div className="overflow-x-auto bg-white dark:bg-slate-800/50 rounded-lg border border-beige-200 dark:border-slate-700">
            <table className="min-w-full text-sm">
              <thead className="bg-beige-200/70 dark:bg-slate-700/50">
                <tr className="sticky top-0 bg-beige-200/70 dark:bg-slate-700/50 z-10">
                  <th className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-200">{t.smpTableDay}</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-200">{t.smpTableTheme}</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-200">{t.smpTableObjective}</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-200">{t.smpTableCaption}</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-200">{t.smpTableHashtags}</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-200">{t.smpTableVisualConcept}</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-200">{t.smpTableAIPrompt}</th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-200">{t.smpTablePlatformTime}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200 dark:divide-slate-700">
                {planResult.plan.map((post, index) => (
                  <tr key={index} className="hover:bg-beige-50/50 dark:hover:bg-slate-800 align-top">
                    <td className="px-4 py-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{post.day}</td>
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">{post.postTheme}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-accent-100 text-accent-800 dark:bg-accent-900/50 dark:text-accent-200 whitespace-nowrap">{post.objective}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400 min-w-[250px] whitespace-pre-wrap">{post.caption}</td>
                    <td className="px-4 py-4 min-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                            {post.hashtags.map((tag, i) => (
                                <span key={i} className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400 min-w-[250px] whitespace-pre-wrap">{post.visualConcept}</td>
                    <td className="px-4 py-4 min-w-[300px]">
                       <div className="flex items-start gap-2">
                            <code className="block flex-grow bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md p-2 text-xs text-slate-700 dark:text-slate-200 font-mono whitespace-pre-wrap">
                                {post.aiImagePrompt}
                            </code>
                            <button
                                onClick={() => handleCopy(post.aiImagePrompt, index)}
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
                    </td>
                    <td className="px-4 py-4 text-slate-700 dark:text-slate-300 whitespace-nowrap"><strong className="dark:text-slate-200">{post.platform}</strong> at {post.recommendedTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 mt-4 border-t border-beige-200 dark:border-slate-700">
              <p>{t.disclaimer}: {t.smpDisclaimer}</p>
          </div>
        </div>
      )}
    </TaskCard>
  );
};

export default SocialMediaPlanner;