import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// שליפת כל המוצרים
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('SabanOS API Error:', error);
    return NextResponse.json({ error: 'Failed to load inventory', details: error.message }, { status: 500 });
  }
}

// יצירת מוצר חדש
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // מוודא שיש את השדות המינימליים
    if (!body.sku || !body.name) {
      return NextResponse.json({ error: 'Missing SKU or Name' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          sku: body.sku,
          name: body.name,
          description: body.description,
          category: body.category,
          image: body.image,
          stock_quantity: body.stock?.quantity || 0,
          unit: body.stock?.unit || 'יח',
          metadata: body // שומר את כל האובייקט לגיבוי
        }
      ])
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error('SabanOS Save Error:', error);
    return NextResponse.json({ error: 'Failed to save product', details: error.message }, { status: 500 });
  }
}
