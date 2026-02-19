import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEYS?.split(',')[0] || "");

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Return JSON for construction product "${query}": { "consumptionPerM2": "string", "dryingTime": "string", "basis": "string", "confidence": number }`;
    const result = await model.generateContent(prompt);
    return NextResponse.json(JSON.parse(result.response.text()));
  } catch (error) {
    return NextResponse.json({ error: "Failed specs" }, { status: 500 });
  }
}
