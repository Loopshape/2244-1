
import React from 'react';

interface LeftPanelProps {
    isOpen: boolean;
    onOrchestrate: (prompt: string) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ isOpen, onOrchestrate }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <aside className="bg-[#252526] border-r border-[#22241e] p-2.5 flex flex-col gap-2 overflow-y-auto text-xs">
             <div className="text-[#999966] mt-5">
                <p className="font-bold mb-1">Quantum Actions:</p>
                <button onClick={() => onOrchestrate('Optimize the current code for performance and readability using fractal logic.')} className="w-full text-left p-2 rounded bg-[#333] hover:bg-[#444] mb-1.5">Quantum Optimize</button>
                <button onClick={() => onOrchestrate('Add detailed documentation and comments to the current code.')} className="w-full text-left p-2 rounded bg-[#333] hover:bg-[#444] mb-1.5">Fractal Document</button>
                <button onClick={() => onOrchestrate('Refactor the current code into a more modular and reusable structure.')} className="w-full text-left p-2 rounded bg-[#333] hover:bg-[#444]">Hyper Refactor</button>
                <button onClick={() => onOrchestrate('Analyze the provided code and generate 4 different refactoring suggestions. Then, create a consensus version that combines the best aspects of all suggestions.')} className="w-full text-left p-2 rounded bg-[#4ac94a] text-black font-bold hover:bg-[#5ad95a] mt-1.5">Multi-Agent Consensus</button>
            </div>

            <div className="text-[#999966] mt-5">
                <p className="font-bold mb-2">Orchestrator Settings:</p>
                <div className="mb-2">
                    <label htmlFor="agent-count" className="block mb-1">Agent Count:</label>
                    <input type="number" id="agent-count" min="2" max="8" defaultValue="4" className="w-20 bg-[#333] text-white border border-[#555] p-1 rounded" />
                </div>
                <div>
                    <label htmlFor="max-rounds" className="block mb-1">Max Rounds:</label>
                    <input type="number" id="max-rounds" min="1" max="10" defaultValue="3" className="w-20 bg-[#333] text-white border border-[#555] p-1 rounded" />
                </div>
            </div>
        </aside>
    );
};

export default LeftPanel;
