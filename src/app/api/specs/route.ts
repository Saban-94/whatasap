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

    const prompt = `You are a construction expert. For the product "${query}", return strictly this JSON:
    {
      "consumptionPerM2": "string with units",
      "dryingTime": "string with units",
      "basis": "material base description",
      "confidence": number between 0-1
    }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed specs extraction" }, { status: 500 });
  }
}
