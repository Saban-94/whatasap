import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// מחיקת מוצר
export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // params הוא Promise
) {
  try {
    const { id } = await params; // חילוץ ה-ID בצורה אסינכרונית
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('SabanOS Delete Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// עריכת מוצר
export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // params הוא Promise
) {
  try {
    const { id } = await params; // חילוץ ה-ID בצורה אסינכרונית
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
