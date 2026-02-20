import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * משיכת כל המוצרים מהמלאי
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('SabanOS Fetch Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * יצירת מוצר חדש
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: body.name,
          sku: body.sku,
          description: body.description,
          category: body.category,
          stock_quantity: body.stock_quantity || 0,
          unit: body.unit || 'יח',
          media_urls: body.media_urls || [],
          pdf_url: body.pdf_url || null
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('SabanOS Create Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
