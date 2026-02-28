import { GoogleGenerativeAI } from "@google/generative-ai";
import productsData from "@/data/products.json";
import inventoryData from "@/data/inventory.json";

const products: any[] = Array.isArray(productsData) ? productsData : (productsData as any).inventory || [];
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function processSmartOrder(query: string, secondParam?: string) {
  const actualQuery = (typeof query === 'string' && secondParam) ? secondParam : query;
  const normalized = actualQuery.toLowerCase().trim();

  // 1. בדיקת מילת מפתח "פרטים" - שליפה מורחבת
  if (normalized.includes("פרטים") || normalized.includes("עוד מידע")) {
    return await fetchExtendedDetails(actualQuery);
  }

  // 2. לוגיקת חישוב קיימת (לא משתנה)
  if (normalized.includes("מטר") || normalized.includes("מ\"ר")) {
    const num = parseInt(normalized.match(/\d+/)?.[0] || "0");
    if (num > 0) {
      const boxes = Math.ceil(num / 1.44);
      return {
        text: `עבור ${num} מ"ר, צריך כ-${boxes} קרטונים. תרצה "פרטים" על המוצר או הוראות יישום?`,
        orderList: products.filter(p => p.name.includes("60/60")).slice(0,1),
        source: 'calculator'
      };
    }
  }

  // 3. שליפה רגילה מהמלאי
  const product = products.find(p => normalized.includes(p.name?.toLowerCase()));
  if (product) {
    return {
      text: `מצאתי את ${product.name}. תרצה לקבל "פרטים" טכניים או סרטון הדרכה?`,
      orderList: [product],
      source: 'inventory'
    };
  }

  // 4. ברירת מחדל - Gemini 3.1 Pro
  return await callGemini(actualQuery);
}

// פונקציה חדשה לשליפת מידע עמוק + חיפוש גוגל
async function fetchExtendedDetails(query: string) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-pro-preview",
      // הוספת כלי חיפוש גוגל לשליפת תמונות וסרטונים
      tools: [{ googleSearchRetrieval: {} }] as any 
    });

    const result = await model.generateContent(`
      המשתמש ביקש פרטים נוספים על: ${query}.
      חפש במאגר האינטרנט: 
      1. מפרט טכני מלא.
      2. קישור לתמונת מוצר רלוונטית או סרטון יוטיוב של "ח. סבן" או הוראות יישום.
      ענה בעברית מקצועית.
    `);

    return {
      text: result.response.text(),
      source: 'Gemini 3.1 Pro + Google Search',
      type: 'extended'
    };
  } catch (e) {
    return { text: "לא הצלחתי לשלוף פרטים נוספים כרגע.", source: "error" };
  }
}

async function callGemini(query: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });
  const result = await model.generateContent(query);
  return { text: result.response.text(), source: 'Gemini 3.1' };
}
