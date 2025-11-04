
import React, { forwardRef } from 'react';
import type { AgentState } from '../hooks/useOrchestrator';

interface AgentCardProps {
    name: string;
    subtitle: string;
    state: AgentState;
    color: string;
}

const AgentCard = forwardRef<HTMLDivElement, AgentCardProps>(({ name, subtitle, state, color }, ref) => {
    return (
        <div ref={ref} className={`bg-[#252526] rounded-lg p-3 mb-2 border-l-4 border-${color} transition-all duration-300`}>
            <div className={`font-bold text-sm mb-1 text-${color}`}>{name}</div>
            <div className="text-xs text-[#999966] mb-1.5">{subtitle}</div>
            <div className="text-xs min-h-5">
                {state.isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-t-[#03DAC6] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        <span>{state.status}</span>
                    </div>
                ) : (
                    <span>{state.status}</span>
                )}
            </div>
        </div>
    );
});

AgentCard.displayName = 'AgentCard';
export default AgentCard;
