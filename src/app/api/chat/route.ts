import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 1. שלב החיפוש: האם המשתמש מחפש מוצר ספציפי או קטגוריה?
    // נשתמש בחיפוש טקסט חופשי ב-Supabase
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${message}%,sku.ilike.%${message}%,category.ilike.%${message}%`)
      .limit(3);

    if (error) throw error;

    // 2. עיבוד תשובה חכמה (לוגיקת ה"אח" של סבן)
    let aiResponse = "";

    if (products && products.length > 0) {
      const p = products[0];
      aiResponse = `מצאתי לך את ה${p.name}. \n`;
      aiResponse += `פרטים טכניים: כיסוי של ${p.coverage_per_meter || 'לא מוגדר'} ק"ג למ"ר, וזמן ייבוש של ${p.drying_time_hours || 'לא מוגדר'} שעות. \n`;
      
      // בדיקה אם המשתמש שאל על כמויות (מטר/מ"ר)
      const areaMatch = message.match(/(\d+)\s*(מטר|מר|מ"ר)/);
      if (areaMatch && p.coverage_per_meter) {
        const sqm = parseFloat(areaMatch[1]);
        const totalKg = sqm * p.coverage_per_meter;
        const bags = Math.ceil(totalKg / (p.pack_weight || 25));
        aiResponse += `\nלשטח של ${sqm} מ"ר, תצטרך בערך ${bags} שקים (לפי שק של ${p.pack_weight || 25} ק"ג).`;
      }

      if (p.pdf_url) {
        aiResponse += `\n\nתוכל לראות את המפרט המלא כאן: ${p.pdf_url}`;
      }
    } else {
      aiResponse = "אחי, לא מצאתי מוצר כזה במלאי. תנסה שם אחר או שתשאל אותי על קטגוריה כמו 'דבקים' או 'פריימר'.";
    }

    return NextResponse.json({ reply: aiResponse });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
