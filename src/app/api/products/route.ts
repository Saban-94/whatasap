import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to load inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('products')
      .upsert({
        sku: body.sku,
        name: body.name,
        description: body.description,
        category: body.category,
        stock_quantity: body.stock_quantity || 0,
        unit: body.unit || 'יח'
      })
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
  }
}
