
import React, { useState } from 'react';
import type { OrchestratorState } from '../hooks/useOrchestrator';
import AgentCard from './AgentCard';
import ConsensusPanel from './ConsensusPanel';
import { useSyntaxHighlighter } from '../hooks/useSyntaxHighlighter';

interface ResponsePanelProps {
    orchestratorState: OrchestratorState;
    agentRefs: { [key in keyof OrchestratorState['agents']]: React.RefObject<HTMLDivElement> };
    onApplyCode: (code: string) => void;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({ orchestratorState, agentRefs, onApplyCode }) => {
    const [isOpen, setIsOpen] = useState(true);
    const { highlight } = useSyntaxHighlighter('html');
    
    if (!orchestratorState.isVisible) {
        return null;
    }

    const handleCopyCode = () => {
        if (orchestratorState.finalCode) {
            navigator.clipboard.writeText(orchestratorState.finalCode);
        }
    };

    const handleApply = () => {
        if (orchestratorState.finalCode) {
            onApplyCode(orchestratorState.finalCode);
        }
    }

    return (
        <div className="fixed bottom-20 right-5 w-[500px] max-h-[600px] bg-[#252526] border border-[#4ac94a] rounded-lg shadow-2xl z-50 overflow-y-auto flex flex-col">
            <button onClick={() => setIsOpen(false)} className="absolute top-2 right-2 text-[#999966] hover:text-white text-lg">×</button>
            <div className="p-4">
                <AgentCard ref={agentRefs.nexus} name="Nexus" subtitle="Quantum Orchestrator" state={orchestratorState.agents.nexus} color="[#BB86FC]" />
                <AgentCard ref={agentRefs.cognito} name="Cognito" subtitle="Fractal Analyzer" state={orchestratorState.agents.cognito} color="[#03DAC6]" />
                <AgentCard ref={agentRefs.relay} name="Relay" subtitle="Quantum Communicator" state={orchestratorState.agents.relay} color="[#FFD54F]" />
                <AgentCard ref={agentRefs.sentinel} name="Sentinel" subtitle="Quantum Monitor" state={orchestratorState.agents.sentinel} color="[#CF6679]" />
                <div ref={agentRefs.echo}>
                    <div className={`agent-card bg-[#252526] rounded-lg p-3 mb-2 border-l-4 border-[#4ac94a] transition-all duration-300`}>
                        <div className={`font-bold text-sm mb-1 text-[#4ac94a]`}>Echo</div>
                        <div className="text-xs text-[#999966] mb-1.5">Quantum Reporter</div>
                        <div className="text-xs min-h-5">
                            {orchestratorState.isLoading && <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-t-[#03DAC6] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div><span>{orchestratorState.agents.echo.status}</span></div>}
                            {!orchestratorState.isLoading && orchestratorState.finalCode && (
                                <div>
                                    <pre className="bg-[#1a1a1a] p-2.5 rounded-md overflow-auto max-h-72 border border-[#03DAC6] text-xs"><code dangerouslySetInnerHTML={{ __html: highlight(orchestratorState.finalCode) }} /></pre>
                                    <div className="flex gap-2 mt-2.5">
                                        <button onClick={handleCopyCode} className="text-xs flex-1 bg-[#4ac94a] text-black font-bold p-1.5 rounded hover:bg-[#5ad95a]">Copy</button>
                                        <button onClick={handleApply} className="text-xs flex-1 bg-[#03DAC6] text-black font-bold p-1.5 rounded hover:bg-[#23ebe0]">Apply Code</button>
                                    </div>
                                </div>
                            )}
                            {!orchestratorState.isLoading && !orchestratorState.finalCode && <span>{orchestratorState.agents.echo.status}</span>}
                        </div>
                    </div>
                </div>

                {orchestratorState.candidates.length > 0 && (
                     <ConsensusPanel candidates={orchestratorState.candidates} consensusScore={orchestratorState.consensusScore} />
                )}
            </div>
        </div>
    );
};

export default ResponsePanel;
