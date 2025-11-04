
import React from 'react';

interface HeaderProps {
    onToggleLeftPanel: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleLeftPanel }) => {
    return (
        <header className="h-[2.6rem] bg-[#333333] border-b border-[#22241e] flex items-center justify-between px-3 relative overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[rgba(187,134,252,0.1)] to-transparent animate-[quantumScan_3s_infinite_linear]" style={{'--glow': 'var(--quantum-glow)'}}></div>
            <div className="flex gap-3 items-center z-10">
                <button onClick={onToggleLeftPanel} className="text-sm bg-[#555] hover:bg-[#666] p-1 rounded">☰</button>
                <div className="font-bold text-lg animate-[quantumPulse_2s_infinite_alternate]">Nemodian 2244-1</div>
            </div>
            <div className="flex gap-2 items-center z-10">
                <div className="flex items-center gap-2 text-xs text-[#cfcfbd]">
                    <div className="w-2 h-2 rounded-full bg-[#4ac94a] animate-pulse"></div>
                    <div>Quantum AI: Entangled</div>
                </div>
            </div>
            <style>
                {`
                    @keyframes quantumScan {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                    @keyframes quantumPulse {
                        0% { opacity: 0.8; transform: scale(1); }
                        100% { opacity: 1; transform: scale(1.02); }
                    }
                `}
            </style>
        </header>
    );
};

export default Header;
