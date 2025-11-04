
import { useState, useCallback } from 'react';
import { generateCodeFragment } from '../services/geminiService';

// Simplified SHA-256 like hashing for deterministic simulation
const simpleHash = (...inputs: string[]): string => {
    const str = inputs.join('');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; 
    }
    return Math.abs(hash).toString(36);
};

const calculateEntropy = (str: string): number => {
    const freq: { [key: string]: number } = {};
    for (const char of str) {
        freq[char] = (freq[char] || 0) + 1;
    }
    let entropy = 0;
    const len = str.length;
    for (const char in freq) {
        const p = freq[char] / len;
        entropy -= p * Math.log2(p);
    }
    return isNaN(entropy) ? 0 : entropy;
};

export interface AgentState {
    status: string;
    isLoading: boolean;
}

export interface Candidate {
    candidate: string;
    agents: string[];
    count: number;
    totalEntropy: number;
    avgEntropy: number;
    score: number;
}

export interface OrchestratorState {
    agents: {
        nexus: AgentState;
        cognito: AgentState;
        relay: AgentState;
        sentinel: AgentState;
        echo: AgentState;
    };
    candidates: Candidate[];
    finalCode: string | null;
    consensusScore: number;
    isLoading: boolean;
    isVisible: boolean;
}

const initialAgentState: AgentState = { status: 'Ready', isLoading: false };
const initialOrchestratorState: OrchestratorState = {
    agents: {
        nexus: { status: 'Idle. Awaiting quantum command.', isLoading: false },
        cognito: initialAgentState,
        relay: initialAgentState,
        sentinel: initialAgentState,
        echo: { status: 'Awaiting quantum report...', isLoading: false },
    },
    candidates: [],
    finalCode: null,
    consensusScore: 0,
    isLoading: false,
    isVisible: false,
};

type AgentName = keyof OrchestratorState['agents'];
interface UseOrchestratorProps {
    onAgentUpdate?: (update: { from: AgentName | 'prompt', to: AgentName }) => Promise<void>;
}

export const useOrchestrator = ({ onAgentUpdate }: UseOrchestratorProps) => {
    const [state, setState] = useState<OrchestratorState>(initialOrchestratorState);

    const updateAgentState = (agent: AgentName, newSate: Partial<AgentState>) => {
        setState(prev => ({
            ...prev,
            agents: {
                ...prev.agents,
                [agent]: { ...prev.agents[agent], ...newSate },
            },
        }));
    };

    const startOrchestration = useCallback(async (prompt: string, context: string) => {
        setState({ ...initialOrchestratorState, isVisible: true, isLoading: true });

        // Rule 1 & 2: Genesis and Origin Hashes
        updateAgentState('nexus', { status: 'Generating Genesis Hash...', isLoading: true });
        await onAgentUpdate?.({ from: 'prompt', to: 'nexus' });
        const genesisHash = simpleHash('genesis', Date.now().toString());
        const agentIds = ['cognito-0', 'cognito-1', 'cognito-2', 'cognito-3'];
        const agentsOrigins = agentIds.map(id => ({ id, origin: simpleHash(genesisHash, id) }));
        updateAgentState('nexus', { status: 'Orchestrating agents...', isLoading: true });
        
        await new Promise(r => setTimeout(r, 500));

        // Rule 4: Spawn agents (simulate with Promise.all)
        updateAgentState('cognito', { status: 'Fractal reasoning in progress...', isLoading: true });
        await onAgentUpdate?.({ from: 'nexus', to: 'cognito' });

        const allCandidates: { agentId: string; fragment: string; origin: string }[] = [];
        const maxRounds = 2;

        for (let round = 0; round < maxRounds; round++) {
            updateAgentState('cognito', { status: `Reasoning Round ${round + 1}/${maxRounds}...`, isLoading: true });
            const roundPromises = agentsOrigins.map(async (agent) => {
                // Rule 5 & 7: Rehash origin and collaborate
                agent.origin = simpleHash(agent.origin, genesisHash, round.toString());
                const collaborationContext = allCandidates.length > 0
                    ? `\nReview these peer fragments for inspiration:\n${allCandidates.map(c => `// From ${c.agentId}:\n${c.fragment.substring(0, 80)}...`).join('\n')}`
                    : '';
                const agentPrompt = `You are an expert coding agent (${agent.id}). Your task is to respond to the following request. Use your unique origin hash to seed your creativity. Origin: ${agent.origin}\n\nRequest: ${prompt}\n\n${collaborationContext}`;
                const fragment = await generateCodeFragment(agentPrompt);
                return { agentId: agent.id, fragment, origin: agent.origin };
            });
            const roundResults = await Promise.all(roundPromises);
            allCandidates.push(...roundResults);
        }
        updateAgentState('cognito', { status: 'Reasoning complete.', isLoading: false });
        
        updateAgentState('relay', { status: 'Transmitting fragments...', isLoading: true });
        await onAgentUpdate?.({ from: 'cognito', to: 'relay' });
        await new Promise(r => setTimeout(r, 500));
        updateAgentState('relay', { status: 'Transmission complete.', isLoading: false });

        // Rule 9 & 10: Assemble final answer with consensus
        updateAgentState('sentinel', { status: 'Analyzing consensus and entropy...', isLoading: true });
        await onAgentUpdate?.({ from: 'relay', to: 'sentinel' });

        const candidateMap: Map<string, { agents: string[]; origins: string[] }> = new Map();
        for (const res of allCandidates) {
            const key = res.fragment.trim();
            if (!candidateMap.has(key)) candidateMap.set(key, { agents: [], origins: [] });
            candidateMap.get(key)!.agents.push(res.agentId);
            candidateMap.get(key)!.origins.push(res.origin);
        }

        let scoredCandidates: Candidate[] = Array.from(candidateMap.entries()).map(([candidate, data]) => {
            const totalEntropy = data.origins.reduce((sum, origin) => sum + calculateEntropy(origin), 0);
            const avgEntropy = totalEntropy / data.origins.length;
            return {
                candidate,
                agents: data.agents,
                count: data.agents.length,
                totalEntropy,
                avgEntropy,
                score: data.agents.length + avgEntropy * 0.5,
            };
        });

        scoredCandidates.sort((a, b) => b.score - a.score);
        
        const bestCandidate = scoredCandidates.length > 0 ? scoredCandidates[0] : null;
        updateAgentState('sentinel', { status: 'Consensus reached.', isLoading: false });
        
        updateAgentState('echo', { status: 'Generating final report...', isLoading: true });
        await onAgentUpdate?.({ from: 'sentinel', to: 'echo' });

        setState(prev => ({
            ...prev,
            candidates: scoredCandidates,
            finalCode: bestCandidate?.candidate || "// No consensus could be reached.",
            consensusScore: bestCandidate?.score || 0,
            isLoading: false,
            agents: {
                ...prev.agents,
                nexus: { status: 'Orchestration complete.', isLoading: false },
                echo: { status: 'Report generated.', isLoading: false }
            }
        }));

    }, [onAgentUpdate]);

    return { state, startOrchestration };
};
