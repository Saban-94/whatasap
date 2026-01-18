import { NextResponse } from 'next/server';
import { analyzeIturanCSV } from '@/lib/ituran-parser'; // נשתמש בפרסר שכבר בנית
import { analyzePDFWithGemini } from '@/lib/gemini'; // נשתמש בחיבור ל-Gemini

export async function POST(req: Request) {
  const { csvFileId, pdfFileId } = await req.json();

  // 1. קריאת נתוני האיתורן (מתי המנוף עבד באמת?)
  const ituranStats = await analyzeIturanCSV(csvFileId);
  
  // 2. קריאת התעודות בעזרת AI (מה הנהג רשם בכתב יד?)
  const pdfStats = await analyzePDFWithGemini(pdfFileId);

  // 3. הצלבת נתונים (Logic Hub)
  const crossReport = pdfStats.map(ticket => {
    const realPto = ituranStats.find(event => 
      event.address.includes(ticket.address) && event.type === 'PTO'
    );

    return {
      ticketNumber: ticket.id,
      driver: ticket.driver,
      reportedPto: ticket.manualTime, // מה שרשום ב-PDF
      actualPto: realPto ? realPto.duration : 'לא זוהה באיתורן',
      isAnomaly: calculateGap(ticket.manualTime, realPto?.duration) > 15, // חריגה מעל 15 דקות
      missingGear: checkRules(ticket.items, ticket.gear) // בדיקת בלות/משטחים
    };
  });

  return NextResponse.json(crossReport);
}
