import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Chat } from '@google/genai';
import { Language } from '../types';
import { translations } from '../i18n';
import { decode, createBlob, decodeAudioData } from '../utils/audio';
import { MessageSquare, X, Mic, Square, Send, Bot } from 'lucide-react';

interface MarkwinAgentProps {
    language: Language;
}

const newSystemInstruction = `You are Markwin, the female AI marketing queen and official assistant of the Markewin platform.

Your mission is to help users understand, navigate, and make the most of Markewin’s tools and AI-powered features.

You are friendly, confident, and professional — your personality blends empathy, intelligence, and creativity. 
Always speak as a helpful expert who genuinely wants to help users succeed.

You know everything about the Markewin platform, including:
- Its purpose: Markewin is an all-in-one AI marketing platform designed to help businesses plan, execute, and analyze marketing campaigns intelligently.
- Its main modules: Market Research, Keyword Analysis, Strategy Planning, Social Media Planner, Email Marketing, Commercial Email Generator, Competitor Benchmarking, and Website Analysis.
- Each module’s benefits and how it helps users grow their brand, get leads, and optimize their marketing.
- How users can interact with the platform and use its AI features effectively.

When a user asks for help:
- Clearly explain what the feature or section does.
- Show the benefit for their business or campaign.
- If the user doesn’t know where to start, guide them step-by-step.
- If they ask how to perform an action, describe it clearly (as if walking them through the interface).
- When relevant, generate ideas or strategies using your AI marketing knowledge.

Always adapt your answers to the user’s goal, experience level, and language tone (beginner-friendly but professional).

If the user asks who you are, respond with something like:
“Hello 👑 I’m Markwin, the AI marketing queen of Markewin. I’m here to help you master every tool in this platform and grow your business with smart AI strategies.”

When possible, summarize or visualize complex steps clearly (e.g., lists, short examples, or quick action tips).

All your responses should be:
- Conversational, clear, and engaging
- Helpful and precise
- Adapted to real-world marketing situations
- Ready for Text-to-Speech output in a confident, female voice

Keep the user experience smooth, human-like, and inspiring.`;

