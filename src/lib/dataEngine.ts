import products from "@/data/products.json";
import { fetchCustomerBrain } from "@/lib/customerMemory";
import { getSabanSmartResponse } from "@/app/actions/gemini-brain";

export async function processSmartOrder(customerId: string, text: string) {
  // 1. שליפת זיכרון לקוח
  const memory: any = await fetchCustomerBrain(customerId);
  let name = "לקוח";
  if (memory && typeof memory === 'object' && 'name' in memory) {
    name = memory.name;
  }

  // 2. חיפוש מוצרים רלוונטיים מה-JSON המועשר (Expertise)
  // אנחנו מחפשים מוצרים שהשם שלהם מופיע בטקסט של הלקוח
  const foundProducts = (products as any[]).filter(p => 
    p.description && // מחפשים רק את המוצרים ה"מועשרים" (Top 100)
    text.includes(p.name.split(' ')[0]) // התאמה לפי מילה ראשונה של המוצר
  );

  // 3. בניית הזרקת ידע (Context Injection) לגימני
  let expertContext = "";
  if (foundProducts.length > 0) {
    expertContext = foundProducts.map(p => 
      `מוצר: ${p.name}. תיאור: ${p.description}. לוגיקת חישוב: ${p.calculation_logic}. מפרט: ${JSON.stringify(p.technical_specs)}`
    ).join('\n');
  }

  // 4. הפעלת המוח של Gemini עם הידע ההנדסי החדש
  let aiResponse: string = ""; 
  try {
    const promptWithContext = foundProducts.length > 0 
      ? `השתמש בידע הטכני הבא כדי לענות ללקוח:\n${expertContext}\n\nשאלה: ${text}`
      : text;

    const response = await getSabanSmartResponse(promptWithContext, customerId);
    aiResponse = response || `שלום ${name}, איך אוכל לעזור?`;
  } catch (err) {
    aiResponse = `אהלן ${name}, אני בודק לך את הפרטים במפרט הטכני.`;
  }

  // 5. חישוב לוגיסטי דינמי לפי ה-JSON
  let recommendations: any[] = [];
  let totalWeight = 0;
  let hasHeavyItems = false;

  foundProducts.forEach(p => {
    // אם הלקוח ציין מספר (מ"ר), ננסה לחשב כמויות
    const areaMatch = text.match(/(\d+)\s*(מ"ר|מר|מטר)/);
    let qty = 1;
    
    if (areaMatch && p.calculation_logic) {
      // לוגיקה פשוטה לחילוץ מספרים מהחישוב (למשל "3 ק"ג למ"ר")
      const ratioMatch = p.calculation_logic.match(/(\d+(\.\d+)?)/);
      if (ratioMatch) {
        const area = parseInt(areaMatch[1]);
        const ratio = parseFloat(ratioMatch[1]);
        qty = Math.ceil((area * ratio) / 25); // הנחה של שקים של 25 ק"ג
      }
    }

    recommendations.push({
      name: p.name,
      qty,
      description: p.description,
      calculation: p.calculation_logic
    });

    // חישוב משקל לוגיסטי
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
