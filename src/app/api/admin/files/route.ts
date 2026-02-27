import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET: קריאת תוכן של קובץ JSON ספציפי
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('file');

  if (!fileName) return NextResponse.json({ error: 'שם קובץ חסר' }, { status: 400 });

  try {
    const filePath = path.join(process.cwd(), 'src/data', `${fileName}.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'הקובץ לא נמצא' }, { status: 404 });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json({ content: JSON.parse(content) });
  } catch (error: any) {
    return NextResponse.json({ error: 'שגיאה בקריאת הקובץ' }, { status: 500 });
  }
}

/**
 * POST: שמירת תוכן חדש לקובץ JSON
 */
export async function POST(request: Request) {
  try {
    const { fileName, content } = await request.json();

    if (!fileName || !content) {
      return NextResponse.json({ error: 'נתונים חסרים לשמירה' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'src/data', `${fileName}.json`);
    
    // כתיבת התוכן לקובץ בפורמט JSON קריא (2 רווחים)
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');

    return NextResponse.json({ success: true, message: 'הקובץ נשמר בהצלחה' });
  } catch (error: any) {
    console.error("Save Error:", error);
    return NextResponse.json({ error: 'שגיאה בכתיבה לקובץ' }, { status: 500 });
  }
}
