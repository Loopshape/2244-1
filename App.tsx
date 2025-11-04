
import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import StatusBar from './components/StatusBar';
import LeftPanel from './components/LeftPanel';
import Editor from './components/Editor';
import Footer from './components/Footer';
import ResponsePanel from './components/ResponsePanel';
import { useOrchestrator } from './hooks/useOrchestrator';
import type { OrchestratorState } from './hooks/useOrchestrator';
import { animatePacket } from './utils/animations';

const App: React.FC = () => {
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);
    const [editorContent, setEditorContent] = useState<string>(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quantum Demo</title>
  <style>
    body {
      font-family: sans-serif;
      background: #111;
      color: #eee;
    }
  </style>
</head>
<body>
  <h1>Hello, Quantum World!</h1>
  <script>
    function greet() {
      console.log('Quantum Initialized!');
    }
    greet();
  </script>
</body>
</html>`);
    const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
    const [fileMeta, setFileMeta] = useState({ name: 'untitled.html', lines: 0, chars: 0 });

    const agentCardRefs = {
        nexus: useRef<HTMLDivElement>(null),
        cognito: useRef<HTMLDivElement>(null),
        relay: useRef<HTMLDivElement>(null),
        sentinel: useRef<HTMLDivElement>(null),
        echo: useRef<HTMLDivElement>(null),
    };
    const promptInputRef = useRef<HTMLInputElement>(null);

    const onAgentUpdate = useCallback(async (update: { from: keyof OrchestratorState['agents'] | 'prompt', to: keyof OrchestratorState['agents'] }) => {
        const fromEl = update.from === 'prompt' ? promptInputRef.current : agentCardRefs[update.from].current;
        const toEl = agentCardRefs[update.to].current;
        if (fromEl && toEl) {
            await animatePacket(fromEl, toEl);
        }
    }, [agentCardRefs, promptInputRef]);

    const orchestrator = useOrchestrator({ onAgentUpdate });

    const handleGenerate = (prompt: string) => {
        const fullPrompt = `${prompt}. \n\nHere is the current code context:\n\`\`\`html\n${editorContent}\n\`\`\``;
        orchestrator.startOrchestration(fullPrompt, editorContent);
    };
    
    const handleApplyCode = (code: string) => {
        setEditorContent(code);
    };

    return (
        <div className="h-screen w-screen bg-[#1e1e1e] text-[#f0f0e0] flex flex-col overflow-hidden">
            <Header onToggleLeftPanel={() => setIsLeftPanelOpen(prev => !prev)} />
            <StatusBar fileMeta={fileMeta} cursorPosition={cursorPosition} />
            <main className="flex-grow grid grid-cols-1 overflow-hidden" style={{ gridTemplateColumns: isLeftPanelOpen ? '240px 1fr' : '0px 1fr', transition: 'grid-template-columns 0.3s ease' }}>
                <LeftPanel isOpen={isLeftPanelOpen} onOrchestrate={handleGenerate} />
                <Editor
                    content={editorContent}
                    onChange={setEditorContent}
                    onStatusChange={(status) => {
                        setFileMeta(prev => ({ ...prev, lines: status.lines, chars: status.chars }));
                        setCursorPosition({ line: status.line, column: status.column });
                    }}
                />
            </main>
            <Footer onGenerate={handleGenerate} promptInputRef={promptInputRef} />
            
            <ResponsePanel
                orchestratorState={orchestrator.state}
                agentRefs={agentCardRefs}
                onApplyCode={handleApplyCode}
            />
        </div>
    );
};

export default App;
