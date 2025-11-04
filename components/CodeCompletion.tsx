import React from 'react';

interface CodeCompletionProps {
    suggestions: string[];
    position: { top: number; left: number };
    selectedIndex: number;
    onSelect: (suggestion: string) => void;
    onHover: (index: number) => void;
}

const CodeCompletion: React.FC<CodeCompletionProps> = ({ suggestions, position, selectedIndex, onSelect, onHover }) => {
    return (
        <div
            id="suggestion-list"
            className="fixed bg-[#252526] border border-[#444] rounded-md shadow-lg z-[60] overflow-y-auto max-h-48 text-sm"
            style={{ top: position.top, left: position.left, minWidth: '200px' }}
        >
            <ul className="p-1" role="listbox">
                {suggestions.map((suggestion, index) => (
                    <li
                        key={index}
                        id={`suggestion-${index}`}
                        role="option"
                        aria-selected={index === selectedIndex}
                        className={`px-3 py-1.5 rounded cursor-pointer whitespace-pre ${
                            index === selectedIndex ? 'bg-[#007acc]' : 'hover:bg-[#333]'
                        }`}
                        onClick={() => onSelect(suggestion)}
                        onMouseEnter={() => onHover(index)}
                    >
                        {suggestion}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CodeCompletion;
