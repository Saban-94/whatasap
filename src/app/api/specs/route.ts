import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import inventory from "@/data/inventory.json"; // הזיכרון המקומי של ח. סבן

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    // 1. חיפוש סמנטי בזיכרון המקומי (RAG)
    const normalizedQuery = query.toLowerCase().trim();
    const localProduct = inventory.find(p => 
      normalizedQuery.includes(p.name.toLowerCase()) || 
      normalizedQuery.includes(p.sku.toLowerCase()) ||
      p.name.toLowerCase().includes(normalizedQuery)
    );

    // 2. הכנת מפתחות ה-API (מנגנון Rotation)
    const keys = (process.env.GEMINI_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
    if (keys.length === 0) {
      return NextResponse.json({ error: "No API Keys configured" }, { status: 500 });
    }

    // 3. בניית ה-Context עבור ג'מיני
    // אם מצאנו מוצר בזיכרון, נכריח את ג'מיני להשתמש בנתונים שלך
    const internalContext = localProduct 
      ? `עבור המוצר "${localProduct.name}" (מק"ט: ${localProduct.sku}), אלו הנתונים הרשמיים מהמחסן של ח. סבן:
         - צריכה: ${localProduct.specs.consumptionPerM2}
         - זמן ייבוש: ${localProduct.specs.dryingTime}
         - בסיס חומר: ${localProduct.specs.basis}
         - תיאור: ${localProduct.description}
         השתמש בנתונים אלו בלבד!`
      : "המוצר לא נמצא במאגר המקומי של ח. סבן. השתמש בידע המקצועי שלך כמומחה לחומרי בניין כדי לספק נתונים משוערים ומדויקים ככל האפשר.";

    let lastError: any = null;

    // 4. ניסיון שליפה עם מנגנון דילוג בין מפתחות
    for (const key of keys) {
      try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
          System: You are SabanOS, a technical expert for H. Saban Logistics. 
          Respond in HEBREW.
          
          Context: ${internalContext}
          
          User Query: "${query}"
          
          Return STRICT JSON format:
          {
            "name": "שם המוצר המלא",
            "sku": "המק"ט",
            "consumptionPerM2": "נתון צריכה למ"ר",
            "dryingTime": "זמן ייבוש",
            "basis": "בסיס החומר",
            "description": "טיפ מקצועי קצר מהמומחה של סבן",
            "localMedia": ${localProduct ? JSON.stringify(localProduct.media) : "null"}
          }
        `;

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1, // דיוק מקסימלי
            responseMimeType: "application/json",
          },
        });

        const responseText = result.response.text();
        // ניקוי Markdown אם קיים
        const cleanJson = responseText.replace(/```json|```/g, "").trim();
        
        return NextResponse.json(JSON.parse(cleanJson));

      } catch (error: any) {
        console.warn(`מפתח API נכשל, מנסה את הבא...`);
        lastError = error;
        continue; // עובר למפתח הבא במערך
      }
    }

    // אם כל המפתחות נכשלו
    return NextResponse.json({ 
      error: "All API keys failed", 
      details: lastError?.message 
    }, { status: 502 });

  } catch (error: any) {
    console.error("Specs API Critical Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
