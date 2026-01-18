import { NextResponse } from 'next/server';
import { analyzeIturanCSV } from '@/lib/ituran-parser';
import { analyzePDFWithGemini } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { csvContent, pdfBuffer } = await req.json();

    // 1. חילוץ נתוני אמת מאיתורן (לפי דוח ה-CSV שהעלית)
    const ituranData = await analyzeIturanCSV(csvContent);
    
    // 2. חילוץ נתוני תעודה מה-AI (קריאת כתב יד מה-PDF)
    const pdfResults = await analyzePDFWithGemini(pdfBuffer);

    // 3. הצלבה (The Brain Logic)
    const report = pdfResults.map(ticket => {
      // מציאת זמן המנוף (PTO) באיתורן בכתובת של התעודה
      const actualPto = ituranData.find(event => 
        event.address.includes(ticket.address) && event.status === 'מנוע עובד'
      );

      // בדיקת חוקי ציוד (בלות/משטחים)
      const gearErrors = [];
      if (ticket.items.includes('מלט') && ticket.quantity >= 40 && !ticket.gear.includes('משטח')) {
        gearErrors.push('חסר חיוב משטח סבן');
      }
      if (ticket.items.includes('שק גדול') && ticket.gear_quantity < ticket.item_quantity) {
        gearErrors.push(`חסר חיוב ${ticket.item_quantity - ticket.gear_quantity} בלות`);
      }

      return {
        ticketId: ticket.id,
        driver: ticket.driver,
        address: ticket.address,
        reportedTime: ticket.manualTime,
        actualTime: actualPto ? actualPto.duration : 'לא זוהה PTO',
        isAnomalous: actualPto ? (ticket.manualTime - actualPto.duration > 15) : true,
        alerts: gearErrors,
        loss: gearErrors.length * 75 // שקלול נזק כספי
      };
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
