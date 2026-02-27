import products from "@/data/products.json";
import inventory from "@/data/inventory.json";
import savedKnowledge from "@/data/knowledge_cache.json";

export async function processSmartOrder(userId: string, query: string) {
  const normalizedQuery = query.toLowerCase().trim();

  // 1. בדיקת זיכרון מקומי (Cache) לחיסכון במכסות
  const cachedAnswer = savedKnowledge.find(k => normalizedQuery.includes(k.question.toLowerCase()));
  if (cachedAnswer) {
    const cachedProducts = products.filter(p => cachedAnswer.products?.includes(p.id));
    return { 
      text: cachedAnswer.answer, 
      orderList: cachedProducts, 
      source: 'cache' 
    };
  }

  // 2. מנוע חישוב הנדסי (מ״ר לקרטונים)
  if (normalizedQuery.includes("מטר") || normalizedQuery.includes("מ\"ר") || normalizedQuery.includes("חשב")) {
    const numMatch = normalizedQuery.match(/\d+/);
    if (numMatch) {
      const sqft = parseInt(numMatch[0]);
      // נוסחה: קרמיקה 60/60 = 1.44 מ״ר לקרטון
      const boxes = Math.ceil(sqft / 1.44);
      const targetProduct = products.find(p => p.tags?.includes("60/60"));
      
      const response = `עבור שטח של ${sqft} מ"ר, תזדקק ל-${boxes} קרטונים של פורצלן 60/60 (לפי 1.44 מ"ר לקרטון). האם להוסיף אותם להזמנה?`;
      return { 
        text: response, 
        orderList: targetProduct ? [targetProduct] : [], 
        source: 'logic_engine' 
      };
    }
  }

  // 3. שליפה חכמה מה-Inventory (אם יש מילה תואמת)
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
