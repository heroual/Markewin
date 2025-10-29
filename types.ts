export type Language = 'en' | 'fr';

export type TaskId =
  | 'keyword-research'
  | 'competitor-benchmarking'
  | 'lead-generation'
  | 'website-analysis'
  | 'market-research'
  | 'strategy-planning'
  | 'social-media-planner'
  | 'image-generation'
  | 'reel-generator'
  | 'email-marketing'
  | 'commercial-email';

export type SearchIntent = 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';

export interface Keyword {
  keyword: string;
  volume: number;
  intent: SearchIntent;
  difficulty: number;
  cpc: number | string;
  opportunity: 'High' | 'Medium' | 'Low' | string;
  notes: string;
}

export interface KeywordReport {
  painPointsAndMotivations: string;
  trendingTopicsAndSeasonality: string;
  competitorInsights: string;
  opportunitiesAndRecommendations: string[];
  keywords: Keyword[];
}

export interface CompetitorProfile {
    companyName: string;
    description: string;
    positioning: string;
    coreServices: string[];
    uniqueSellingProposition: string;
}

export interface CompetitorValue {
    companyName: string;
    value: string;
}

export interface ComparativeAnalysisRow {
    criteria: string;
    yourCompany: string;
    competitorValues: CompetitorValue[];
}

export interface SWOTComparison {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

export interface FullCompetitorReport {
    executiveSummary: string;
    marketOverview: {
        marketSizeAndGrowth: string;
        keyTrendsAndInnovations: string[];
        customerBehaviors: string[];
    };
    competitors: CompetitorProfile[];
    comparativeAnalysisTable: ComparativeAnalysisRow[];
    swotComparison: SWOTComparison;
    strategicRecommendations: {
        positioningImprovements: string[];
        innovationAndDifferentiation: string[];
    };
}

export interface LeadFunnelStage {
    stage: 'Awareness' | 'Interest' | 'Decision' | 'Action';
    contentAndMessaging: string;
    callToAction: string;
}

export interface KeywordTarget extends Keyword {
    // Inherits from Keyword
}

export interface LeadSourceSummary {
    source: string;
    keywordOrInterest: string;
    cpc: number | string;
    potential: 'High' | 'Medium' | 'Low' | string;
    notes: string;
}

export interface LeadGenerationStrategyReport {
    idealCustomerProfile: {
        demographics: string[];
        interestsAndBehaviors: string[];
        painPointsAndNeeds: string[];
    };
    leadSources: string[];
    leadMagnets: string[];
    leadFunnelStrategy: LeadFunnelStage[];
    keywordTargeting: KeywordTarget[];
    summaryTable: LeadSourceSummary[];
    topOpportunities: string[];
}


export interface WebsiteKeywordOpportunity {
    keyword: string;
    volume: number;
    difficulty: number;
    cpc: string | number;
    intent: SearchIntent;
}

export interface ActionableRecommendation {
    recommendation: string;
    impact: 'High' | 'Medium' | 'Low';
    priority: 'High' | 'Medium' | 'Low';
}

export interface WebsiteAnalysisReport {
    generalOverview: {
        description: string;
        mainGoal: string;
    };
    designAndUx: {
        evaluation: string[];
        recommendations: string[];
    };
    performance: {
        evaluation: string[];
        recommendations: string[];
    };
    seo: {
        onPage: string[];
        offPage: string[];
        keywordOpportunities: WebsiteKeywordOpportunity[];
    };
    contentQuality: {
        evaluation: string[];
        recommendations: string[];
    };
    conversionOptimization: {
        evaluation: string[];
        recommendations: string[];
    };
    marketingAndAnalytics: {
        evaluation: string[];
        recommendations: string[];
    };
    securityAndCompliance: {
        evaluation: string[];
        recommendations: string[];
    };
    actionableSummary: {
        topRecommendations: ActionableRecommendation[];
        thirtyDayPlan: string[];
    };
}

export interface CompetitorSummary {
    name: string;
    positioning: string;
    strengths: string[];
    weaknesses: string[];
}

export interface AudienceSegment {
    segmentName: string;
    demographics: string;
    behavior: string;
    painPoints: string;
}

export interface FullMarketResearchReport {
    executiveSummary: string;
    marketOverview: {
        marketSize: string;
        growthRate: string;
        trends: string[];
        challenges: string[];
    };
    competitorAnalysis: CompetitorSummary[];
    targetAudience: AudienceSegment[];
    marketingChannelsAndStrategy: {
        suggestedChannels: string[];
        strategyHighlights: string[];
    };
    opportunitiesAndThreats: {
        opportunities: string[];
        threats: string[];
    };
    keyTakeaways: string[];
}

export interface SmartObjective {
    objective: string;
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
}

export interface ActionPlanItem {
    step: string;
    timeline: string;
    responsibility: string;
    kpi: string;
    budget: string;
}

export interface RiskItem {
    risk: string;
    mitigation: string;
}

export interface FullStrategyPlan {
    executiveSummary: string;
    situationAnalysis: {
        marketPosition: string;
        swot: SWOTComparison;
        internalFactors: string[];
        externalFactors: string[];
    };
    objectives: SmartObjective[];
    strategicApproach: {
        approach: string;
        justification: string;
        keyPillars: string[];
    };
    actionPlan: ActionPlanItem[];
    riskManagement: RiskItem[];
    conclusionAndRecommendations: string;
}

export interface SocialMediaPost {
    day: string;
    postTheme: string;
    objective: string;
    caption: string;
    hashtags: string[];
    visualConcept: string;
    aiImagePrompt: string;
    platform: string;
    recommendedTime: string;
}

export interface SocialMediaPlanResult {
    plan: SocialMediaPost[];
}

export interface FullEmailCampaignIdea {
    campaignTitle: string;
    targetSegment: string;
    bestSendingTime: string;
    subjectLines: string[];
    emailBodyOutline: string;
    callToAction: string;
    visualIdea: string;
    aiVisualPrompt: string;
    strategyTips: {
        frequency: string;
        personalization: string[];
        kpisToTrack: string[];
    };
}

export interface FullCommercialEmail {
    subjectLineOptions: string[];
    previewText: string;
    headerTitle: string;
    body: string;
    callToAction: string;
    visualConcept: string;
    aiImagePrompt: string;
    optimizationTips: {
        bestSendTime: string;
        personalization: string[];
        kpisToMonitor: string[];
    };
}

export interface CompanyProfile {
    location?: string;
    history?: string;
    companySize?: string;
    mainProducts?: string;
    targetAudience?: string;
    geographicCoverage?: string;
    missionVision?: string;
    valueProposition?: string;
    brandImage?: string;
    brandValues?: string[];
    keyMessages?: string[];
    brandPersonality?: string;
}

export interface Project {
    id: string;
    name: string;
    websiteUrl: string;
    industry: string;
    objective: string;
    companyProfile?: CompanyProfile;
    keywordReport?: KeywordReport | null;
    competitorReport?: FullCompetitorReport | null;
    leadGenerationStrategy?: LeadGenerationStrategyReport | null;
    websiteAnalysis?: WebsiteAnalysisReport | null;
    marketResearch?: FullMarketResearchReport | null;
    strategy?: FullStrategyPlan | null;
    socialMediaPlan?: SocialMediaPlanResult | null;
    emailCampaigns?: FullEmailCampaignIdea[];
    commercialEmail?: FullCommercialEmail | null;
}

export interface ExportOptions {
    logo?: string; // base64 data url
    theme: 'light' | 'dark';
    includeExplanations: boolean;
    userName: string;
    projectName: string;
    reportTitle: string;
}