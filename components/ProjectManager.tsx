import React, { useState, useEffect, useRef } from 'react';
import { Language, Project } from '../types';
import TaskCard from './common/TaskCard';
import { translations } from '../i18n';
import * as geminiService from '../services/geminiService';
import { Send } from 'lucide-react';
import logo from '../images/logo.png'; // Import the logo

interface ProjectManagerProps {
    projects: Project[];
    onCreateProject: (projectData: Omit<Project, 'id'>) => void;
    language: Language;
}

type OnboardingState = 'idle' | 'chatting' | 'processing' | 'complete';
type OnboardingMessage = { sender: 'agent' | 'user'; text: string };

type FullFormData = {
    name: string;
    websiteUrl: string;
    industry: string;
    objective: string;
    location: string;
    history: string;
    companySize: string;
    mainProducts: string;
    targetAudience: string;
    geographicCoverage: string;
    missionVision: string;
    valueProposition: string;
    brandImage: string;
    brandValues: string; // Will be string in form, then parsed to string[]
    keyMessages: string; // Will be string in form, then parsed to string[]
    brandPersonality: string;
};
type FormData = Partial<FullFormData>;


const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, onCreateProject, language }) => {
    const [onboardingState, setOnboardingState] = useState<OnboardingState>('idle');
    const [chatMessages, setChatMessages] = useState<OnboardingMessage[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [formData, setFormData] = useState<FormData>({});
    const [userInput, setUserInput] = useState('');
    const [progressMessage, setProgressMessage] = useState('');
    const t = translations[language];
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const questions = [
        { key: 'name', text: t.pmAskName },
        { key: 'websiteUrl', text: t.pmAskURL },
        { key: 'industry', text: t.pmAskIndustry },
        { key: 'location', text: t.pmAskLocation },
        { key: 'history', text: t.pmAskHistory },
        { key: 'companySize', text: t.pmAskCompanySize },
        { key: 'mainProducts', text: t.pmAskMainProducts },
        { key: 'targetAudience', text: t.pmAskTargetAudience },
        { key: 'objective', text: t.pmAskObjective },
        { key: 'geographicCoverage', text: t.pmAskGeoCoverage },
        { key: 'missionVision', text: t.pmAskMissionVision },
        { key: 'valueProposition', text: t.pmAskValueProp },
        { key: 'brandImage', text: t.pmAskBrandImage },
        { key: 'brandValues', text: t.pmAskBrandValues },
        { key: 'keyMessages', text: t.pmAskKeyMessages },
        { key: 'brandPersonality', text: t.pmAskBrandPersonality },
    ];

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const startChat = () => {
        setOnboardingState('chatting');
        setChatMessages([{ sender: 'agent', text: t.pmChatWelcome }, { sender: 'agent', text: questions[0].text }]);
        setCurrentQuestionIndex(0);
        setFormData({});
    };
    
    const handleUserMessageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput) return;

        const currentQuestion = questions[currentQuestionIndex];
        const newFormData = { ...formData, [currentQuestion.key]: trimmedInput };
        setFormData(newFormData);

        const newMessages: OnboardingMessage[] = [...chatMessages, { sender: 'user', text: trimmedInput }];

        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < questions.length) {
            newMessages.push({ sender: 'agent', text: questions[nextQuestionIndex].text });
            setCurrentQuestionIndex(nextQuestionIndex);
        } else {
            newMessages.push({ sender: 'agent', text: t.pmChatThanks });
            setOnboardingState('processing');
            await runAnalysis(newFormData as FullFormData);
        }
        
        setChatMessages(newMessages);
        setUserInput('');
    };
    
    const runAnalysis = async (finalFormData: FullFormData) => {
        const newProjectData: Omit<Project, 'id'> = {
            name: finalFormData.name,
            websiteUrl: finalFormData.websiteUrl,
            industry: finalFormData.industry,
            objective: finalFormData.objective,
            companyProfile: {
                location: finalFormData.location,
                history: finalFormData.history,
                companySize: finalFormData.companySize,
                mainProducts: finalFormData.mainProducts,
                targetAudience: finalFormData.targetAudience,
                geographicCoverage: finalFormData.geographicCoverage,
                missionVision: finalFormData.missionVision,
                valueProposition: finalFormData.valueProposition,
                brandImage: finalFormData.brandImage,
                brandValues: finalFormData.brandValues.split(',').map(v => v.trim()),
                keyMessages: finalFormData.keyMessages.split(',').map(v => v.trim()),
                brandPersonality: finalFormData.brandPersonality,
            }
        };

        try {
            setProgressMessage(t.pmStep1);
            newProjectData.websiteAnalysis = await geminiService.analyzeWebsite(finalFormData.websiteUrl);
            newProjectData.marketResearch = await geminiService.researchMarket(finalFormData.industry);
            
            setProgressMessage(t.pmStep2);
            const companyDescription = `
                Analyze the competitive landscape for a company with the following detailed profile:
                - Company Name: ${finalFormData.name}
                - Website: ${finalFormData.websiteUrl}
                - Industry: ${finalFormData.industry}
                - Location: ${finalFormData.location}
                - Brief History: ${finalFormData.history}
                - Company Size: ${finalFormData.companySize}
                - Main Products/Services: ${finalFormData.mainProducts}
                - Target Audience: ${finalFormData.targetAudience}
                - Geographic Coverage: ${finalFormData.geographicCoverage}
                - Marketing Objective: ${finalFormData.objective}
                - Mission/Vision: ${finalFormData.missionVision}
                - Value Proposition: ${finalFormData.valueProposition}
                - Brand Image/Perception: ${finalFormData.brandImage}
                - Core Brand Values: ${finalFormData.brandValues}
                - Key Communication Messages: ${finalFormData.keyMessages}
                - Brand Personality: ${finalFormData.brandPersonality}
            `;
            newProjectData.competitorReport = await geminiService.generateCompetitorReport(companyDescription);
            
            setProgressMessage(t.pmStep3);
            newProjectData.keywordReport = await geminiService.generateKeywordReport(finalFormData.industry);
            newProjectData.leadGenerationStrategy = await geminiService.generateLeadGenerationStrategy(finalFormData.industry);

            setProgressMessage(t.pmStep4);
            newProjectData.strategy = await geminiService.generateStrategy(finalFormData.objective);

            setOnboardingState('complete');
            onCreateProject(newProjectData);

        } catch (error) {
            console.error("Onboarding failed:", error);
            setChatMessages(prev => [...prev, { sender: 'agent', text: "I'm sorry, an error occurred during analysis. Please try creating the project again."}]);
            setOnboardingState('chatting'); // Allow user to retry
        }
    };


    const renderContent = () => {
        if (onboardingState === 'chatting' || onboardingState === 'processing' || onboardingState === 'complete') {
            return (
                <div className="flex flex-col h-[60vh] max-h-[700px]">
                    <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-beige-100 dark:bg-slate-800/50 rounded-t-lg">
                       {chatMessages.map((msg, index) => (
                           <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                               <span className={`px-4 py-2 rounded-2xl inline-block max-w-sm break-words ${msg.sender === 'user' ? 'bg-accent-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
                                   {msg.text}
                               </span>
                           </div>
                       ))}
                       {onboardingState === 'processing' && (
                           <div className="flex justify-start">
                               <span className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none inline-flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-accent-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                   {progressMessage}
                               </span>
                           </div>
                       )}
                        {onboardingState === 'complete' && (
                             <div className="flex justify-start">
                               <span className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none">
                                  {t.pmComplete} Your new dashboard is ready!
                               </span>
                           </div>
                        )}
                    </div>
                    <form onSubmit={handleUserMessageSubmit} className="p-2 border-t border-beige-200 dark:border-slate-700 flex items-center gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            placeholder="Type your answer..."
                            disabled={onboardingState !== 'chatting'}
                            className="flex-grow bg-white dark:bg-slate-700 border border-beige-300 dark:border-slate-600 rounded-full px-4 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-500 disabled:opacity-50"
                            autoFocus
                        />
                        <button type="submit" disabled={onboardingState !== 'chatting' || !userInput} className="bg-accent-600 text-white rounded-full p-2.5 hover:bg-accent-500 disabled:bg-accent-700/50 disabled:cursor-not-allowed transition-colors">
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            );
        }

        return (
             <div className="text-center">
                <img src={logo} alt="Markewin Logo" className="w-24 h-24 mx-auto mb-4" />
                <button onClick={startChat} className="bg-accent-600 text-white font-bold py-3 px-6 rounded-md hover:bg-accent-500 mb-6 transition-colors transform hover:scale-105">
                    {t.pmCreateNew}
                </button>
                <p className="text-slate-500 dark:text-slate-400">{projects.length > 0 ? 'Or select an existing project from the dropdown above.' : t.pmNoProjects}</p>
            </div>
        );
    };

    return (
        <TaskCard title={t.projectManagerName} description={t.projectManagerDescription}>
            {renderContent()}
        </TaskCard>
    );
};

export default ProjectManager;