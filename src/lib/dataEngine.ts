import products from "@/data/products.json";
import inventory from "@/data/inventory.json";
import knowledge from "@/data/knowledge_cache.json";

export async function processSmartOrder(query: string) {
  const normalized = query.toLowerCase().trim();

  // 1. חיפוש בזיכרון המקומי (Cache)
  const cachedMatch = knowledge.find(k => normalized.includes(k.question.toLowerCase()));
  if (cachedMatch) {
    return { 
      text: cachedMatch.answer, 
      orderList: products.filter(p => cachedMatch.products?.includes(p.sku)),
      source: 'cache' 
    };
  }

  // 2. מנוע חישוב הנדסי (מ"ר לקרטונים)
  if (normalized.includes("מטר") || normalized.includes("מ\"ר")) {
    const numMatch = normalized.match(/\d+/);
    const num = numMatch ? parseInt(numMatch[0]) : 0;
    
    if (num > 0) {
      const boxes = Math.ceil(num / 1.44); // חישוב לפי קרמיקה 60/60
      const ceramic = products.find(p => p.tags?.includes("60/60"));
      return {
        text: `לשטח של ${num} מ"ר, תצטרך ${boxes} קרטונים של קרמיקה 60/60. האם להוסיף אותם להזמנה?`,
        orderList: ceramic ? [ceramic] : [],
        source: 'calculator'
      };
    }
  }

  // 3. שליפה ישירה מהמלאי לפי שם מוצר
  const directProduct = products.find(p => normalized.includes(p.name.toLowerCase()));
  if (directProduct) {
    const stock = inventory.find(i => i.product_id === directProduct.id);
    return {
      text: `מצאתי את ${directProduct.name} במלאי. נכון לעכשיו יש ${stock?.quantity || 0} יחידות ב${stock?.warehouse || 'מחסן'}.`,
      orderList: [directProduct],
      source: 'inventory'
    };
  }

  // 4. במידה ולא נמצא כלום - תשובה כללית
  return { 
    text: "אני סורק את מאגר המומחים... נסה לשאול על מוצר ספציפי או לבקש חישוב כמויות.", 
    orderList: [],
    source: 'ai_fallback'
  };
}    const prompt = `אתה יועץ מומחה של "ח. סבן חומרי בניין". ענה על השאלה בצורה מקצועית וקצרה: ${query}`;
    
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
