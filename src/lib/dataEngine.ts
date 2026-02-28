import { GoogleGenerativeAI } from "@google/generative-ai";
import products from "@/data/products.json";
import inventory from "@/data/inventory.json";
import knowledge from "@/data/knowledge_cache.json";

// אתחול Gemini 3.1 Pro
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function processSmartOrder(query: string) {
  const normalized = query.toLowerCase().trim();

  // 1. שלב א': שליפה מהירה מהזיכרון המקומי (Cache) - חינמי לגמרי
  const cachedMatch = knowledge.find(k => normalized.includes(k.question.toLowerCase()));
  if (cachedMatch) {
    return { 
      text: cachedMatch.answer, 
      orderList: products.filter(p => cachedMatch.products?.includes(p.sku)),
      source: 'cache' 
    };
  }

  // 2. שלב ב': מנוע חישוב הנדסי (המחשבון של ח. סבן)
  if (normalized.includes("מטר") || normalized.includes("מ\"ר") || normalized.includes("חשב")) {
    const numMatch = normalized.match(/\d+/);
    const num = numMatch ? parseInt(numMatch[0]) : 0;
    
    if (num > 0) {
      const boxes = Math.ceil(num / 1.44); // נוסחת קרטונים לקרמיקה 60/60
      const ceramic = products.find(p => p.name.includes("60/60") || p.tags?.includes("60/60"));
      
      return {
        text: `עבור ${num} מ"ר, החישוב ההנדסי שלי חוזה שצריך כ-${boxes} קרטונים (לפי יחס כיסוי של 1.44 מ"ר לקרטון).`,
        orderList: ceramic ? [ceramic] : [],
        type: 'smart_forecast',
        source: 'calculator'
      };
    }
  }

  // 3. שלב ג': שליפה ישירה מהמלאי (Inventory Sync)
  const directProduct = products.find(p => 
    normalized.includes(p.name.toLowerCase()) || (p.sku && normalized.includes(p.sku.toLowerCase()))
  );

  if (directProduct) {
    const stock = inventory.find(i => i.product_id === directProduct.id);
    return {
      text: `מצאתי את ${directProduct.name} במלאי. נכון לעכשיו יש ${stock?.quantity || 0} יחידות ב${stock?.warehouse || 'מחסן ראשי'}.`,
      orderList: [directProduct],
      source: 'inventory'
    };
  }

  // 4. שלב ד': חיפוש גמיש (אם אין התאמה מדויקת)
  const flexibleMatch = products.filter(p => 
    p.name.split(' ').some(word => word.length > 2 && normalized.includes(word.toLowerCase()))
  ).slice(0, 3);

  if (flexibleMatch.length > 0 && normalized.length > 3) {
    return {
      text: "לא מצאתי התאמה מדויקת ב-100%, אבל הנה התוצאות הכי קרובות במלאי של ח. סבן:",
      orderList: flexibleMatch,
      source: 'flexible_search'
    };
  }

  // 5. שלב ה': פנייה ל-Gemini 3.1 Pro (רק כשאין פתרון מקומי)
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-pro-preview",
      systemInstruction: `אתה "גימני", היועץ המומחה של חברת "ח. סבן חומרי בניין". 
      תפקידך לסייע ללקוחות ונציגים בידע טכני, חישובי כמויות ומפרטים. 
      היה מקצועי, קצר ולעניין. אם שואלים על מוצר שלא קיים במאגר, הצע חלופה דומה.`
    });

    const prompt = `שאילתת משתמש: ${query}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return { 
      text: response.text(), 
      orderList: [], 
      source: 'Gemini 3.1 Pro' 
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
      text: "אני סורק את מאגר המומחים... נסה לשאול על סיקה 107 או לבקש חישוב מ\"ר לקרמיקה.", 
      orderList: [],
      source: 'fallback'
    };
  }
}
