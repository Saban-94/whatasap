import unifiedBrain from "@/data/saban_unified_brain.json";
import productsData from "@/data/products.json";

export async function processSmartOrder(context: string, query: string) {
  const products = (productsData as any).inventory || [];
  const calculators = (unifiedBrain as any).calculators;

  // 1. מנגנון חיזוי והיגיון (Fuzzy Matching)
  // אם המשתמש כתב "דבק" בלי לציין סוג, נציג לו את האופציות המובילות
  if (query.includes("דבק") || query.includes("להדביק")) {
    const suggestions = calculators.adhesive_grout.brands;
    return {
      text: "זיהיתי שאתה מחפש דבק. יש לי כמה אפשרויות מקצועיות עבורך בהתאם לסוג העבודה:",
      options: [
        { label: "תרמוקיר (ליישום עבה 4-8 מ\"מ)", value: "תרמוקיר" },
        { label: "סיקה (ליישום דק ומקצועי)", value: "סיקה" },
        { label: "מיסטר פיקס (סטנדרט גבוה)", value: "כרמית" }
      ],
      orderList: products.filter((p: any) => p.category?.includes("דבק")).slice(0, 3),
      type: 'prediction'
    };
  }

  // 2. היגיון בחישובי כמויות (חיזוי פחת ומוצרים משלימים)
  if (query.includes("מטר") || query.includes("ריצוף")) {
    const numbers = query.match(/\d+/g);
    const area = numbers ? parseInt(numbers[0]) : 0;
    
    if (area > 0) {
      const calc = calculators.tiling;
      const cartons = Math.ceil((area * 1.1) / 1.44);
      
      return {
        text: `עבור ${area} מ"ר, החישוב ההנדסי שלי חוזה שצריך בקרוב:`,
        predictionList: [
          { item: `${cartons} קרטונים של ריצוף`, reason: "כולל 10% פחת בטיחותי" },
          { item: `8 שקי דבק תואם`, reason: "לפי יחס כיסוי של 5 ק\"ג למ\"ר" },
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
