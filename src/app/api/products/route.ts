import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET: משיכת כל המוצרים מהמלאי
 * מוגן מפני שגיאות 500 כדי למנוע קריסת ה-Dashboard
 */
export async function GET() {
  try {
    // וידוא קיום אובייקט supabase למניעת קריסה בשלב ה-Init
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase Fetch Error:', error.message);
      // מחזירים מערך ריק במקום שגיאה כדי שה-Frontend לא יקרוס (שגיאת ה-reduce)
      return NextResponse.json([]);
    }

    // החזרת נתונים או מערך ריק כברירת מחדל
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('SabanOS Critical Fetch Error:', error.message);
    // הגנה אחרונה - תמיד להחזיר מערך ב-GET של מוצרים
    return NextResponse.json([]);
  }
}

/**
 * POST: יצירת מוצר חדש במערכת
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // וולידציה בסיסית - הגנה מפני נתונים חסרים
    if (!body.name || !body.sku) {
      return NextResponse.json({ error: 'שם מוצר ו-SKU הם שדות חובה' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: body.name,
          sku: body.sku,
          description: body.description || '',
          category: body.category || 'כללי',
          stock_quantity: parseInt(body.stock_quantity) || 0,
          unit: body.unit || 'יח',
          price: parseFloat(body.price) || 0, // המרה למספר עשרוני בטוח
          media_urls: Array.isArray(body.media_urls) ? body.media_urls : [],
          pdf_url: body.pdf_url || null,
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      // טיפול במקרה של SKU כפול
      if (error.code === '23505') {
        return NextResponse.json({ error: 'מק"ט (SKU) זה כבר קיים במערכת' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('SabanOS Create Error:', error.message);
    return NextResponse.json(
      { error: 'שגיאה ביצירת המוצר: ' + (error.message || 'תקלה בשרת') }, 
      { status: 500 }
    );
  }
}
