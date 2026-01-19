import { NextResponse } from 'next/server';
import { parseIturanData } from '@/lib/ituran-parser'; 
import { analyzeDelivery } from '@/lib/saban-brain';
import { getAiInsight } from '@/lib/gemini';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { csvContent, pdfBuffer } = await req.json();
    
    // 1. קריאת איתורן
    const ituranData = await parseIturanData(csvContent);
    
    // 2. קריאת תעודות בעזרת AI
    const pdfResults = await getAiInsight(pdfBuffer);

    // 3. שליפת חוקי העסק מה-Firebase (הארגומנט החסר)
    const rulesSnapshot = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnapshot.docs.map(doc => doc.data());
    
    // 4. הצלבה עם כל 3 הארגומנטים הנדרשים
    const finalReport = analyzeDelivery(ituranData, pdfResults, rules);
    
    return NextResponse.json(finalReport);
  } catch (error: any) {
    console.error("Build Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
