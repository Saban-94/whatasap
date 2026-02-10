"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function processBusinessRequest(prompt: string, businessContext: any) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: `אתה עוזר עסקי במערכת רמי. העסק הנוכחי: ${businessContext.name}. התחום: ${businessContext.industry}. תפקידך לעזור בניהול קטלוג ותורים.`
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
