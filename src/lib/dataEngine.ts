import { GoogleGenerativeAI } from "@google/generative-ai";
import productsData from "@/data/products.json";
import inventory from "@/data/inventory.json";
import knowledge from "@/data/knowledge_cache.json";

// חילוץ מערך המוצרים מתוך המבנה של ח. סבן
// המערכת בודקת אם מדובר במערך ישיר או באובייקט עם שדה inventory
const products: any[] = Array.isArray(productsData) 
  ? productsData 
  : (productsData as any).inventory || [];

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function processSmartOrder(query: string, secondParam?: string) {
  const actualQuery = (typeof query === 'string' && secondParam) ? secondParam : query;
  const normalized = actualQuery.toLowerCase().trim();

  // 1. חיפוש בזיכרון המקומי (Cache)
  const cachedMatch = knowledge.find(k => normalized.includes(k.question.toLowerCase()));
  if (cachedMatch) {
    return { 
      text: cachedMatch.answer, 
      orderList: products.filter(p => cachedMatch.products?.includes(p.sku || p.barcode)),
      source: 'cache' 
    };
  }

  // 2. מנוע חישוב הנדסי
  if (normalized.includes("מטר") || normalized.includes("מ\"ר") || normalized.includes("חשב")) {
    const numMatch = normalized.match(/\d+/);
    const num = numMatch ? parseInt(numMatch[0]) : 0;
    
    if (num > 0) {
      const boxes = Math.ceil(num / 1.44); 
      const ceramic = products.find(p => p.name?.includes("60/60") || p.category?.includes("קרמיקה"));
      
      return {
        text: `עבור ${num} מ"ר, החישוב ההנדסי של ח. סבן חוזה שצריך כ-${boxes} קרטונים (לפי 1.44 מ"ר לקרטון).`,
        orderList: ceramic ? [ceramic] : [],
        source: 'calculator'
      };
    }
  }

  // 3. שליפה ישירה מהמלאי
  const directProduct = products.find(p => 
    normalized.includes(p.name?.toLowerCase()) || (p.sku && normalized.includes(p.sku.toLowerCase()))
  );

  if (directProduct) {
    // התאמה למבנה ה-inventory
    const stock = Array.isArray(inventory) ? inventory.find(i => i.product_id === directProduct.id) : null;
    return {
      text: `מצאתי את ${directProduct.name} במלאי.`,
      orderList: [directProduct],
      source: 'inventory'
    };
  }

  // 4. פנייה ל-Gemini 3.1 Pro
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-pro-preview",
      systemInstruction: "אתה המומחה הטכני של ח. סבן חומרי בניין. ענה בקצרה ובמקצועיות."
    });

    const result = await model.generateContent(normalized);
    const response = await result.response;
    
    return { 
      text: response.text(), 
      orderList: [], 
      source: 'Gemini 3.1 Pro' 
    };
  } catch (error) {
    return { 
      text: "אני סורק את המאגר... נסה לשאול על מוצר ספציפי או לבקש חישוב.", 
      orderList: [],
      source: 'fallback'
    };
  }
}
