// Fix: Provide full content for the constants.ts file.
import React from 'react';
import { TaskId } from './types';
import { Search, Users, Filter, Monitor, Store, Brain, Share2, Image, Clapperboard, Mail, MailCheck } from 'lucide-react';

export const MARKETING_TASKS: {
  id: TaskId;
  nameKey: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'keyword-research', nameKey: 'keywordResearchName', icon: Search },
  { id: 'competitor-benchmarking', nameKey: 'competitorBenchmarkingName', icon: Users },
  { id: 'lead-generation', nameKey: 'leadGenerationName', icon: Filter },
  { id: 'website-analysis', nameKey: 'websiteAnalysisName', icon: Monitor },
  { id: 'market-research', nameKey: 'marketResearchName', icon: Store },
  { id: 'strategy-planning', nameKey: 'strategyPlanningName', icon: Brain },
  { id: 'social-media-planner', nameKey: 'socialMediaPlannerName', icon: Share2 },
  { id: 'image-generation', nameKey: 'imageGenerationName', icon: Image },
  { id: 'reel-generator', nameKey: 'reelGeneratorName', icon: Clapperboard },
  { id: 'email-marketing', nameKey: 'emailMarketingName', icon: Mail },
  { id: 'commercial-email', nameKey: 'commercialEmailName', icon: MailCheck },
];