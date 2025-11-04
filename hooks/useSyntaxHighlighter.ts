
import { useCallback } from 'react';

const escapeHtml = (text: string) => {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const patterns: Record<string, Record<string, RegExp>> = {
    html: {
        comment: /(&lt;!--[\s\S]*?--&gt;)/g,
        tag: /(&lt;\/?[\w\d\s="'-:./#]+&gt;)/g,
    },
    js: {
        comment: /(\/\*[\s\S]*?\*\/)|(\/\/.*)/g,
        string: /(["'`])(?:(?=(\\?))\2.)*?\1/g,
        keyword: /\b(const|let|var|function|return|if|else|for|while|switch|case|break|new|class|extends|import|export|from|async|await|try|catch|finally)\b/g,
        number: /\b\d+(\.\d+)?\b/g,
        function: /\b[a-zA-Z_$][\w$]*(?=\s*\()/g,
        op: /(==|===|!=|!==|<=|>=|=>|[-+*/%=<>!&|^~?:.,;])/g,
        bracket: /([\[\]{}()])/g,
    },
};

export const useSyntaxHighlighter = (language: 'html' | 'js') => {
    const highlight = useCallback((text: string) => {
        if (!text) return '';
        
        let html = escapeHtml(text);
        const langPatterns = patterns[language] || patterns.js;

        Object.entries(langPatterns).forEach(([tokenType, regex]) => {
            html = html.replace(regex, (match) => `<span class="sh-${tokenType}">${match}</span>`);
        });

        return html;
    }, [language]);

    return { highlight };
};
