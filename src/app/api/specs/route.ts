import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import productsData from "@/data/inventory.json"; 

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, mode } = body;

    // שליפת המערך מתוך האובייקט (לפי המבנה שלך)
    const inventoryArray = Array.isArray(productsData) 
      ? productsData 
      : (productsData as any).inventory || [];

    // מצב סטודיו: מחזיר את כל הקטלוג מיד
    if (mode === "studio" || query === "GET_ALL_INVENTORY") {
      return NextResponse.json(inventoryArray);
    }

    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    const normalizedQuery = query.toLowerCase().trim();
    const localProduct = inventoryArray.find((p: any) => 
      p.name?.toLowerCase().includes(normalizedQuery) || p.barcode === query
    );

    // לוגיקת Gemini (רק אם צריך חיפוש חכם)
    const keys = (process.env.GEMINI_API_KEYS || "").split(",").map(k => k.trim()).filter(Boolean);
    const genAI = new GoogleGenerativeAI(keys[0]);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Return JSON for ${query}. Use local data if found: ${JSON.stringify(localProduct)}`;
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    return NextResponse.json(JSON.parse(result.response.text()));

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
