import productsData from "@/data/products.json";
import { fetchCustomerBrain } from "@/lib/customerMemory";
import { getSabanSmartResponse } from "@/app/actions/gemini-brain";

/**
 * פונקציה לעיצוב התוכן בסגנון "ח. סבן"
 * מנקה סימני Markdown, מוסיפה אימוג'ים ומסדרת רשימות
 */
function formatSabanStyle(text: string) {
  if (!text) return "";

  return text
    // 1. ניקוי כוכביות Markdown (הדגשות)
    .replace(/\*\*/g, '') 
    // 2. הפיכת רשימות כוכביות לסעיפים מעוצבים
    .replace(/^\* /gm, '🔹 ')
    .replace(/\n\* /g, '\n🔹 ')
    // 3. הוספת אימוג'ים תואמים למושגים טכניים
    .replace(/(סיקה|Sika|סיקה 107)/gi, '🏗️ $1')
    .replace(/(מ"ר|מר|מטר מרובע)/g, '📐 $1')
    .replace(/(קילו|ק"ג|קג)/g, '⚖️ $1')
    .replace(/(שק|שקים|שקית)/g, '📦 $1')
    .replace(/(הובלה|משאית|מנוף|טנדר)/g, '🚚 $1')
    .replace(/(מחיר|עלות|ש"ח|₪)/g, '💰 $1')
    // 4. הדגשת כותרות (הוספת קו מפריד או אימוג'י בולט)
    .replace(/(סיכום|טיפים|הוראות|שים לב):/g, '\n📌 $1:')
    .replace(/\n\n/g, '\n'); // מניעת רווחים כפולים מיותרים
}

export async function processSmartOrder(customerId: string, text: string) {
  // 1. שליפת זיכרון לקוח מה-CRM
  const memory: any = await fetchCustomerBrain(customerId);
  let name = "לקוח";
  if (memory && typeof memory === 'object' && 'name' in memory) {
    name = memory.name;
  }

  // 2. חילוץ המערך מתוך האובייקט (התאמה למבנה החדש)
  const inventory = (productsData as any).inventory || [];

  // 3. חיפוש מוצרים רלוונטיים ב-Inventory
  const foundProducts = inventory.filter((p: any) => 
    p.description && 
    p.name &&
    text.toLowerCase().includes(p.name.split(' ')[0].toLowerCase())
  );

  // 4. בניית הזרקת ידע (Context Injection) לגימני
  let expertContext = "";
  if (foundProducts.length > 0) {
    expertContext = foundProducts.map((p: any) => 
      `מוצר: ${p.name}. תיאור: ${p.description}. לוגיקת חישוב: ${p.calculation_logic}. מפרט: ${JSON.stringify(p.technical_specs)}`
    ).join('\n');
  }

  // 5. הפעלת המוח של Gemini
  let aiResponse: string = ""; 
  try {
    const promptWithContext = foundProducts.length > 0 
      ? `אתה המומחה של ח. סבן. השתמש בידע הבא כדי לענות ללקוח ${name}:\n${expertContext}\n\nשאלה: ${text}`
      : text;

    const rawResponse = await getSabanSmartResponse(promptWithContext, customerId);
    
    // הפעלת העיצוב המקצועי על התשובה
    aiResponse = formatSabanStyle(rawResponse || "");
    
    if (!aiResponse) {
      aiResponse = `שלום ${name}, המערכת בעומס קל. איך אוכל לעזור?`;
    }
  } catch (err) {
    console.error("AI Engine Error:", err);
    aiResponse = `אהלן ${name}, אני בודק לך את הפרטים במפרט הטכני.`;
  }

  // 6. חישוב לוגיסטי דינמי
  let recommendations: any[] = [];
  let totalWeight = 0;
  let hasHeavyItems = false;

  foundProducts.forEach((p: any) => {
    const areaMatch = text.match(/(\d+)\s*(מ"ר|מר|מטר)/);
    let qty = 1;
    
    if (areaMatch && p.calculation_logic) {
      const ratioMatch = p.calculation_logic.match(/(\d+(\.\d+)?)/);
      if (ratioMatch) {
        const area = parseInt(areaMatch[1]);
        const ratio = parseFloat(ratioMatch[1]);
        // חישוב שקים (לפי 25 ק"ג ממוצע לשק)
        qty = Math.ceil((area * ratio) / 25);
      }
    }

    recommendations.push({
      name: p.name,
      qty,
      description: p.description,
      calculation: p.calculation_logic
    });

    const weight = p.technical_specs?.unit_weight ? parseFloat(p.technical_specs.unit_weight) : 25;
    totalWeight += (qty * weight);
    if (p.logistics_tag === 'heavy' || weight >= 20) hasHeavyItems = true;
  });

  return {
    text: aiResponse,
    meta: {
      recommendations,
      logistics: {
        totalWeightKg: totalWeight,
        truckType: totalWeight > 1000 ? "משאית מנוף" : totalWeight > 0 ? "טנדר חלוקה" : "משלוח רגיל",
        needsCrane: totalWeight > 1000 || hasHeavyItems
      },
      customerName: name
    }
  };
}
