import { GoogleGenerativeAI } from "@google/generative-ai";
import products from "@/data/products.json";
import savedKnowledge from "@/data/knowledge_cache.json"; // מאגר שאלות ותשובות שנשמרו

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function processSmartOrder(query: string) {
  const normalized = query.toLowerCase().trim();

  // 1. בדיקה בזיכרון המקומי (Cache) - חינם ומהיר
  const cachedMatch = savedKnowledge.find(k => normalized.includes(k.question));
  if (cachedMatch) {
    return { 
      text: cachedMatch.answer, 
      orderList: products.filter(p => cachedMatch.products?.includes(p.sku)),
      source: 'Local Knowledge' 
    };
  }

  // 2. מנוע חישוב הנדסי (מ"ר לקרטונים) - לוגיקה מקומית
  if (normalized.includes("מטר") || normalized.includes("מ\"ר")) {
    const num = parseInt(normalized.match(/\d+/)?.[0] || "0");
    if (num > 0) {
      const boxes = Math.ceil(num / 1.44); // לפי 60/60 סטנדרט
      const ceramic = products.find(p => p.tags?.includes("60/60"));
      return {
        text: `לשטח של ${num} מ"ר, תצטרך ${boxes} קרטונים של קרמיקה 60/60. האם להוסיף אותם להזמנה?`,
        orderList: ceramic ? [ceramic] : [],
        source: 'Saban Calculator'
      };
    }
  }

  // 3. שליפה מ-Gemini 3.1 Pro (רק אם אין תשובה מקומית)
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });
    const prompt = `אתה יועץ מומחה של "ח. סבן חומרי בניין". ענה על השאלה בצורה מקצועית וקצרה: ${query}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { text, orderList: [], source: 'Gemini 3.1 Pro' };
  } catch (error) {
    return { text: "המערכת בעומס, נסה שוב או פנה למלאי הידני.", orderList: [] };
  }
}  // 3. שליפה חכמה מה-Inventory (אם יש מילה תואמת)
  const directProduct = products.find(p => normalizedQuery.includes(p.name.toLowerCase()) || normalizedQuery.includes(p.id));
  if (directProduct) {
    const stock = inventory.find(i => i.product_id === directProduct.id);
    return {
      text: `מצאתי את ${directProduct.name} במלאי. נכון לעכשיו יש ${stock?.quantity || 0} יחידות ב${stock?.warehouse || 'מחסן'}.`,
      orderList: [directProduct],
      source: 'inventory'
    };
  }

  // 4. פנייה ל-AI (Gemini) רק כשאין פתרון מקומי
  return { 
    text: "אני סורק את מאגר המומחים... נסה לשאול על סיקה 107 או לבקש חישוב מ\"ר לקרמיקה.", 
    orderList: [], 
    source: 'ai_fallback' 
  };
}          { item: `8 שקי דבק תואם`, reason: "לפי יחס כיסוי של 5 ק\"ג למ\"ר" },
          { item: `2 ק\"ג רובה`, reason: "למילוי פוגות של 3 מ\"מ" }
        ],
        orderList: products.filter((p: any) => p.name.includes("60/60")).slice(0, 1),
        type: 'smart_forecast'
      };
    }
  }

  // 3. שליפה גמישה (אם לא נמצא מוצר מדויק, נחפש משהו דומה)
  const flexibleMatch = products.filter((p: any) => 
    p.name.split(' ').some((word: string) => query.includes(word))
  ).slice(0, 3);

  if (flexibleMatch.length > 0) {
    return {
      text: "לא מצאתי התאמה מדויקת ב-100%, אבל הנה התוצאות הכי קרובות במלאי של סבן:",
      orderList: flexibleMatch,
      type: 'flexible_match'
    };
  }

  return { text: "אני מנסה להבין את הכוונה... אולי תרצה לבצע חישוב או לשאול על מותג ספציפי?", orderList: [] };
}
