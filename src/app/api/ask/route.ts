import { NextRequest, NextResponse } from 'next/server';
import { generateObject, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// לקוח Supabase מאובטח לצד שרת
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

// סכימת ה-UIBlueprint הממותגת של ח. סבן
const UIBlueprint = z.object({
  text: z.string(),
  source: z.string(),
  type: z.enum(['local', 'calculator', 'inventory', 'extended', 'fallback']),
  components: z.array(z.object({
    type: z.enum(['orb', 'productCard', 'specCard', 'videoCard', 'calcCard']),
    props: z.any()
  })),
  media: z.object({
    image: z.string().optional(),
    video: z.string().optional()
  }).optional()
});

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  const normalized = query.toLowerCase().trim();
  const key = crypto.createHash('sha256').update(`${normalized}|${process.env.DATA_VERSION}`).digest('hex');

  // שלב 1: בדיקה ב-Supabase Cache
  const { data: cached } = await supabase.from('answers_cache').select('*').eq('key', key).single();
  if (cached && (Date.now() - new Date(cached.created_at).getTime() < cached.ttl)) {
    return NextResponse.json(cached.payload);
  }

  // שלב 2: לוגיקת חישוב מקומית (דוגמה ל-30 מ"ר -> 21 קרטונים)
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
      await supabase.from('answers_cache').upsert({ key, payload: blueprint });
      return NextResponse.json(blueprint);
    }
  }

  // שלב 3: Gemini 3.1 Pro + Google Search Tool
  const { object } = await generateObject({
    model: google('gemini-3.1-pro-preview'),
    system: "אתה המומחה של ח. סבן. החזר JSON לפי סכימת UIBlueprint. השתמש בחישובים מדויקים.",
    prompt: query,
    schema: UIBlueprint,
    tools: {
      webSearch: tool({
        description: 'חישוב מורכב או חיפוש מדיה בגוגל',
        inputSchema: z.object({ q: z.string() }),
        execute: async ({ q }) => {
          const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_API_KEY}&cx=${process.env.GOOGLE_CSE_CX}&q=${q}`);
          return res.json();
        }
      })
    }
  });

  await supabase.from('answers_cache').upsert({ key, payload: object });
  return NextResponse.json(object);
}
