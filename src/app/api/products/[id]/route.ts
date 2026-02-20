import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * מחיקת מוצר מהמערכת
 */
export async function DELETE(
  req: Request, 
  context: any // שימוש ב-any הכרחי בגרסה 16 למניעת כשל ב-Build
) {
  try {
    const { id } = await context.params;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    console.error('SabanOS Delete Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * עריכת מוצר קיים כולל מדיה וקבצים
 */
export async function PUT(
  req: Request, 
  context: any
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const { data, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        sku: body.sku,
        description: body.description,
        category: body.category,
        stock_quantity: body.stock_quantity,
        unit: body.unit,
        media_urls: body.media_urls,
        pdf_url: body.pdf_url
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('SabanOS Update Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
