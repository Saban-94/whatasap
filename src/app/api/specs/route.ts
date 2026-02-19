import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// תמיכה ברוטציה של מפתחות
const keys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "").split(",").map(k => k.trim());
const genAI = new GoogleGenerativeAI(keys[0]);

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Return STRICT JSON for construction product "${query}": 
    { "consumptionPerM2": "string", "dryingTime": "string", "basis": "string", "confidence": number }`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Specs API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
