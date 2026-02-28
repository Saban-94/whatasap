import { GoogleGenerativeAI } from "@google/generative-ai";
import productsData from "@/data/products.json";
import inventoryData from "@/data/inventory.json";
import knowledgeData from "@/data/knowledge_cache.json";

// הגדרות מנוע חישוב וחיפוש
const SEARCH_ENGINE_ID = "1340c66f5e73a4076";
const products: any[] = Array.isArray(productsData) ? productsData : (productsData as any).inventory || [];
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

/**
 * הפונקציה המרכזית לשליפת נתונים - חסינה לשגיאות Build
 */
export async function processSmartOrder(query: string, secondParam?: string) {
  // טיפול בפרמטרים למניעת כפילויות (תומך ב-SmartChatView וגם ב-Canvas)
  const actualQuery = (typeof query === 'string' && secondParam) ? secondParam : query;
  const normalized = actualQuery.toLowerCase().trim();

  try {
    // 1. בדיקת מילת מפתח לפרטים מורחבים (חיפוש גוגל)
    if (normalized.includes("פרטים") || normalized.includes("מידע נוסף")) {
      return await fetchExtendedDetails(actualQuery);
    }

    // 2. חיפוש בזיכרון המקומי (Cache)
    const cachedMatch = (knowledgeData as any[]).find((k: any) => normalized.includes(k.question?.toLowerCase()));
    if (cachedMatch) {
      return { 
        text: cachedMatch.answer, 
        orderList: products.filter((p: any) => cachedMatch.products?.includes(p.sku || p.barcode)) || [],
        source: 'cache' 
      };
    }

    // 3. מנוע חישוב הנדסי (30 מ"ר -> 21 קרטונים)
    if (normalized.includes("מטר") || normalized.includes("מ\"ר")) {
      const num = parseInt(normalized.match(/\d+/)?.[0] || "0");
      if (num > 0) {
        const boxes = Math.ceil(num / 1.44); 
        return {
          text: `עבור ${num} מ"ר, תצטרך כ-${boxes} קרטונים (לפי 1.44 מ"ר לקרטון). תרצה "פרטים" נוספים?`,
          orderList: products.filter((p: any) => p.name?.includes("60/60")).slice(0, 1),
          source: 'calculator'
        };
      }
    }

    // 4. שליפה ישירה מהמלאי
    const product = products.find((p: any) => 
      normalized.includes(p.name?.toLowerCase()) || (p.sku && normalized.includes(p.sku.toLowerCase()))
    );
    if (product) {
      return {
        text: `מצאתי את ${product.name} במלאי של ח. סבן. תרצה לקבל "פרטים" טכניים?`,
        orderList: [product],
        source: 'inventory'
      };
    }

    // 5. ברירת מחדל - Gemini 3.1 Pro
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-pro-preview",
      systemInstruction: "אתה המומחה של ח. סבן. ענה בקצרה ובמקצועיות."
    });
    const result = await model.generateContent(normalized);
    return { 
      text: result.response.text(), 
      orderList: [], 
      source: 'Gemini 3.1 Pro' 
    };

  } catch (error) {
    console.error("Engine Error:", error);
    return { 
      text: "אני סורק את המאגר... נסה לשאול על מוצר ספציפי או לבצע חישוב.", 
      orderList: [], 
      source: 'fallback' 
    };
  }
}

/**
 * פונקציה פנימית לשליפת מידע מגוגל ומדיה
 */
async function fetchGoogleDetails(query: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY; 
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`;
    
    const searchRes = await fetch(url);
    const searchData = await searchRes.json();
    
    const firstImage = searchData.items?.[0]?.pagemap?.cse_image?.[0]?.src;
    const youtubeLink = searchData.items?.find((i: any) => i.link.includes('youtube.com'))?.link;

    return {
      snippet: searchData.items?.[0]?.snippet || "",
      image: firstImage,
      video: youtubeLink
    };
  } catch (e) {
    return null;
  }
}

async function fetchExtendedDetails(query: string) {
  const searchResults = await fetchGoogleDetails(query);
  
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });
  const prompt = `נתח את המידע מגוגל: ${searchResults?.snippet}. ספק מפרט טכני עבור: ${query}. ציין אם יש סרטון הדרכה. ענה בעברית.`;
  
  const result = await model.generateContent(prompt);
  
  return {
    text: result.response.text(),
    orderList: [],
    media: {
      image: searchResults?.image,
      video: searchResults?.video
    },
    source: 'Google Search + Gemini 3.1',
    type: 'extended'
  };
}
