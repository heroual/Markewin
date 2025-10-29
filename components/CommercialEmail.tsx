import React, { useState, useEffect } from 'react';
import { FullCommercialEmail, Language, Project, TaskId } from '../types';
import { generateCommercialEmail } from '../services/geminiService';
import TaskCard from './common/TaskCard';
import LoadingSpinner from './common/LoadingSpinner';
import { translations } from '../i18n';
import ExportButton from './common/ExportButton';

interface CommercialEmailProps {
    language: Language;
    activeProject: Project | null;
    onUpdateProject: (data: { commercialEmail: FullCommercialEmail | null }) => void;
    onExportRequest: (reportType: TaskId, reportData: any, reportTitle: string) => void;
}

const tones = ['Professional', 'Friendly', 'Luxury', 'Inspirational', 'Bold', 'Casual', 'Persuasive'];

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-2 tracking-wider">{title}</h4>
    {children}
  </div>
);

const CommercialEmail: React.FC<CommercialEmailProps> = ({ language, activeProject, onUpdateProject, onExportRequest }) => {
  const [productName, setProductName] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('Persuasive');
  const [country, setCountry] = useState('');
  const [offer, setOffer] = useState('');
  const [result, setResult] = useState<FullCommercialEmail | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const t = translations[language];

  useEffect(() => {
    if (activeProject) {
      setProductName(activeProject.name || '');
      setAudience(`customers interested in the ${activeProject.industry} sector.`);
      setCountry(''); // Country is often specific, so better to leave it blank
      setOffer('');
      setResult(activeProject.commercialEmail || null);
    } else {
      setProductName('');
      setAudience('');
      setTone('Persuasive');
      setCountry('');
      setOffer('');
      setResult(null);
    }
  }, [activeProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !audience || !tone || !country) return;
    setLoading(true);
    setResult(null);
    const email = await generateCommercialEmail(productName, audience, tone, country, offer);
    setResult(email);
    if (activeProject) {
        onUpdateProject({ commercialEmail: email });
    }
    setLoading(false);
  };
  
  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(identifier);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <TaskCard
      title={t.commercialEmailName}
      description={t.commercialEmailDescription}
      action={result && <ExportButton onClick={() => onExportRequest('commercial-email', result, `${t.commercialEmailName} - ${productName}`)} />}
    >
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.ceProductNameLabel}</label>
            <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder={t.ceProductNamePlaceholder} required className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-3 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.ceAudienceLabel}</label>
            <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder={t.ceAudiencePlaceholder} required className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-3 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.ceToneLabel}</label>
            <select value={tone} onChange={e => setTone(e.target.value)} className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500">
              {tones.map(t_tone => (
                <option key={t_tone} value={t_tone}>{t[`ceTone${t_tone}`] || t_tone}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.ceCountryLabel}</label>
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder={t.ceCountryPlaceholder} required className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-3 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.ceOfferLabel}</label>
          <input type="text" value={offer} onChange={(e) => setOffer(e.target.value)} placeholder={t.ceOfferPlaceholder} className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-3 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500" />
        </div>
        <button
          type="submit"
          disabled={loading || !productName || !audience || !tone || !country}
          className="bg-accent-600 text-white font-bold py-2 px-6 rounded-md hover:bg-accent-500 disabled:bg-accent-700/50 disabled:text-white/70 disabled:cursor-not-allowed transition-colors self-start"
        >
          {loading ? t.ceLoading : t.ceButton}
        </button>
      </form>
      
      {loading && <LoadingSpinner text={t.ceLoading} />}

      {result && (
        <div className="space-y-8 animate-fade-in bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg border border-beige-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 border-b border-beige-200 dark:border-slate-700 pb-3">{t.ceResultTitle}</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Section title={t.ceSubjectLineOptions}>
                <ul className="space-y-2">
                  {result.subjectLineOptions.map((subj, i) => (
                    <li key={i} className="flex items-center justify-between bg-beige-50/70 dark:bg-slate-700/50 p-3 rounded-md text-slate-800 dark:text-slate-200 font-medium text-sm">
                      <span>{subj}</span>
                      <button onClick={() => handleCopy(subj, `subj-${i}`)} className="text-xs text-accent-600 hover:text-accent-500 font-semibold">{copiedItem === `subj-${i}` ? t.ceCopied : t.ceCopy}</button>
                    </li>
                  ))}
                </ul>
              </Section>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Section title={t.cePreviewText}>
                  <p className="bg-beige-50/70 dark:bg-slate-700/50 p-3 rounded-md text-sm text-slate-700 dark:text-slate-300 italic">"{result.previewText}"</p>
                </Section>
                <Section title={t.ceHeaderTitle}>
                  <p className="bg-beige-50/70 dark:bg-slate-700/50 p-3 rounded-md text-sm text-slate-800 dark:text-slate-200 font-bold">"{result.headerTitle}"</p>
                </Section>
              </div>

              <Section title={t.ceBody}>
                <div className="relative">
                  <div className="prose prose-sm dark:prose-invert max-w-none bg-beige-50/70 dark:bg-slate-700/50 p-4 rounded-md whitespace-pre-wrap border border-beige-200 dark:border-slate-600">
                    <div dangerouslySetInnerHTML={{__html: result.body.replace(/\n/g, '<br />') }} />
                    <div className="text-center mt-4">
                      <span className="inline-block bg-accent-600 text-white font-bold py-2 px-6 rounded-md cursor-pointer">{result.callToAction}</span>
                    </div>
                  </div>
                  <button onClick={() => handleCopy(result.body, 'body')} className="absolute top-2 right-2 text-xs bg-slate-200/50 hover:bg-slate-300/80 dark:bg-slate-600/50 dark:hover:bg-slate-500/80 px-2 py-1 rounded-md font-semibold text-slate-700 dark:text-slate-200">{copiedItem === 'body' ? t.ceCopied : t.ceCopy}</button>
                </div>
              </Section>
            </div>
            
            <div className="lg:col-span-1 space-y-6 bg-beige-100/70 dark:bg-slate-800/50 p-4 rounded-lg border border-beige-200 dark:border-slate-700">
              <Section title={t.ceVisualConcept}>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{result.visualConcept}"</p>
              </Section>
              
              <Section title={t.ceAIPrompt}>
                <div className="relative">
                  <code className="block w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md p-2 text-xs text-slate-700 dark:text-slate-200 font-mono whitespace-pre-wrap">
                    {result.aiImagePrompt}
                  </code>
                  <button onClick={() => handleCopy(result.aiImagePrompt, 'prompt')} title={t.smpCopyPrompt} className="absolute top-1.5 right-1.5 text-slate-400 dark:text-slate-500 hover:text-accent-600 dark:hover:text-accent-500 transition-colors">
                    {copiedItem === 'prompt' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                  </button>
                </div>
              </Section>

              <Section title={t.ceOptimizationStrategy}>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                  <li><strong className="dark:text-slate-200">{t.ceBestSendTime}:</strong> {result.optimizationTips.bestSendTime}</li>
                  <li><strong className="dark:text-slate-200">{t.cePersonalization}:</strong> {result.optimizationTips.personalization.join(', ')}</li>
                  <li><strong className="dark:text-slate-200">{t.ceKPIs}:</strong> {result.optimizationTips.kpisToMonitor.join(', ')}</li>
                </ul>
              </Section>
            </div>
          </div>
        </div>
      )}
    </TaskCard>
  );
};

export default CommercialEmail;