import React from 'react';
import { Language, Project, TaskId } from '../types';
import { translations } from '../i18n';
import TaskCard from './common/TaskCard';
import { Key, Users, Globe, AreaChart, Brain, Filter, Trophy, Target, Gauge, Lightbulb } from 'lucide-react';


interface ProjectDashboardProps {
    project: Project;
    language: Language;
    setActiveTask: (task: TaskId) => void;
}

const StatCard: React.FC<{
    title: string;
    value: string | number;
    description?: string;
    icon: React.FC<{className?: string}>;
    onClick?: () => void;
    ctaText?: string;
}> = ({ title, value, description, icon: Icon, onClick, ctaText }) => (
    <div className={`bg-white/70 dark:bg-slate-800/70 p-5 rounded-xl border border-beige-200 dark:border-slate-700 flex flex-col justify-between transition-shadow hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
        <div>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-600 dark:text-slate-300">{title}</h4>
                <Icon className="w-8 h-8 text-accent-500/80" />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 truncate" title={String(value)}>{value}</p>
            {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
        </div>
        {onClick && (
            <div className="text-right text-sm font-semibold text-accent-600 dark:text-accent-500 hover:underline mt-4">
                {ctaText} &rarr;
            </div>
        )}
    </div>
);

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project, language, setActiveTask }) => {
    const t = translations[language];

    const getTotalVolume = () => project.keywordReport?.keywords?.reduce((acc, kw) => acc + kw.volume, 0) ?? 0;
    
    const getTopKeyword = () => {
        const keywords = project.keywordReport?.keywords;
        if (!keywords || keywords.length === 0) return null;
        
        // Create a shallow copy before sorting to avoid mutating the original data and to rank properly
        return [...keywords].sort((a, b) => {
            const score = (opp: string) => ({ 'High': 3, 'Medium': 2, 'Low': 1 }[opp] || 0);
            return score(b.opportunity) - score(a.opportunity);
        })[0];
    };

    const getMainCompetitor = () => project.competitorReport?.competitors?.[0]?.companyName || 'N/A';
    
    const getPrimaryStrength = () => project.competitorReport?.swotComparison?.strengths?.[0] || 'N/A';
    
    const calculateSeoScore = () => {
        const report = project.websiteAnalysis;
        if (!report) return 0;
        const totalChecks = 
            (report.designAndUx?.evaluation?.length || 0) + 
            (report.performance?.evaluation?.length || 0) + 
            (report.seo?.onPage?.length || 0) +
            (report.contentQuality?.evaluation?.length || 0) +
            (report.conversionOptimization?.evaluation?.length || 0);
        const totalRecs = 
            (report.designAndUx?.recommendations?.length || 0) + 
            (report.performance?.recommendations?.length || 0) + 
            (report.seo?.offPage?.length || 0) + // Off-page are recommendations
            (report.contentQuality?.recommendations?.length || 0) +
            (report.conversionOptimization?.recommendations?.length || 0);
        
        if (totalChecks === 0) return 75; // Default score if no data
        return Math.max(10, Math.round((1 - (totalRecs / (totalChecks * 1.5))) * 100));
    };
    
    const getTopRecommendation = () => project.websiteAnalysis?.actionableSummary?.topRecommendations?.[0]?.recommendation || 'N/A';
    
    const getKeyMarketTrend = () => project.marketResearch?.marketOverview?.trends?.[0] || 'N/A';

    const topKeyword = getTopKeyword();
    
    return (
        <TaskCard title={`${t.dashboardTitle}: ${project.name}`} description={t.dashboardDescription}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                <StatCard 
                    title={t.kpiPrimaryObjective}
                    value={project.objective}
                    icon={Target}
                    onClick={() => setActiveTask('strategy-planning')}
                    ctaText={t.viewReport}
                />
                 <StatCard 
                    title={t.kpiSeoScore}
                    value={`${calculateSeoScore()}/100`}
                    description="Based on initial audit"
                    icon={Gauge}
                    onClick={() => setActiveTask('website-analysis')}
                    ctaText={t.viewReport}
                />
                 <StatCard 
                    title={t.kpiTopKeyword}
                    value={topKeyword?.keyword || 'N/A'}
                    description={`Volume: ${(topKeyword?.volume || 0).toLocaleString()}`}
                    icon={Key}
                    onClick={() => setActiveTask('keyword-research')}
                    ctaText={t.viewReport}
                />
                 <StatCard 
                    title={t.kpiMainCompetitor}
                    value={getMainCompetitor()}
                    description="Primary market rival"
                    icon={Users}
                    onClick={() => setActiveTask('competitor-benchmarking')}
                    ctaText={t.viewReport}
                />
                <StatCard 
                    title={t.kpiTopRecommendation}
                    value={getTopRecommendation()}
                    icon={Lightbulb}
                    onClick={() => setActiveTask('website-analysis')}
                    ctaText={t.viewReport}
                />
                 <StatCard 
                    title={t.kpiYourStrength}
                    value={getPrimaryStrength()}
                    icon={Trophy}
                    onClick={() => setActiveTask('competitor-benchmarking')}
                    ctaText={t.viewReport}
                />
                <StatCard 
                    title={t.kpiTotalVolume}
                    value={getTotalVolume().toLocaleString()}
                    description="Est. monthly searches"
                    icon={Filter}
                    onClick={() => setActiveTask('keyword-research')}
                    ctaText={t.viewReport}
                />
                 <StatCard 
                    title={t.kpiMarketTrend}
                    value={getKeyMarketTrend()}
                    icon={AreaChart}
                    onClick={() => setActiveTask('market-research')}
                    ctaText={t.viewReport}
                />
            </div>
        </TaskCard>
    );
};

export default ProjectDashboard;