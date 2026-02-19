import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
// ייבוא הקטלוג - וודא שהנתיב נכון ושם הקובץ תואם למה שיש לך ב-Project
import productsData from "@/data/inventory.json"; 

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    // --- תיקון השגיאה ( find on productsData.inventory ) ---
    // אנחנו מוודאים שהמערך קיים לפני שמחפשים
    const inventoryArray = Array.isArray(productsData) 
      ? productsData 
      : (productsData as any).inventory || [];

    const normalizedQuery = query.toLowerCase().trim();
    
    const localProduct = inventoryArray.find((p: any) => 
      p.name?.toLowerCase().includes(normalizedQuery) || 
      p.barcode === query || // שיניתי ל-barcode כי זה מה שמופיע בלוג שלך
      p.sku === query
    );
    // -------------------------------------------------------

    const keys = (process.env.GEMINI_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
    if (keys.length === 0) return NextResponse.json({ error: "No API Keys" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(keys[0]);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const context = localProduct 
      ? `INTERNAL DATA: Product ${localProduct.name} found. Specs: ${JSON.stringify(localProduct)}. Use this info.`
      : "Product not in local catalog. Use general knowledge.";

    const prompt = `
      System: You are SabanOS for H. Saban Logistics. 
      Respond in HEBREW.
      Context: ${context}
      User Query: "${query}"
      Return STRICT JSON:
      {
        "name": "string",
        "sku": "string",
        "consumptionPerM2": "string",
        "dryingTime": "string",
        "basis": "string",
        "description": "expert tip",
        "localMedia": ${localProduct?.media ? JSON.stringify(localProduct.media) : "null"}
      }
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
    });

    return NextResponse.json(JSON.parse(result.response.text()));

  } catch (error: any) {
    console.error("Build Fix Error:", error);
    return NextResponse.json({ error: "Internal Error", details: error.message }, { status: 500 });
  }
}
