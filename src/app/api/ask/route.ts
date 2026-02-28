import { NextRequest, NextResponse } from 'next/server';
import { generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// לקוח Supabase
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

    // 1. בדיקה ב-Cache
    const { data: cached } = await supabase.from('answers_cache').select('*').eq('key', key).maybeSingle();
    if (cached) {
      const age = Date.now() - new Date(cached.created_at).getTime();
      if (age < (cached.ttl || 2592000000)) {
        return NextResponse.json(cached.payload);
      }
    }

    // 2. לוגיקה מקומית (מ"ר)
    if (normalized.includes("מטר") || normalized.includes("מ\"ר")) {
      const meters = parseInt(normalized.match(/\d+/)?.[0] || "0");
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

    // 3. יצירת הטקסט עם ה-AI
    const { text } = await generateText({
      model: google('gemini-1.5-pro-latest'),
      system: `אתה המומחה של ח. סבן. עליך להחזיר תשובה בפורמט JSON בלבד.
               ה-JSON חייב לכלול: text, source, type, components.`,
      prompt: query,
      tools: {
        webSearch: tool({
          description: 'חיפוש מפרטים, תמונות או סרטונים בגוגל',
          // שים לב: parameters חייב להופיע לפני execute
          parameters: z.object({ q: z.string() }),
          execute: async ({ q }) => {
            const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_API_KEY}&cx=${process.env.GOOGLE_CSE_CX}&q=${encodeURIComponent(q)}`);
            return res.json();
          },
        })
      },
    });

    // פענוח ה-JSON
    let finalPayload;
    try {
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      finalPayload = JSON.parse(cleanJson);
    } catch (e) {
      finalPayload = {
        text: text,
        source: 'Gemini AI',
        type: 'fallback',
        components: []
      };
    }

    // שמירה ב-Supabase
    await supabase.from('answers_cache').upsert({ 
      key, 
      payload: finalPayload, 
      ttl: 2592000000 
    });

    return NextResponse.json(finalPayload);

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}    // 1. בדיקה ב-Supabase Cache
    const { data: cached } = await supabase.from('answers_cache').select('*').eq('key', key).maybeSingle();
    if (cached) {
      const age = Date.now() - new Date(cached.created_at).getTime();
      if (age < (cached.ttl || 2592000000)) {
        return NextResponse.json(cached.payload);
      }
    }

    // 2. לוגיקה מקומית מהירה (חישוב מ"ר)
    if (normalized.includes("מטר") || normalized.includes("מ\"ר")) {
      const meters = parseInt(normalized.match(/\d+/)?.[0] || "0");
      if (meters > 0) {
        const boxes = Math.ceil(meters / 1.44);
        const blueprint = {
          text: `עבור ${meters} מ"ר, תצטרך ${boxes} קרטונים (לפי 1.44 מ"ר לקרטון).`,
          source: 'Saban Calculator',
          type: 'calculator' as const,
          components: [{ type: 'calcCard' as const, props: { meters, boxes } }]
        };
        await supabase.from('answers_cache').upsert({ key, payload: blueprint, ttl: 2592000000 });
        return NextResponse.json(blueprint);
      }
    }

    // 3. שימוש ב-generateText (ללא maxSteps כדי למנוע את שגיאת ה-Build)
    const { text } = await generateText({
      model: google('gemini-1.5-pro-latest'),
      system: `אתה המומחה של ח. סבן. עליך להחזיר תשובה בפורמט JSON בלבד התואם לסכימת UIBlueprint.
               ה-JSON חייב לכלול: text, source, type, components.
               אל תוסיף הסברים מחוץ ל-JSON.`,
      prompt: query,
      tools: {
        webSearch: tool({
          description: 'חיפוש מפרטים, תמונות או סרטונים בגוגל Custom Search',
          execute: async ({ q }: { q: string }) => {
            const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_API_KEY}&cx=${process.env.GOOGLE_CSE_CX}&q=${encodeURIComponent(q)}`);
            return res.json();
          },
          parameters: z.object({ q: z.string() }),
        })
      },
    });

    // ניסיון פענוח ה-JSON מהטקסט של המודל
    let finalPayload;
    try {
      // ניקוי יסודי של תגיות Markdown
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      finalPayload = JSON.parse(cleanJson);
    } catch (e) {
      finalPayload = {
        text: text,
        source: 'Gemini AI',
        type: 'fallback',
        components: []
      };
    }

    // שמירה בקאש ל-30 יום
    await supabase.from('answers_cache').upsert({ 
      key, 
      payload: finalPayload, 
      ttl: 2592000000 
    });

    return NextResponse.json(finalPayload);

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
