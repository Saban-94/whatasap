import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    // 1. חילוץ המפתחות מה-ENV (מופרדים בפסיק)
    const keys = (process.env.GEMINI_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
    
    if (keys.length === 0) {
      return NextResponse.json({ error: "No API Keys configured" }, { status: 500 });
    }

    let lastError: any = null;

    // 2. לולאה שמנסה כל מפתח לפי הסדר (Rotation)
    for (const key of keys) {
      try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a construction materials expert. Return ONLY a JSON object for: "${query}" with:
        "consumptionPerM2", "dryingTime", "basis", "confidence" (0-1).`;

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        });

        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        
        // אם הצלחנו - מחזירים מיד את התשובה ועוצרים את הלולאה
        return NextResponse.json(JSON.parse(cleanJson));

      } catch (error: any) {
        console.warn(`מפתח נכשל, מנסה את המפתח הבא... שגיאה: ${error.message}`);
        lastError = error;
        // ממשיך למפתח הבא בלולאה
        continue;
      }
    }

    // 3. אם הגענו לכאן, סימן שכל המפתחות נכשלו
    return NextResponse.json({ 
      error: "All API keys exhausted or failed", 
      message: lastError?.message 
    }, { status: 502 });

  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
