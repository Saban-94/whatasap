import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src/lib/inventory.json');

// פונקציית עזר לקריאת הקובץ
async function getInventory() {
  const fileData = await fs.readFile(dataPath, 'utf8');
  return JSON.parse(fileData);
}

export async function GET() {
  try {
    const data = await getInventory();
    return NextResponse.json({ ok: true, data: data.inventory || data });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Failed to load inventory' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const newProduct = await req.json();
    const data = await getInventory();
    
    // הוספת המוצר החדש
    const updatedInventory = [...(data.inventory || data), newProduct];
    
    // הערה: ב-Local זה ישמור לקובץ. ב-Vercel זה דורש DB חיצוני (כמו Supabase)
    // await fs.writeFile(dataPath, JSON.stringify({ inventory: updatedInventory }, null, 2));
    
    return NextResponse.json({ ok: true, data: newProduct });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Failed to save product' }, { status: 500 });
  }
}
