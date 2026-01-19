import { NextResponse } from 'next/server';
import { parseIturanData } from '@/lib/ituran-parser'; 
import { analyzeDelivery } from '@/lib/saban-brain';
import { getAiInsight } from '@/lib/gemini';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { csvContent, pdfBuffer } = await req.json();
    const ituranData = await parseIturanData(csvContent);
    const pdfResults = await getAiInsight(pdfBuffer);
    
    const rulesSnapshot = await getDocs(collection(db, "business_rules"));
    const rules = rulesSnapshot.docs.map(doc => doc.data());
    
    const finalReport = analyzeDelivery(ituranData, pdfResults, rules);
    return NextResponse.json(finalReport);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
