export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  let activeModelName = "None";
  try {
    // 1) קבלת גוף ההודעה עם הגנה מלאה
    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];

    if (messages.length === 0) {
      return Response.json({ text: "שלום ראמי, סבן AI מוכן לעבודה. איך אוכל לעזור?" });
    }

    // 2) חילוץ טקסט חסין – מונע שגיאות trim()
    const lastMsgObj = messages[messages.length - 1];
    const rawText = lastMsgObj.content || lastMsgObj.text || "";
    const lastMsg = rawText.toString().trim();

    // 3) מפתחות סביבה (לא משנים את הקיים)
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

    // 4) שליפת נתונים מ‑Supabase (מבודד)
    let products: any[] = [];
    if (lastMsg && supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data } = await supabase
          .from("inventory")
          .select("*")
          .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
          .limit(2);
        if (data) products = data;
      } catch (e) { console.error("DB Error:", e); }
    }

    // 4.1) NEW: צמצום קונטקסט מוצרים ל‑system (שדות רלוונטיים בלבד + חיתוך אורך)
    const minimized = (products || []).map((p) => {
      // מיפוי שדות נפוצים; תישאר סלחני אם אין עמודות מסוימות
      return {
        sku: p.sku || p.SKU || p.product_sku || undefined,
        name: p.product_name || p.name || undefined,
        category: p.category || undefined,
        bag_kg: p.bag_kg || p.unit_weight_kg || 25,
        consumption_kg_m2_low: p.consumption_kg_m2_low || p.consumption_low,
        consumption_kg_m2_high: p.consumption_kg_m2_high || p.consumption_high,
      };
    }).filter(Boolean);

    // חיתוך אורך כדי לא לנפח prompt
    let safeProductsContext = JSON.stringify(minimized);
    if (safeProductsContext.length > 2000) {
      safeProductsContext = safeProductsContext.slice(0, 2000) + "...";
    }

    // 5) לופ מודלים (נשאר כפי שהוא)
    const modelsToTry = [
      "gemini-3.1-flash-image-preview",
      "gemini-3-flash-preview",
      "gemini-1.5-flash-latest"
    ];

    if (!geminiKey) throw new Error("Missing Gemini API Key");
    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });

    let finalResponseText = "";

    // 5.1) NEW: System Prompt מקצועי + דרישה ל‑JSON בתוך הטקסט
    const SYSTEM_PROMPT = `
את/ה יועץ/ת מכירות ומומחה/ית טכני/ת בכיר/ה של "ח. סבן חומרי בניין".
מטרתך: לתת ייעוץ מקצועי, מדויק וממיר לעסקה בעברית ברורה ואדיבה.

נתוני מוצרים זמינים (תמצית): ${safeProductsContext}

חוקי עבודה:
- אם שואלים על כמות/שטח: חשב/י כמות לפי:
  כמות_ק"ג = שטח_במ"ר × צריכה_ק"ג_למ"ר ; מס' שקים = תקריב מעלה(כמות_ק"ג / משקל_שק).
  הוסף/י שק רזרבה רק אם השטח ≥ 30 מ"ר או אריחים גדולים; ציין/י את ההנחות (גודל שן/מצע/טווחי צריכה).
- אם נתון חסר (צריכה/משקל שק) – בקש/י הבהרה או ציין/י שזה אומדן.
- לעולם אין "להמציא" נתונים טכניים. אם לא בטוח/ה – אמר/י זאת.
- כל תשובה תסתיים בהנעה לפעולה להוספה ל"עגלה" לקבלת הצעת מחיר בוואטסאפ.
- הוסף/י "טיפ זהב" קצר ליישום (למוצר פרימיום/רלוונטי).

יציאה נדרשת (באותו טקסט, קודם JSON ואז ניסוח ללקוח):
1) JSON תקין בין שלשות גרשיים \`\`\`json ... \`\`\` במבנה:
{
  "action": "ADVISE_AND_QUOTE",
  "items": [
    {
      "sku": "<SKU או null אם לא ידוע>",
      "name": "<שם מוצר>",
      "unit": "bag",
      "unitWeightKg": <מספר>,
      "qtyBags": <מספר>,
      "assumptions": {
        "area_m2": <או null>,
        "consumption_kg_m2": <או null>,
        "reserveBag": <0|1>,
        "notes": "<הנחות/הבהרות>"
      }
    }
  ],
  "calculation": { "totalKg": <או null>, "bagsRounded": <או null>, "reserveAdded": <true|false> },
  "tips": ["<טיפ זהב אחד לפחות>"],
  "disclaimer": "אומדן מקצועי; בפועל תלוי בתנאי עבודה.",
  "cta": "להוסיף <X> שקי <שם מוצר> לעגלת המשלוח?"
}
2) אחריו: טקסט קצר ויפה ללקוח (2–5 שורות) בעברית.
`.trim();

    for (const modelId of modelsToTry) {
      try {
        const { text } = await generateText({
          model: googleAI(modelId),
          system: SYSTEM_PROMPT,
          messages,
          // NEW: כוונון רך—ללא שינוי מודל/מבנה, רק פרמטרים נתמכים של ה‑AI SDK
          maxTokens: 800,       // להשאיר מרווח ל‑JSON + ניסוח
          temperature: 0.4,     // יציב, לא "פרוע" (AI SDK תומך בפרמטרים הללו) [1](https://www.visily.ai/ui-mockup-tool/)
        });
        finalResponseText = text?.trim() || "";
        activeModelName = modelId;
        if (finalResponseText) break;
      } catch {
        console.warn(`Model ${modelId} failed, moving to next.`);
        continue;
      }
    }

    // 6) תשובת ברירת מחדל אם אין טקסט (לא שיניתי את המבנה; רק הגנה)
    if (!finalResponseText) {
      finalResponseText = "קיבלתי. רוצה לציין שטח במ״ר וגודל אריח? אשמח לחשב עבורך כמות שקי דבק ולהוסיף לעגלת המשלוח.";
    }

    return Response.json({
      text: finalResponseText,
      products,
      activeModel: activeModelName
    });

  } catch (error: any) {
    console.error("CRITICAL ERROR:", error?.message);
    return Response.json({
      text: "ראמי אחי, קרתה שגיאה בתקשורת עם המודלים החדשים. וודא שהמפתח ב‑Vercel מעודכן.",
      debug: error?.message
    });
  }
}