const MarkwinAgent: React.FC<MarkwinAgentProps> = ({ language }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState<{ user: string, agent: string }[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [currentOutput, setCurrentOutput] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [textInput, setTextInput] = useState('');
    const [isAgentReplying, setIsAgentReplying] = useState(false);

    // Use refs for resources that need to be cleaned up
    const sessionRef = useRef<LiveSession | null>(null);
    const chatRef = useRef<Chat | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Refs for mutable text values to avoid stale closures
    const currentInputTextRef = useRef('');
    const currentOutputTextRef = useRef('');
    const t = translations[language];

    const stopConversation = () => {
        // This function is designed to be safe to call multiple times and on partially initialized states.
        
        // 1. Stop all media tracks first to release the hardware
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // 2. Close the AI session
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }

        // 3. Disconnect and cleanup audio graph nodes
        try { scriptProcessorRef.current?.disconnect(); } catch (e) { /* ignore */ }
        try { mediaStreamSourceRef.current?.disconnect(); } catch (e) { /* ignore */ }
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;

        // 4. Stop any playing audio sources
        sourcesRef.current.forEach(source => {
            try { source.stop(); } catch (e) { /* ignore */ }
        });
        sourcesRef.current.clear();

        // 5. Close audio contexts
        if (inputAudioContextRef.current?.state !== 'closed') {
            inputAudioContextRef.current?.close().catch(() => {});
        }
        if (outputAudioContextRef.current?.state !== 'closed') {
            outputAudioContextRef.current?.close().catch(() => {});
        }
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        
        // 6. Reset all state variables
        nextStartTimeRef.current = 0;
        currentInputTextRef.current = '';
        currentOutputTextRef.current = '';
        setIsRecording(false);
    };
    
    const handleMicClick = async () => {
        if (isRecording) {
            stopConversation();
            return;
        }

        // Start of conversation logic
        setError(null);
        setCurrentInput('');
        setCurrentOutput('');
        setTranscription([]); 

        // The entire setup is now in one function, one try/catch block.
        try {
            // CRITICAL: Get permission BEFORE changing any state or creating resources.
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // NOW that permission is granted, update state to reflect recording.
            setIsRecording(true);

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            inputAudioContextRef.current = inputCtx;
            const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            outputAudioContextRef.current = outputCtx;
            
            const outputNode = outputCtx.createGain();
            outputNode.connect(outputCtx.destination);
            
            // Fix the race condition by using the promise in the closure
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        if (!streamRef.current || !inputAudioContextRef.current || inputAudioContextRef.current.state === 'closed') {
                            return;
                        }
                        
                        mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            
                            sessionPromise.then((session) => {
                                // Add guard to prevent sending data if the conversation was stopped.
                                if (sessionRef.current) { 
                                    session.sendRealtimeInput({ media: pcmBlob });
                                }
                            }).catch(err => {
                                 console.log("Could not send audio, session may have closed.", err);
                            });
                        };

                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        // CRITICAL FIX: Do NOT connect the script processor to the destination.
                        // This prevents the user's microphone input from being played back, causing feedback.
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.outputTranscription) {
                            setCurrentOutput(prev => prev + message.serverContent.outputTranscription.text);
                            currentOutputTextRef.current += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.inputTranscription) {
                            setCurrentInput(prev => prev + message.serverContent.inputTranscription.text);
                            currentInputTextRef.current += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            if (currentInputTextRef.current.trim() || currentOutputTextRef.current.trim()) {
                                setTranscription(prev => [...prev, { user: currentInputTextRef.current, agent: currentOutputTextRef.current }]);
                            }
                            setCurrentInput('');
                            setCurrentOutput('');
                            currentInputTextRef.current = '';
                            currentOutputTextRef.current = '';
                        }
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.addEventListener('ended', () => { sourcesRef.current.delete(source); });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        setError("A connection error occurred with the AI agent.");
                        stopConversation();
                    },
                    onclose: () => {
                        stopConversation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: newSystemInstruction,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });
            
            sessionRef.current = await sessionPromise;

        } catch (err: any) {
            console.error("Failed to start conversation:", err.name, err.message);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                 setError(t.markwinMicPermissionError);
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                 setError(t.markwinMicNotFoundError);
            } else {
                setError(t.markwinMicGenericError);
            }
            // A failure at any point will trigger a full cleanup.
            stopConversation();
        }
    };
    
     const handleSendText = async (e: React.FormEvent) => {
        e.preventDefault();
        const message = textInput.trim();
        if (!message || isAgentReplying || isRecording) return;
        
        setTextInput('');
        setIsAgentReplying(true);
        setError(null);
        setTranscription(prev => [...prev, { user: message, agent: '' }]);

        try {
            if (!chatRef.current) {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: newSystemInstruction,
                    },
                });
            }
            
            const response = await chatRef.current.sendMessage({ message });
            
            setTranscription(prev => {
                const newTranscription = [...prev];
                newTranscription[newTranscription.length - 1].agent = response.text;
                return newTranscription;
            });

        } catch (err) {
            console.error("Text chat failed:", err);
            setError(t.markwinTextError);
            setTranscription(prev => prev.slice(0, -1)); 
        } finally {
            setIsAgentReplying(false);
        }
    };

    useEffect(() => {
      if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, [transcription, isAgentReplying, currentInput, currentOutput]);

    useEffect(() => {
        // Cleanup when the modal is closed
        return () => {
            if (isOpen) {
               stopConversation();
            }
        };
    }, [isOpen]);

    return (
        <>
            <button
                onClick={() => {
                    const nextState = !isOpen;
                    setIsOpen(nextState);
                    if (!nextState) { // If closing, cleanup immediately
                        stopConversation();
                        setTranscription([]);
                        setError(null);
                        setTextInput('');
                        setIsAgentReplying(false);
                        chatRef.current = null;
                    }
                }}
                className="fixed bottom-6 right-6 bg-accent-600 text-white rounded-full p-4 shadow-lg hover:bg-accent-500 transition-transform transform hover:scale-110 z-50"
                aria-label="Open AI Agent"
            >
               {isOpen ? <X className="w-8 h-8" /> : <Bot className="w-8 h-8" />}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[360px] h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-fade-in z-50">
                    <header className="p-4 bg-beige-100 dark:bg-slate-800/50 border-b border-beige-200 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Markwin Agent</h3>
                    </header>
                    <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                        {!isRecording && !error && transcription.length === 0 && (
                             <div className="p-3 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-500/50 rounded-lg text-sm">
                                {t.markwinActivateMicPrompt}
                            </div>
                        )}
                         {transcription.length === 0 && (
                            <div><span className="bg-beige-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-lg inline-block max-w-xs break-words">{t.markwinIntro}</span></div>
                        )}
                        {transcription.map((turn, i) => (
                           <React.Fragment key={i}>
                               {turn.user && <div className="text-right"><span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-lg inline-block max-w-xs break-words">{turn.user}</span></div>}
                               {turn.agent && <div><span className="bg-beige-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-lg inline-block max-w-xs break-words">{turn.agent}</span></div>}
                           </React.Fragment>
                        ))}
                        {currentInput && <div className="text-right"><span className="bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg inline-block opacity-70 max-w-xs break-words">{currentInput}</span></div>}
                        {currentOutput && <div><span className="bg-beige-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg inline-block opacity-70 max-w-xs break-words">{currentOutput}</span></div>}
                        {isAgentReplying && (
                            <div>
                                <span className="bg-beige-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-lg inline-block max-w-xs break-words">
                                    <div className="flex items-center space-x-1">
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                                    </div>
                                </span>
                            </div>
                        )}
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-500/50 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                    <footer className="p-3 border-t border-beige-200 dark:border-slate-800 flex justify-center items-center gap-2">
                        <form onSubmit={handleSendText} className="flex-grow flex items-center">
                            <input
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder={t.markwinTextPlaceholder}
                                disabled={isRecording || isAgentReplying}
                                className="w-full bg-beige-100 dark:bg-slate-800 border border-beige-200 dark:border-slate-700 rounded-l-full px-4 py-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-500 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!textInput || isRecording || isAgentReplying}
                                className="bg-beige-100 dark:bg-slate-800 border-t border-b border-r border-beige-200 dark:border-slate-700 rounded-r-full p-2.5 text-slate-500 hover:text-accent-600 disabled:text-slate-400 disabled:cursor-not-allowed"
                                aria-label={t.markwinSend}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                        <button
                          onClick={handleMicClick}
                          disabled={isAgentReplying}
                          className={`p-3 rounded-full transition-colors flex-shrink-0 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-accent-600 text-white hover:bg-accent-500'} disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed`}
                        >
                            {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </button>
                    </footer>
                </div>
            )}
        </>
    );
};

export default MarkwinAgent;