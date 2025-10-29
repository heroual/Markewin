import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
    KeywordReport, 
    FullCompetitorReport, 
    LeadGenerationStrategyReport, 
    WebsiteAnalysisReport,
    FullMarketResearchReport,
    FullStrategyPlan,
    SocialMediaPlanResult,
    FullEmailCampaignIdea,
    FullCommercialEmail
} from '../types';

// Initialize the Google Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const model = 'gemini-2.5-flash';

// Helper to parse JSON response from the model
const parseJsonResponse = <T>(jsonString: string, context: string): T | null => {
    try {
        // The Gemini API might return the JSON string wrapped in ```json ... ```
        const sanitizedString = jsonString.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        return JSON.parse(sanitizedString) as T;
    } catch (error) {
        console.error(`Error parsing JSON for ${context}:`, error, "Raw response:", jsonString);
        // Fallback for malformed JSON, try to find a JSON object inside the string
        const match = jsonString.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (match) {
            try {
                return JSON.parse(match[0]) as T;
            } catch (e) {
                console.error(`Secondary parsing attempt failed for ${context}.`);
                return null;
            }
        }
        return null;
    }
};

// Helper function to call the Gemini API and get structured data
async function generateStructuredData<T>(prompt: string, schema: any, context: string): Promise<T | null> {
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const text = response.text;
        if (!text) {
            console.error(`No text response from Gemini for ${context}`);
            return null;
        }
        return parseJsonResponse<T>(text, context);
    } catch (error) {
        console.error(`API call failed for ${context}:`, error);
        return null;
    }
}


// Schemas for structured responses
const keywordSchema = {
    type: Type.OBJECT,
    properties: {
        keyword: { type: Type.STRING },
        volume: { type: Type.NUMBER },
        intent: { type: Type.STRING, enum: ['Informational', 'Commercial', 'Transactional', 'Navigational'] },
        difficulty: { type: Type.NUMBER },
        cpc: { type: Type.NUMBER },
        opportunity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
        notes: { type: Type.STRING },
    }
};

const keywordReportSchema = {
    type: Type.OBJECT,
    properties: {
        painPointsAndMotivations: { type: Type.STRING },
        trendingTopicsAndSeasonality: { type: Type.STRING },
        competitorInsights: { type: Type.STRING },
        opportunitiesAndRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        keywords: { type: Type.ARRAY, items: keywordSchema },
    }
};

export const generateKeywordReport = (topic: string): Promise<KeywordReport | null> => {
    const prompt = `Generate a comprehensive keyword report for the topic: "${topic}". Include customer pain points, trending topics, competitor insights, actionable opportunities, and a table of at least 15 relevant keywords with their estimated monthly search volume, search intent, difficulty (0-100), CPC in USD, opportunity score (High, Medium, Low), and brief notes.`;
    return generateStructuredData<KeywordReport>(prompt, keywordReportSchema, 'Keyword Report');
};

const competitorReportSchema = {
    type: Type.OBJECT,
    properties: {
        executiveSummary: { type: Type.STRING },
        marketOverview: {
            type: Type.OBJECT,
            properties: {
                marketSizeAndGrowth: { type: Type.STRING },
                keyTrendsAndInnovations: { type: Type.ARRAY, items: { type: Type.STRING } },
                customerBehaviors: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
        },
        competitors: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    companyName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    positioning: { type: Type.STRING },
                    coreServices: { type: Type.ARRAY, items: { type: Type.STRING } },
                    uniqueSellingProposition: { type: Type.STRING },
                }
            }
        },
        comparativeAnalysisTable: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    criteria: { type: Type.STRING },
                    yourCompany: { type: Type.STRING },
                    competitorValues: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                companyName: { type: Type.STRING },
                                value: { type: Type.STRING },
                            },
                            required: ['companyName', 'value'],
                        }
                    },
                }
            }
        },
        swotComparison: {
            type: Type.OBJECT,
            properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                threats: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        strategicRecommendations: {
            type: Type.OBJECT,
            properties: {
                positioningImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
                innovationAndDifferentiation: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
        },
    },
};

