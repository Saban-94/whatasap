import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET: משיכת כל המוצרים מהמלאי
 * כולל מיון לפי שם כדי שיהיה נוח למצוא מוצרים בקטלוג
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true }); // מיון אלפביתי בד"כ נוח יותר למלאי

    if (error) throw error;
    
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('SabanOS Fetch Error:', error.message);
    return NextResponse.json({ error: 'שגיאה במשיכת נתוני מוצרים' }, { status: 500 });
  }
}

/**
 * POST: יצירת מוצר חדש במערכת
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // וולידציה בסיסית לשדות חובה
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
          price: body.price || 0, // הוספתי שדה מחיר שלרוב נדרש
          media_urls: body.media_urls || [],
          pdf_url: body.pdf_url || null,
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      // טיפול במקרה של SKU כפול (ערך ייחודי ב-DB)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'מק"ט (SKU) זה כבר קיים במערכת' }, { status: 400 });
      }
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('SabanOS Create Error:', error.message);
    return NextResponse.json({ error: 'שגיאה ביצירת המוצר' }, { status: 500 });
  }
}
