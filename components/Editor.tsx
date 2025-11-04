import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { useSyntaxHighlighter } from '../hooks/useSyntaxHighlighter';
import { useDebounce } from '../hooks/useDebounce';
import { getCodeCompletions } from '../services/geminiService';
import CodeCompletion from './CodeCompletion';

interface EditorProps {
    content: string;
    onChange: (newContent: string) => void;
    onStatusChange: (status: { line: number, column: number, lines: number, chars: number }) => void;
}

const Editor: React.FC<EditorProps> = ({ content, onChange, onStatusChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);

    const { highlight } = useSyntaxHighlighter('html');

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showCompletions, setShowCompletions] = useState(false);
    const [completionPosition, setCompletionPosition] = useState({ top: 0, left: 0 });
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

    const [cursorInfo, setCursorInfo] = useState<{ offset: number, rect: DOMRect | null }>({ offset: 0, rect: null });
    const debouncedCursorInfo = useDebounce(cursorInfo, 400);

    const [cursorTarget, setCursorTarget] = useState<number | null>(null);

    useEffect(() => {
        const editor = editorRef.current;
        const selection = window.getSelection();
        const activeEl = document.activeElement;
        
        if (editor && editor.textContent !== content && selection && activeEl === editor) {
             const originalCursorOffset = (() => {
                if (selection.rangeCount === 0) return 0;
                const range = selection.getRangeAt(0);
                const preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(editor);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                return preCaretRange.toString().length;
            })();

            editor.innerHTML = highlight(content);
            setCursorTarget(originalCursorOffset);
        } else if (editor && editor.textContent !== content) {
            editor.innerHTML = highlight(content);
        }

        updateLineNumbers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, highlight]);

    useLayoutEffect(() => {
        if (cursorTarget !== null && editorRef.current) {
            let charCount = 0;
            let found = false;
            const walk = (node: Node) => {
                if (found) return;
                if (node.nodeType === Node.TEXT_NODE) {
                    const nextCharCount = charCount + node.textContent!.length;
                    if (cursorTarget <= nextCharCount && cursorTarget >= charCount) {
                        const range = document.createRange();
                        const sel = window.getSelection();
                        range.setStart(node, cursorTarget - charCount);
                        range.collapse(true);
                        sel?.removeAllRanges();
                        sel?.addRange(range);
                        found = true;
                    }
                    charCount = nextCharCount;
                } else {
                    node.childNodes.forEach(walk);
                }
            };
            walk(editorRef.current);
            setCursorTarget(null); // Reset after setting
            updateStatus(); // Update status after cursor move
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, cursorTarget]);

    useEffect(() => {
        const fetchCompletions = async () => {
            if (debouncedCursorInfo.offset > 0 && editorRef.current?.textContent && debouncedCursorInfo.rect) {
                const fullText = editorRef.current.textContent;
                const codeBefore = fullText.substring(0, debouncedCursorInfo.offset);
                const codeAfter = fullText.substring(debouncedCursorInfo.offset);
                
                const completions = await getCodeCompletions(codeBefore, codeAfter);

                if (completions.length > 0) {
                    setSuggestions(completions);
                    setSelectedSuggestionIndex(0);
                    setCompletionPosition({
                        top: debouncedCursorInfo.rect.bottom + window.scrollY,
                        left: debouncedCursorInfo.rect.left + window.scrollX
                    });
                    setShowCompletions(true);
                } else {
                    setShowCompletions(false);
                }
            } else {
                 setShowCompletions(false);
            }
        };

        fetchCompletions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedCursorInfo]);

    const handleInput = () => {
        const editor = editorRef.current;
        if (editor) {
            setShowCompletions(false);
            onChange(editor.textContent || '');
        }
    };

    const updateLineNumbers = () => {
        const editor = editorRef.current;
        const lineNumbers = lineNumbersRef.current;
        if (editor && lineNumbers) {
            const lineCount = editor.textContent?.split('\n').length || 1;
            lineNumbers.innerHTML = Array.from({ length: lineCount }, (_, i) => i + 1).join('<br>');
        }
    };
    
    const updateStatus = () => {
        const editor = editorRef.current;
        if (!editor) return;

        const text = editor.textContent || '';
        const lines = text.split('\n');
        let line = 1, column = 1;
        let offset = 0;
        let rect: DOMRect | null = null;

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(editor);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            const preCaretText = preCaretRange.toString();
            const preCaretLines = preCaretText.split('\n');
            line = preCaretLines.length;
            column = preCaretLines[preCaretLines.length - 1].length + 1;
            offset = preCaretText.length;
            rect = range.getBoundingClientRect();
        }
        
        setCursorInfo({ offset, rect });
        onStatusChange({ line, column, lines: lines.length, chars: text.length });
    };

    const handleAcceptSuggestion = (suggestion: string) => {
        const editor = editorRef.current;
        if (!editor) return;

        const fullText = editor.textContent || '';
        const codeBefore = fullText.substring(0, cursorInfo.offset);
        const codeAfter = fullText.substring(cursorInfo.offset);

        const newContent = `${codeBefore}${suggestion}${codeAfter}`;
        const newCursorPos = (codeBefore + suggestion).length;
        
        onChange(newContent);
        setCursorTarget(newCursorPos);
        setShowCompletions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (showCompletions && suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedSuggestionIndex(prev => (prev + 1) % suggestions.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                handleAcceptSuggestion(suggestions[selectedSuggestionIndex]);
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                setShowCompletions(false);
                return;
            }
        }

        if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            document.execCommand('insertHTML', false, '&#009');
        }
    };

    const handleScroll = () => {
        if (lineNumbersRef.current && editorRef.current) {
            lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
        }
        setShowCompletions(false); // Hide completions on scroll
    };

    return (
        <div className="editor-container relative flex flex-grow bg-[#1e1e1e] overflow-auto">
            <div
                ref={lineNumbersRef}
                className="w-[50px] p-2.5 text-right text-[#999966] bg-[#252526] select-none sticky left-0 z-10"
                style={{ lineHeight: '1.5em', fontFamily: 'inherit', fontSize: 'inherit' }}
            >
                1
            </div>
            <div
                ref={editorRef}
                contentEditable
                spellCheck="false"
                onInput={handleInput}
                onKeyUp={updateStatus}
                onClick={updateStatus}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                className="editor-content flex-grow p-2.5 pl-3 whitespace-pre-wrap break-words outline-none"
                style={{ lineHeight: '1.5em', fontFamily: 'inherit', fontSize: 'inherit', tabSize: 4 }}
                aria-autocomplete="list"
                aria-controls="suggestion-list"
            />
            {showCompletions && suggestions.length > 0 && (
                <CodeCompletion
                    suggestions={suggestions}
                    position={completionPosition}
                    selectedIndex={selectedSuggestionIndex}
                    onSelect={handleAcceptSuggestion}
                    onHover={(index) => setSelectedSuggestionIndex(index)}
                />
            )}
        </div>
    );
};

export default Editor;