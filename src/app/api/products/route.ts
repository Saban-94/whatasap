import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// מחיקת מוצר
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from('products').delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// עריכת מוצר
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
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
        media_urls: body.media_urls, // מערך של תמונות/סרטונים
        pdf_url: body.pdf_url
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
