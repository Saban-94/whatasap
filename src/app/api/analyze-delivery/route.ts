import { NextResponse } from 'next/server';
import { parseIturanData } from '@/lib/ituran-parser'; 
import { analyzeDelivery } from '@/lib/saban-brain';
import { getAiInsight } from '@/lib/gemini'; // שינוי שם הפונקציה לפי הצעת ה-Build

export async function POST(req: Request) {
  try {
    const { csvContent, pdfBuffer } = await req.json();
    
    // 1. קריאת איתורן (שימוש בשם הפונקציה המדויק)
    const ituranData = await parseIturanData(csvContent);
    
    // 2. קריאת תעודות בעזרת AI (שימוש ב-getAiInsight כפי שה-Build ביקש)
    const pdfResults = await getAiInsight(pdfBuffer);
    
    // 3. הצלבה ויצירת הדוח הסופי
    const finalReport = analyzeDelivery(ituranData, pdfResults);
    
    return NextResponse.json(finalReport);
  } catch (error: any) {
    console.error("Build Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
