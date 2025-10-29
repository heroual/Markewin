import React from 'react';

interface InfoTooltipProps {
    text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
    return (
        <div className="relative flex items-center group ml-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="absolute bottom-full mb-2 w-64 bg-slate-800 text-white dark:bg-slate-950 dark:border dark:border-slate-700 text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                {text}
                <svg className="absolute text-slate-800 dark:text-slate-950 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                </svg>
            </div>
        </div>
    );
};

export default InfoTooltip;