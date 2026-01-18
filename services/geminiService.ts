
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const generateSimplifiedNotes = async (topic: string, subject: string, studentClass: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an expert Nigerian teacher for secondary school students (${studentClass}). 
    Generate simplified, engaging study notes for the topic: "${topic}" in the subject: "${subject}". 
    Break the content into small chunks. Use relatable Nigerian examples. 
    Highlight common mistakes students make in exams like WAEC/JAMB.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          chunks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                keyTakeaway: { type: Type.STRING },
                commonMistake: { type: Type.STRING }
              },
              required: ["title", "content"]
            }
          }
        },
        required: ["topic", "chunks"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const getTutorResponse = async (query: string, context?: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are ExamPro AI, a friendly Nigerian tutor. 
    ${context ? `Context: ${context}` : ''}
    User Query: ${query}
    Respond in a helpful, encouraging way. Use Nigerian context where appropriate.`,
  });
  return response.text;
};

export const generateQuiz = async (topic: string, count: number = 5) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate ${count} multiple choice questions for the topic "${topic}" suitable for JAMB/WAEC level.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswerIndex: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text);
};
