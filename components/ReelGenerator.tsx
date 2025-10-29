import React, { useState, useEffect } from 'react';
import { generateReel } from '../services/geminiService';
import TaskCard from './common/TaskCard';
import LoadingSpinner from './common/LoadingSpinner';
import { Language, Project } from '../types';
import { translations } from '../i18n';

interface ReelGeneratorProps {
    language: Language;
    activeProject: Project | null;
    onUpdateProject: (data: any) => void;
}

const ReelGenerator: React.FC<ReelGeneratorProps> = ({ language }) => {
    const [isKeySelected, setIsKeySelected] = useState<boolean | null>(null);
    const [prompt, setPrompt] = useState('');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const t = translations[language];

    useEffect(() => {
        const checkKey = async () => {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setIsKeySelected(hasKey);
        };
        checkKey();
    }, []);

    const handleSelectKey = async () => {
        await window.aistudio.openSelectKey();
        // Optimistically assume key selection was successful to avoid race conditions.
        setIsKeySelected(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt || !isKeySelected) return;

        setLoading(true);
        setGeneratedVideoUrl(null);
        setError(null);
        setProgressMessage('Initiating...');

        try {
            const videoUrl = await generateReel(prompt, (message) => {
                setProgressMessage(message);
            });

            if (videoUrl) {
                // Fetch the video blob to display it locally, as the URL might be temporary
                const response = await fetch(videoUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch video: ${response.statusText}`);
                }
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                setGeneratedVideoUrl(objectUrl);
            } else {
                 throw new Error('Video generation did not return a URL.');
            }
        } catch (err: any) {
            console.error(err);
            if (err.message?.includes('Requested entity was not found')) {
                 setError(t.rgInvalidKeyError);
                 setIsKeySelected(false);
            } else {
                setError(err.message || 'An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
            setProgressMessage('');
        }
    };

    const handleDownload = () => {
        if (!generatedVideoUrl) return;
        const link = document.createElement('a');
        link.href = generatedVideoUrl;
        link.download = 'generated-reel.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    if (isKeySelected === null) {
        return <LoadingSpinner text={t.rgCheckingConfig} />;
    }

    if (!isKeySelected) {
        return (
            <TaskCard
                title={t.rgApiKeyRequired}
                description={t.rgApiKeyDescription}
            >
                <div className="text-center">
                    <p className="mb-4">{t.rgApiKeyPrompt}</p>
                     <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-accent-600 dark:text-accent-500 hover:underline text-sm mb-4 block">
                        {t.rgBillingLink}
                    </a>
                    <button
                        onClick={handleSelectKey}
                        className="bg-accent-600 text-white font-bold py-2 px-6 rounded-md hover:bg-accent-500 transition-colors"
                    >
                        {t.rgSelectKeyButton}
                    </button>
                    {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
                </div>
            </TaskCard>
        );
    }


    return (
        <TaskCard
            title={t.reelGeneratorName}
            description={t.reelGeneratorDescription}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t.rgPlaceholder}
                    rows={3}
                    className="w-full bg-beige-100 dark:bg-slate-700 border border-beige-200 dark:border-slate-600 rounded-md px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <button
                    type="submit"
                    disabled={loading || !prompt}
                    className="bg-accent-600 text-white font-bold py-3 px-6 rounded-md hover:bg-accent-500 disabled:bg-accent-700/50 disabled:text-white/70 disabled:cursor-not-allowed transition-colors self-start"
                >
                    {loading ? t.rgLoading : t.rgButton}
                </button>
            </form>

            {loading && <LoadingSpinner text={progressMessage} />}
            
            {error && !loading && (
                 <div className="p-4 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-500/50 rounded-lg">
                    <p className="font-bold">{t.rgGenerationFailed}</p>
                    <p className="text-sm">{error}</p>
                 </div>
            )}

            {generatedVideoUrl && (
                <div className="mt-6 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-4 dark:text-slate-200">{t.rgGeneratedReel}</h3>
                    <div className="relative group aspect-video bg-black rounded-lg overflow-hidden">
                        <video src={generatedVideoUrl} controls className="w-full h-full" />
                    </div>
                     <div className="text-center mt-4">
                        <button onClick={handleDownload} className="bg-slate-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                            {t.rgDownloadReel}
                        </button>
                    </div>
                </div>
            )}
            
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4 mt-4 border-t border-beige-200 dark:border-slate-700">
                <p>{t.disclaimer}: {t.rgDisclaimer}</p>
            </div>

        </TaskCard>
    );
};

export default ReelGenerator;