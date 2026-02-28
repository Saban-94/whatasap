import { NextRequest, NextResponse } from 'next/server';
import { generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "Query is required" }, { status: 400 });

    const normalized = query.toLowerCase().trim();
    const key = crypto.createHash('sha256').update(`${normalized}|${process.env.DATA_VERSION || 'v1'}`).digest('hex');

    const { data: cached } = await supabase.from('answers_cache').select('*').eq('key', key).maybeSingle();
    if (cached) {
      const age = Date.now() - new Date(cached.created_at).getTime();
      if (age < (cached.ttl || 2592000000)) return NextResponse.json(cached.payload);
    }

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

    // התיקון הסופי: שימוש ב-any בתוך ה-tool כדי לעקוף את בעיית ה-Overload של ה-SDK
    const { text } = await generateText({
      model: google('gemini-1.5-pro-latest') as any,
      system: `אתה המומחה של ח. סבן. עליך להחזיר תשובה בפורמט JSON בלבד.`,
      prompt: query,
      tools: {
        webSearch: tool({
          description: 'חיפוש מפרטים טכניים בגוגל',
          parameters: z.object({ q: z.string() }),
          execute: async ({ q }: any) => {
            const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_API_KEY}&cx=${process.env.GOOGLE_CSE_CX}&q=${encodeURIComponent(q)}`);
            return res.json();
          },
        } as any),
      },
    });

    let finalPayload;
    try {
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      finalPayload = JSON.parse(cleanJson);
    } catch (e) {
      finalPayload = { text, source: 'Gemini AI', type: 'fallback', components: [] };
    }

    await supabase.from('answers_cache').upsert({ key, payload: finalPayload, ttl: 2592000000 });
    return NextResponse.json(finalPayload);

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
