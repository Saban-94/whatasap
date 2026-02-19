import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import productsData from "@/data/products.json"; // ייבוא הקטלוג שלך

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    // 1. חיפוש מהיר בקטלוג המקומי (חוסך כסף וזמן)
    const localProduct = productsData.find(p => 
      p.name.includes(query) || p.sku === query
    );

    // 2. הכנת ה-Prompt לג'מיני (מבוסס על המידע שלך)
    const apiKey = (process.env.GEMINI_API_KEYS || "").split(",")[0].trim();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // אם המוצר נמצא במלאי, אנחנו נותנים לג'מיני את המידע שלך שיערוך אותו
    const context = localProduct 
      ? `Our warehouse info: Name: ${localProduct.name}, Consumption: ${localProduct.consumption}, Drying: ${localProduct.dryingTime}.`
      : "Product not in local catalog, please search your internal knowledge.";

    const prompt = `${context} User asked about: "${query}". Return a JSON with specs.`;

    const result = await model.generateContent(prompt);
    // ... המשך הלוגיקה של ה-JSON
    return NextResponse.json(JSON.parse(result.response.text()));

  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
