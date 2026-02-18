import productsData from "@/data/products.json";
import { fetchCustomerBrain } from "@/lib/customerMemory";
import { getSabanSmartResponse } from "@/app/actions/gemini-brain";

export async function processSmartOrder(customerId: string, text: string) {
  const memory: any = await fetchCustomerBrain(customerId);
  const name = (memory?.name) ? memory.name : "אחי";
  
  // חילוץ המערך (מוודא שאנחנו עובדים על המבנה הנכון של ה-JSON)
  const inventory = Array.isArray(productsData) ? productsData : (productsData as any).inventory || [];

  // 1. שיפור הזיהוי: חיפוש מוצר לפי שם או ברקוד בתוך הטקסט
  const foundProducts = inventory.filter((p: any) => {
    if (!p.name) return false;
    
    const searchText = text.toLowerCase();
    const productName = p.name.toLowerCase();
    const barcode = p.barcode?.toString();

    // בדיקה אם הלקוח כתב את שם המוצר או את המק"ט שלו
    return searchText.includes(productName) || 
           (barcode && searchText.includes(barcode)) ||
           // בדיקה אם לפחות 3 מילים מהשם מופיעות (למקרים של שמות ארוכים)
           productName.split(' ').some((word: string) => word.length > 3 && searchText.includes(word));
  });

  // 2. בניית קונטקסט לגימני עם המק"ט ושם המוצר המדויק
  let expertContext = foundProducts.map((p: any) => 
    `[מק"ט: ${p.barcode}] שם מדויק: ${p.name}. תיאור: ${p.description || 'מוצר מלאי'}. חישוב: ${p.calculation_logic || 'לפי יחידות'}`
  ).join('\n');

  let aiResponse = ""; 
  try {
    const prompt = `אתה המחסנאי של ח. סבן. הלקוח שאל: "${text}".
    הנה המוצרים המדויקים שמצאתי במלאי:
    ${expertContext}
    
    ענה לו בצורה חברית ומקצועית. ציין את שמות המוצרים בדיוק כפי שהם מופיעים במלאי. 
    אל תשתמש בכוכביות (**).`;

    const raw = await getSabanSmartResponse(prompt, customerId);
    aiResponse = (raw || "").replace(/\*\*/g, '').trim();
  } catch (err) {
    aiResponse = `אהלן ${name}, אני בודק זמינות למק"טים שביקשת...`;
  }

  // 3. הכנת הרשימה ל-Sidebar עם כל הנתונים
  const orderList = foundProducts.map((p: any) => ({
    id: p.barcode,
    name: p.name, // השם המדויק מהאקסל
    qty: 1,
    price: p.price || "לפי מחירון",
    image: p.image_url,
    barcode: p.barcode,
    color: p.department?.includes('איטום') ? '#3b82f6' : '#10b981'
  }));

  return {
    text: aiResponse,
    orderList: orderList, // עובר ישירות לימין ב-Frontend
    meta: { recommendations: orderList }
  };
}
