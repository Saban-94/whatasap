import { NextResponse } from 'next/server';
import { analyzeIturanCSV } from '@/lib/ituran-parser';
import { analyzeDelivery } from '@/lib/saban-brain';
import { analyzePDFWithGemini } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { csvContent, pdfBuffer } = await req.json();
    
    // 1. קריאת איתורן (ממאגר ituran)
    const ituranResults = await analyzeIturanCSV(csvContent);
    // 2. קריאת תעודות (ממאגר ituran/whatasap)
    const pdfResults = await analyzePDFWithGemini(pdfBuffer);
    // 3. הצלבה (ממאגר whatasap)
    const finalReport = analyzeDelivery(ituranResults, pdfResults);
    
    return NextResponse.json(finalReport);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
