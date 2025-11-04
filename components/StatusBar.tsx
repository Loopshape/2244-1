
import React from 'react';

interface StatusBarProps {
    fileMeta: { name: string; lines: number; chars: number };
    cursorPosition: { line: number; column: number };
}

const StatusBar: React.FC<StatusBarProps> = ({ fileMeta, cursorPosition }) => {
    return (
        <div className="h-6 bg-[#007acc] flex justify-between items-center px-3 text-xs text-white shrink-0">
            <div>{fileMeta.name}</div>
            <div>
                Cursor: {cursorPosition.line}:{cursorPosition.column} | Lines: {fileMeta.lines} | Chars: {fileMeta.chars}
            </div>
        </div>
    );
};

export default StatusBar;
