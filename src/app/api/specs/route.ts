import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// הגדרת המפתח
const apiKey = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "").split(",")[0].trim();

// יצירת מופע של ה-AI
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    // פתרון השגיאה: שימוש במודל היציב ביותר
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // שם המודל המעודכן
    });

    const prompt = `You are a construction materials expert. 
    Provide technical specifications for: "${query}". 
    Return ONLY a JSON object with these keys: 
    "consumptionPerM2", "dryingTime", "basis", "confidence" (number 0-1).`;

    // ביצוע הקריאה עם הגדרת JSON
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    return NextResponse.json(JSON.parse(responseText));

  } catch (error: any) {
    console.error("Specs API Error Detailed:", error);
    
    // אם המודל עדיין לא נמצא, ננסה fallback למודל פרו (לפעמים המפתחות מוגבלים אליו)
    return NextResponse.json({ 
      error: "Model connection failed", 
      details: error.message 
    }, { status: 500 });
  }
}
