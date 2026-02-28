export const dynamic = 'force-dynamic'; // קריטי למניעת שגיאות Build ב-Vercel

import { NextRequest, NextResponse } from 'next/server';
import { generateText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google'; // השם המעודכן מהשגיאה ב-Vercel
import { z } from 'zod';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// הגנה על ה-Build: שימוש ב-Placeholder אם המפתחות לא נמשכו בזמן הבנייה
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "Query is required" }, { status: 400 });

    const normalized = query.toLowerCase().trim();
    const key = crypto.createHash('sha256').update(`${normalized}|${process.env.DATA_VERSION || 'v1'}`).digest('hex');

    // 1. בדיקת קאש (Caching logic)
    const { data: cached } = await supabase.from('answers_cache').select('*').eq('key', key).maybeSingle();
    if (cached) {
      const age = Date.now() - new Date(cached.created_at).getTime();
      if (age < (cached.ttl || 2592000000)) return NextResponse.json(cached.payload);
    }

    // 2. מחשבון סבן (Calculator logic)
    if (normalized.includes("מטר") || normalized.includes("מ\"ר")) {
      const metersMatch = normalized.match(/\d+/);
      const meters = metersMatch ? parseInt(metersMatch[0]) : 0;
      if (meters > 0) {
        const boxes = Math.ceil(meters / 1.44);
        const blueprint = {
          text: `עבור ${meters} מ"ר, תצטרך ${boxes} קרטונים (לפי 1.44 מ"ר לקרטון).`,
          source: 'Saban Calculator',
          type: 'calculator',
          components: [{ type: 'calcCard', props: { meters, boxes } }]
        };
        await supabase.from('answers_cache').upsert({ key, payload: blueprint, ttl: 2592000000 });
        return NextResponse.json(blueprint);
      }
    }

    // 3. הגדרת המודל עם ה-API Key החדש
    const googleAI = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    });

    // 4. קריאה לבינה המלאכותית עם הכלים (Tools)
    const { text } = await generateText({
      model: googleAI('gemini-1.5-pro-latest') as any,
      system: `אתה המומחה של ח. סבן. עליך להחזיר תשובה בעברית מקצועית. 
               אם אתה מוצא מידע טכני, החזר אותו בפורמט JSON נקי.`,
      prompt: query,
      tools: {
        webSearch: tool({
          description: 'חיפוש מפרטים טכניים בגוגל',
          parameters: z.object({ q: z.string() }),
          execute: async ({ q }: { q: string }) => {
            const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_API_KEY}&cx=${process.env.GOOGLE_CSE_CX}&q=${encodeURIComponent(q)}`);
            return res.json();
          },
        } as any),
      },
    });

    let finalPayload;
    try {
      // ניקוי ה-JSON מהתשובה של הבינה המלאכותית
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      finalPayload = JSON.parse(cleanJson);
    } catch (e) {
      finalPayload = { text, source: 'Saban AI', type: 'fallback', components: [] };
    }

    // שמירה לקאש
    await supabase.from('answers_cache').upsert({ key, payload: finalPayload, ttl: 2592000000 });
    return NextResponse.json(finalPayload);

  } catch (error: any) {
    console.error("API Error:", error);
    // החזרת תשובה תקינה לממשק גם במקרה של שגיאה
    return NextResponse.json({ 
      text: "מצטער ראמי, יש לי תקלה קטנה בחיבור למחסן. תנסה שוב בעוד רגע?", 
      type: 'error' 
    }, { status: 200 });
  }
}
