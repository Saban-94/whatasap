import productsData from "@/data/products.json";
import { fetchCustomerBrain } from "@/lib/customerMemory";
import { getSabanSmartResponse } from "@/app/actions/gemini-brain";

/**
 * מנקה טקסט ומבטיח מראה מקצועי ללא סימנים דהויים
 */
function formatSabanDialogue(text: string) {
  return text
    .replace(/\*\*/g, '') // מחיקת כוכביות
    .replace(/ג'ימיני:|גימני:/g, '') // ניקוי שם הבוט אם הוא מופיע בתשובה
    .trim();
}

export async function processSmartOrder(customerId: string, text: string) {
  const memory: any = await fetchCustomerBrain(customerId);
  const name = (memory?.name) ? memory.name : "אחי";
  
  // גישה למאגר המוצרים המלא
  const inventory = Array.isArray(productsData) ? productsData : (productsData as any).inventory || [];

  // 1. לוגיקת זיהוי "חדה": מחפש מק"ט או שילוב מילים
  const foundProducts = inventory.filter((p: any) => {
    const searchText = text.toLowerCase();
    const productName = p.name?.toLowerCase() || "";
    const barcode = p.barcode?.toString() || "";

    // זיהוי לפי ברקוד מדויק או מילות מפתח (למשל 'סיקה' ו-'107')
    const keywords = productName.split(' ').filter((w: string) => w.length > 2);
    const hasAllKeywords = keywords.length > 0 && keywords.every((kw: string) => searchText.includes(kw));

    return searchText.includes(barcode) || searchText.includes(productName) || hasAllKeywords;
  });

  // 2. בניית קונטקסט קצר לגימני
  const productsFoundString = foundProducts.map(p => 
    `- ${p.name} (מק"ט: ${p.barcode}). חישוב: ${p.calculation_logic || 'לפי יחידות'}`
  ).join('\n');

  let aiResponse = ""; 
  try {
    const prompt = `
      אתה "גימני" מחברת ח. סבן. ענה ללקוח בשם ${name}.
      הסגנון: דיאלוג קצר, מקצועי, של מנהל עבודה. בלי חפירות.
      
      אם נמצאו מוצרים במלאי, ציין את שמם והמק"ט שלהם בקצרה.
      מוצרים שמצאתי במלאי:
      ${productsFoundString}

      הוראה קריטית: אל תשתמש בכוכביות (**). ענה ב-3-4 משפטים מקסימום.
      השאלה של הלקוח: "${text}"
    `;

    const raw = await getSabanSmartResponse(prompt, customerId);
    aiResponse = formatSabanDialogue(raw || "");
  } catch (err) {
    aiResponse = `אהלן ${name}, בודק לך את המק"ט במלאי רגע...`;
  }

  // 3. עדכון רשימת ההזמנה (Sidebar)
  const orderList = foundProducts.map((p: any) => ({
    id: p.barcode,
    name: p.name,
    barcode: p.barcode,
    qty: 1,
    price: p.price || "לפי מחירון",
    image: p.image_url,
    color: p.department?.includes('איטום') ? '#3b82f6' : '#10b981'
  }));

  return {
    text: aiResponse,
    orderList: orderList,
    customerName: name,
    meta: { recommendations: orderList }
  };
}
