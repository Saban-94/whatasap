import productsData from "@/data/products.json";
import { fetchCustomerBrain } from "@/lib/customerMemory";
import { getSabanSmartResponse } from "@/app/actions/gemini-brain";

/**
 * פונקציה לעיצוב טקסט מקצועי: מנקה סימנים דהויים, מדגישה ומסדרת אימוג'ים
 */
function formatSabanStyle(text: string) {
  if (!text) return "";
  return text
    .replace(/\*\*/g, '') // מחיקת כוכביות שיוצרות טקסט דהוי
    .replace(/^\* /gm, '🔹 ') // הפיכת נקודות ברשימה לסעיף מעוצב
    .trim();
}

export async function processSmartOrder(customerId: string, text: string) {
  // 1. שליפת זיכרון לקוח
  const memory: any = await fetchCustomerBrain(customerId);
  const name = (memory && typeof memory === 'object' && memory.name) ? memory.name : "אחי";
  
  // 2. חילוץ המלאי - תמיכה במבנה אובייקט או מערך
  const inventory = Array.isArray(productsData) ? productsData : (productsData as any).inventory || [];

  // 3. זיהוי מוצרים חכם (שם מדויק או מק"ט)
  const foundProducts = inventory.filter((p: any) => {
    const searchText = text.toLowerCase();
    const productName = p.name?.toLowerCase() || "";
    const barcode = p.barcode?.toString() || "";

    // חיפוש מק"ט מדויק או שם מוצר בתוך המשפט של הלקוח
    return (barcode && searchText.includes(barcode)) || 
           (productName && searchText.includes(productName)) ||
           // חיפוש חכם: אם מופיעות לפחות 2 מילים משמעותיות משם המוצר
           (productName.split(' ').filter((w: string) => w.length > 3)
            .every((word: string) => searchText.includes(word)));
  });

  // 4. בניית קונטקסט הנדסי לגימני
  const expertContext = foundProducts.map((p: any) => 
    `[מוצר במלאי] שם: ${p.name}, מק"ט: ${p.barcode}, תיאור: ${p.description || 'אין'}, חישוב: ${p.calculation_logic || 'לפי יחידות'}`
  ).join('\n');

  let aiResponse = ""; 
  try {
    const prompt = `אתה המומחה הטכני של ח. סבן. הלקוח ${name} שאל: "${text}".
    הנה המוצרים המדויקים מהמלאי שלנו שרלוונטיים לבקשה:
    ${expertContext}
    
    הנחיות לתשובה:
    - אל תשתמש בכוכביות (**). 
    - ציין את שמות המוצרים והמק"טים בדיוק כפי שהם מופיעים למעלה.
    - סדר את התשובה בסעיפים ברורים.
    - אם יש חישוב כמויות, הצג אותו בשורה נפרדת ומודגשת.`;

    const rawResponse = await getSabanSmartResponse(prompt, customerId);
    aiResponse = formatSabanStyle(rawResponse || "");
  } catch (err) {
    aiResponse = `אהלן ${name}, אני בודק זמינות במלאי עבור המק"טים שציינת...`;
  }

  // 5. הכנת רשימת ההזמנה ל-Sidebar (מצד ימין)
  const orderList = foundProducts.map((p: any) => ({
    id: p.barcode,
    name: p.name, // שם מדויק מהמלאי
    barcode: p.barcode, // מק"ט מקורי
    qty: 1, // כמות התחלתית לעריכה
    price: p.price || "לפי מחירון",
    image: p.image_url || null,
    color: p.department?.includes('איטום') ? '#3b82f6' : '#10b981', // צבעוניות לפי מחלקה
    category: p.department
  }));

  return {
    text: aiResponse,
    orderList: orderList, // הרשימה שתעבור לימין ב-Component
    customerName: name,
    meta: { recommendations: orderList } // תאימות למערכות אחרות
  };
}
