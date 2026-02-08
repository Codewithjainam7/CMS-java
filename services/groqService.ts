
import { Sentiment } from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface AIAnalysisResult {
    sentiment: Sentiment;
    category: string;
}

export const analyzeComplaintWithGroq = async (text: string): Promise<AIAnalysisResult | null> => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    const model = import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant';

    if (!apiKey) {
        console.warn('Groq API Key not found. Falling back to mock analysis.');
        return null;
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: `You are an AI assistant for a Customer Complaint System. 
                        Analyze the user's complaint and extract:
                        1. Sentiment: strictly one of "ANGRY", "FRUSTRATED", "NEUTRAL", "SATISFIED".
                        2. Category: strictly one of "Sexual Harassment", "Ragging", "Academic Issues", "Infrastructure", "Canteen/Hygiene", "Student Affairs", "Discrimination", "Other".
                        
                        Return ONLY a valid JSON object with keys "sentiment" and "category". Do not add any markdown formatting.`
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) return null;

        const result = JSON.parse(content);
        return {
            sentiment: result.sentiment as Sentiment,
            category: result.category
        };

    } catch (error) {
        console.error('Error calling Groq API:', error);
        return null;
    }
};
