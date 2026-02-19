import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// שליפת מוצרים מהדאטה-בייס
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('SabanOS API Error:', error);
    return NextResponse.json({ error: 'Failed to load inventory' }, { status: 500 });
  }
}

// יצירת/עדכון מוצר
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.sku || !body.name) {
      return NextResponse.json({ error: 'Missing SKU or Name' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('products')
      .upsert({
        sku: body.sku,
        name: body.name,
        description: body.description,
        category: body.category,
        image: body.image,
        stock_quantity: body.stock_quantity || 0,
        unit: body.unit || 'יח'
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error('SabanOS Save Error:', error);
    return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
  }
}