export const generateCompetitorReport = (companyDescription: string): Promise<FullCompetitorReport | null> => {
    const prompt = `Analyze the competitive landscape for a company described as: "${companyDescription}". Identify 3-4 key competitors. Provide a full benchmarking report including an executive summary, market overview, competitor profiles, a comparative analysis table (criteria like pricing, features, market share), a comparative SWOT analysis for our company, and strategic recommendations. For the comparative analysis table, the 'competitorValues' field should be an array of objects, each with 'companyName' and 'value' properties.`;
    return generateStructuredData<FullCompetitorReport>(prompt, competitorReportSchema, 'Competitor Report');
};

const leadGenStrategySchema = {
  type: Type.OBJECT,
  properties: {
    idealCustomerProfile: {
      type: Type.OBJECT,
      properties: {
        demographics: { type: Type.ARRAY, items: { type: Type.STRING } },
        interestsAndBehaviors: { type: Type.ARRAY, items: { type: Type.STRING } },
        painPointsAndNeeds: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
    leadSources: { type: Type.ARRAY, items: { type: Type.STRING } },
    leadMagnets: { type: Type.ARRAY, items: { type: Type.STRING } },
    leadFunnelStrategy: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stage: { type: Type.STRING, enum: ['Awareness', 'Interest', 'Decision', 'Action'] },
          contentAndMessaging: { type: Type.STRING },
          callToAction: { type: Type.STRING },
        },
      },
    },
    keywordTargeting: { type: Type.ARRAY, items: keywordSchema },
    summaryTable: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING },
          keywordOrInterest: { type: Type.STRING },
          cpc: { type: Type.NUMBER },
          potential: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          notes: { type: Type.STRING },
        },
      },
    },
    topOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
};

export const generateLeadGenerationStrategy = (industry: string): Promise<LeadGenerationStrategyReport | null> => {
    const prompt = `Create a detailed lead generation strategy for a company in the "${industry}" industry. Define the ideal customer profile, suggest top lead sources and lead magnets, outline a 4-stage lead funnel (Awareness, Interest, Decision, Action), provide a list of 10-15 targeted keywords, and create a summary table of the best opportunities. Finally, list the top 3 most impactful opportunities.`;
    return generateStructuredData<LeadGenerationStrategyReport>(prompt, leadGenStrategySchema, 'Lead Generation Strategy');
};

const websiteAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        generalOverview: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING },
                mainGoal: { type: Type.STRING },
            }
        },
        designAndUx: {
            type: Type.OBJECT,
            properties: {
                evaluation: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        performance: {
            type: Type.OBJECT,
            properties: {
                evaluation: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        seo: {
            type: Type.OBJECT,
            properties: {
                onPage: { type: Type.ARRAY, items: { type: Type.STRING } },
                offPage: { type: Type.ARRAY, items: { type: Type.STRING } },
                keywordOpportunities: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            keyword: { type: Type.STRING },
                            volume: { type: Type.NUMBER },
                            difficulty: { type: Type.NUMBER },
                            cpc: { type: Type.NUMBER },
                            intent: { type: Type.STRING, enum: ['Informational', 'Commercial', 'Transactional', 'Navigational'] },
                        }
                    }
                },
            }
        },
        contentQuality: {
            type: Type.OBJECT,
            properties: {
                evaluation: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        conversionOptimization: {
            type: Type.OBJECT,
            properties: {
                evaluation: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        marketingAndAnalytics: {
            type: Type.OBJECT,
            properties: {
                evaluation: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        securityAndCompliance: {
            type: Type.OBJECT,
            properties: {
                evaluation: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        actionableSummary: {
            type: Type.OBJECT,
            properties: {
                topRecommendations: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            recommendation: { type: Type.STRING },
                            impact: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                            priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                        }
                    }
                },
                thirtyDayPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
    },
};


export const analyzeWebsite = (url: string): Promise<WebsiteAnalysisReport | null> => {
    // This is a mock analysis. A real implementation would need a tool to fetch website content.
    // For this project, we'll simulate it by telling Gemini to act as if it has analyzed the URL.
    const prompt = `Imagine you are a website analysis tool. You have analyzed the website at the URL "${url}". Based on general best practices and common issues for websites, generate a comprehensive analysis report. Cover general overview, design/UX, performance, SEO (on-page, off-page, keyword opportunities), content quality, conversion optimization, marketing/analytics, and security. Conclude with an actionable summary including top 5 recommendations (with impact and priority) and a 30-day plan. Assume the website is for a small e-commerce business.`;
    return generateStructuredData<WebsiteAnalysisReport>(prompt, websiteAnalysisSchema, 'Website Analysis');
};


const marketResearchSchema = {
    type: Type.OBJECT,
    properties: {
        executiveSummary: { type: Type.STRING },
        marketOverview: {
            type: Type.OBJECT,
            properties: {
                marketSize: { type: Type.STRING },
                growthRate: { type: Type.STRING },
                trends: { type: Type.ARRAY, items: { type: Type.STRING } },
                challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
        },
        competitorAnalysis: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    positioning: { type: Type.STRING },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                }
            }
        },
        targetAudience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    segmentName: { type: Type.STRING },
                    demographics: { type: Type.STRING },
                    behavior: { type: Type.STRING },
                    painPoints: { type: Type.STRING },
                }
            }
        },
        marketingChannelsAndStrategy: {
            type: Type.OBJECT,
            properties: {
                suggestedChannels: { type: Type.ARRAY, items: { type: Type.STRING } },
                strategyHighlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        opportunitiesAndThreats: {
            type: Type.OBJECT,
            properties: {
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                threats: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
    }
};

export const researchMarket = (topic: string): Promise<FullMarketResearchReport | null> => {
    const prompt = `Conduct a detailed market research report for the following market: "${topic}". The report should include an executive summary, market overview (size, growth, trends, challenges), analysis of 3 key competitors, 2-3 target audience segments, recommended marketing channels, a summary of opportunities and threats, and 5 key takeaways.`;
    return generateStructuredData<FullMarketResearchReport>(prompt, marketResearchSchema, 'Market Research');
};

const strategyPlanSchema = {
    type: Type.OBJECT,
    properties: {
        executiveSummary: { type: Type.STRING },
        situationAnalysis: {
            type: Type.OBJECT,
            properties: {
                marketPosition: { type: Type.STRING },
                swot: {
                    type: Type.OBJECT,
                    properties: {
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                        threats: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                },
                internalFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                externalFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        objectives: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    objective: { type: Type.STRING },
                    specific: { type: Type.STRING },
                    measurable: { type: Type.STRING },
                    achievable: { type: Type.STRING },
                    relevant: { type: Type.STRING },
                    timeBound: { type: Type.STRING },
                }
            }
        },
        strategicApproach: {
            type: Type.OBJECT,
            properties: {
                approach: { type: Type.STRING },
                justification: { type: Type.STRING },
                keyPillars: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
        actionPlan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    step: { type: Type.STRING },
                    timeline: { type: Type.STRING },
                    responsibility: { type: Type.STRING },
                    kpi: { type: Type.STRING },
                    budget: { type: Type.STRING },
                }
            }
        },
        riskManagement: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    risk: { type: Type.STRING },
                    mitigation: { type: Type.STRING },
                }
            }
        },
        conclusionAndRecommendations: { type: Type.STRING },
    }
};

export const generateStrategy = (objective: string): Promise<FullStrategyPlan | null> => {
    const prompt = `Create a comprehensive marketing strategy plan for the objective: "${objective}". The plan must include: executive summary, situation analysis (market position, SWOT, internal/external factors), 2-3 SMART objectives, a core strategic approach, a detailed action plan table (with step, timeline, responsibility, KPI, budget), a risk management table, and a conclusion.`;
    return generateStructuredData<FullStrategyPlan>(prompt, strategyPlanSchema, 'Strategy Plan');
};

const socialMediaPlanSchema = {
    type: Type.OBJECT,
    properties: {
        plan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING },
                    postTheme: { type: Type.STRING },
                    objective: { type: Type.STRING },
                    caption: { type: Type.STRING },
                    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    visualConcept: { type: Type.STRING },
                    aiImagePrompt: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    recommendedTime: { type: Type.STRING },
                }
            }
        }
    }
};

export const generateSocialMediaPlan = (topic: string, country: string, contentType: string, audience: string): Promise<SocialMediaPlanResult | null> => {
    const prompt = `Generate a 7-day social media content plan for a campaign about "${topic}". 
    The target audience is "${audience || 'a general audience'}" in "${country}".
    The desired content type is "${contentType}".
    For each day, provide a post theme, objective (e.g., Engagement, Reach), a compelling caption, 5-7 relevant hashtags, a visual concept, a detailed DALL-E 3 / Midjourney style AI image prompt for the visual, the best platform (e.g., Instagram, TikTok, LinkedIn), and a recommended posting time.`;
    return generateStructuredData<SocialMediaPlanResult>(prompt, socialMediaPlanSchema, 'Social Media Plan');
};

const emailCampaignSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            campaignTitle: { type: Type.STRING },
            targetSegment: { type: Type.STRING },
            bestSendingTime: { type: Type.STRING },
            subjectLines: { type: Type.ARRAY, items: { type: Type.STRING } },
            emailBodyOutline: { type: Type.STRING },
            callToAction: { type: Type.STRING },
            visualIdea: { type: Type.STRING },
            aiVisualPrompt: { type: Type.STRING },
            strategyTips: {
                type: Type.OBJECT,
                properties: {
                    frequency: { type: Type.STRING },
                    personalization: { type: Type.ARRAY, items: { type: Type.STRING } },
                    kpisToTrack: { type: Type.ARRAY, items: { type: Type.STRING } },
                }
            },
        }
    }
};

export const generateEmailCampaigns = (audience: string, goal: string, country: string, product: string): Promise<FullEmailCampaignIdea[]> => {
    const prompt = `Generate 3 distinct email campaign ideas for the following scenario:
    - Target Audience: ${audience}
    - Campaign Goal: ${goal}
    - Target Country: ${country}
    - Product/Service: ${product || 'the company\'s main offering'}
    
    For each campaign idea, provide: a campaign title, target segment, best sending time, 3 subject line options, a detailed email body outline (intro, body, closing), a strong call to action, a visual idea, a detailed AI image prompt for the visual, and strategy tips (frequency, personalization ideas, KPIs to track).`;
    return generateStructuredData<FullEmailCampaignIdea[]>(prompt, emailCampaignSchema, 'Email Campaigns').then(res => res || []);
};

const commercialEmailSchema = {
    type: Type.OBJECT,
    properties: {
        subjectLineOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
        previewText: { type: Type.STRING },
        headerTitle: { type: Type.STRING },
        body: { type: Type.STRING, description: "The full email body text, formatted with paragraphs." },
        callToAction: { type: Type.STRING },
        visualConcept: { type: Type.STRING },
        aiImagePrompt: { type: Type.STRING },
        optimizationTips: {
            type: Type.OBJECT,
            properties: {
                bestSendTime: { type: Type.STRING },
                personalization: { type: Type.ARRAY, items: { type: Type.STRING } },
                kpisToMonitor: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        },
    }
};

export const generateCommercialEmail = (productName: string, audience: string, tone: string, country: string, offer: string): Promise<FullCommercialEmail | null> => {
    const prompt = `Write a complete commercial email for the following:
    - Product/Service: ${productName}
    - Target Audience: ${audience} in ${country}
    - Tone: ${tone}
    - Special Offer: ${offer || 'No special offer mentioned.'}

    Provide: 3 subject line options, a compelling preview text, a strong header title, the full email body (well-structured with paragraphs), a clear call to action button text, a visual concept, a detailed AI image prompt for the visual, and optimization tips (best send time, personalization variables, KPIs).`;
    return generateStructuredData<FullCommercialEmail>(prompt, commercialEmailSchema, 'Commercial Email');
};

export const generateImageFromContent = async (prompt: string, images: { base64: string, mimeType: string }[]): Promise<string | null> => {
    try {
        const imageParts = images.map(image => ({
            inlineData: {
                data: image.base64,
                mimeType: image.mimeType
            }
        }));

        const textPart = { text: prompt };

        const parts = [...imageParts, textPart];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const candidate = response.candidates?.[0];
        if (candidate && candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
        }
        
        console.error("No image data found in the response", response);
        return null;
    } catch (error) {
        console.error("Image generation failed:", error);
        return null;
    }
};


export const generateReel = async (prompt: string, onProgress: (message: string) => void): Promise<string | null> => {
    // Re-initialize client to ensure latest API key is used from the dialog
    const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    try {
        onProgress('Starting video generation...');
        let operation = await videoAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16'
            }
        });
        
        onProgress('Processing video... This may take a few minutes.');
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            onProgress('Checking status...');
            operation = await videoAi.operations.getVideosOperation({ operation: operation });
        }

        onProgress('Finalizing video...');
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (downloadLink) {
            const finalUrl = `${downloadLink}&key=${process.env.API_KEY}`;
            onProgress('Video ready!');
            return finalUrl;
        }

        return null;

    } catch (error: any) {
        console.error('Video generation failed:', error);
        throw error;
    }
};