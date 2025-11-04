
import React from 'react';
import type { Candidate } from '../hooks/useOrchestrator';

interface ConsensusPanelProps {
    candidates: Candidate[];
    consensusScore: number;
}

const ConsensusPanel: React.FC<ConsensusPanelProps> = ({ candidates, consensusScore }) => {
    return (
        <div className="bg-[#252526] border border-[#BB86FC] rounded-lg p-4 mt-3 max-h-80 overflow-y-auto">
            <div className="flex justify-between items-center mb-2.5">
                <h3 className="font-bold text-[#BB86FC]">Multi-Agent Consensus</h3>
                <span className="text-xs bg-[#BB86FC] text-black px-2 py-0.5 rounded-full font-bold">
                    Score: {consensusScore.toFixed(2)}
                </span>
            </div>
            <div className="space-y-2">
                {candidates.map((candidate, index) => (
                    <div key={index} className={`bg-[#00000030] p-2 rounded-md border-l-4 ${index === 0 ? 'border-[#4ac94a]' : 'border-[#03DAC6]'}`}>
                        <div className="flex justify-between text-xs text-[#999966] mb-1">
                            <span>Agent(s): {candidate.agents.join(', ')}</span>
                            <span>Votes: {candidate.count} | Entropy: {candidate.avgEntropy.toFixed(2)}</span>
                        </div>
                        <pre className="text-xs font-mono whitespace-pre-wrap max-h-24 overflow-hidden text-ellipsis">
                            {candidate.candidate.substring(0, 150)}{candidate.candidate.length > 150 ? '...' : ''}
                        </pre>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ConsensusPanel;
