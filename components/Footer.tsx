
import React, { useState } from 'react';

interface FooterProps {
    onGenerate: (prompt: string) => void;
    promptInputRef: React.RefObject<HTMLInputElement>;
}

const Footer: React.FC<FooterProps> = ({ onGenerate, promptInputRef }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = () => {
        if (prompt.trim()) {
            onGenerate(prompt);
            setPrompt('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <footer className="h-16 bg-[#333333] border-t border-[#22241e] flex items-center p-3 shrink-0">
            <input
                ref={promptInputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter quantum command (e.g., 'rewrite this with fractal optimization')"
                className="flex-grow p-2 bg-[#00000030] border border-[#4ac94a] rounded-md text-base text-white focus:outline-none focus:ring-2 focus:ring-[#4ac94a]"
            />
            <button
                onClick={handleSubmit}
                className="ml-3 px-4 py-2 bg-[#4ac94a] text-black font-bold rounded-md hover:bg-[#5ad95a] transition-colors"
            >
                PROCESS
            </button>
        </footer>
    );
};

export default Footer;
