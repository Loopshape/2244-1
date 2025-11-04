import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is available from environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey });

export const generateCodeFragment = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: `You are an expert code generation AI. Your purpose is to write clean, efficient, and correct code based on the user's request.
- Only output raw code.
- Do not include any explanatory text, greetings, or markdown fences like \`\`\`javascript or \`\`\`.
- Your response must be only the code itself.`,
                temperature: 0.5,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 2048,
            }
        });
        
        const text = response.text;
        if (!text) {
            return "// Gemini returned an empty response.";
        }
        // Clean up potential markdown fences just in case
        return text.replace(/^```[\w]*\n|```$/g, '').trim();

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return `// Error generating code: ${error instanceof Error ? error.message : String(error)}`;
    }
};


export const getCodeCompletions = async (codeBeforeCursor: string, codeAfterCursor: string): Promise<string[]> => {
    // Only trigger if there is some context before the cursor and it's not just whitespace
    if (codeBeforeCursor.trim().length < 3) {
        return [];
    }

    // Heuristic to avoid triggering inside a string or comment
    const lastLine = codeBeforeCursor.split('\n').pop() || '';
    if (/\/\//.test(lastLine) || /['"`].*$/.test(lastLine) && !/['"`].*['"`].*$/.test(lastLine)) {
        return [];
    }

    const prompt = `You are an expert code completion AI assistant. Your task is to provide relevant code completion suggestions based on the provided context.
- Provide a JSON array of up to 5 completion suggestions as strings.
- The suggestions should be short, relevant, and aim to complete the current token or line.
- Do not suggest code that is already present immediately after the cursor.
- Your response must be a valid JSON array of strings.

--- CODE BEFORE CURSOR ---
${codeBeforeCursor}
--- END CODE BEFORE CURSOR ---

--- CODE AFTER CURSOR ---
${codeAfterCursor}
--- END CODE AFTER CURSOR ---
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1, // Lower temp for more predictable completions
                topK: 10,
                maxOutputTokens: 256,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                    },
                },
            }
        });

        const jsonStr = response.text.trim();
        const suggestions = JSON.parse(jsonStr);

        if (Array.isArray(suggestions) && suggestions.every(s => typeof s === 'string')) {
            return suggestions.filter(s => s.trim().length > 0); // Filter out empty suggestions
        }
        return [];

    } catch (error) {
        console.error("Error fetching code completions:", error);
        return []; // Return empty array on error, fail gracefully
    }
};
