export const dynamic = 'force-dynamic';

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  let activeModelName = "None";
  try {
    // 1. קבלת גוף ההודעה עם הגנה מלאה
    const body = await req.json().catch(() => ({}));
    const messages = body.messages || [];

    if (messages.length === 0) {
      return Response.json({ text: "שלום ראמי, סבן AI מוכן לעבודה. איך אוכל לעזור?" });
    }

    // 2. חילוץ טקסט חסין - מונע את שגיאת ה-trim()
    const lastMsgObj = messages[messages.length - 1];
    // בודק את כל השדות האפשריים (content, text) ומבטיח מחרוזת
    const rawText = lastMsgObj.content || lastMsgObj.text || "";
    const lastMsg = rawText.toString().trim();

    // 3. מפתחות סביבה
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

    // 4. שליפת נתונים מ-Supabase (מבודד)
    let products = [];
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

    // 5. לופ מודלים מעודכן לפי התיעוד מ-26 בפברואר
    const modelsToTry = [
      "gemini-3.1-flash-image-preview", // המודל החדש (Nano Banana 2)
      "gemini-3-flash-preview",         // יציב ומהיר
      "gemini-1.5-flash-latest"         // גיבוי אחרון
    ];

    if (!geminiKey) throw new Error("Missing Gemini API Key");
    const googleAI = createGoogleGenerativeAI({ apiKey: geminiKey });

    let finalResponseText = "";
    
    for (const modelId of modelsToTry) {
      try {
        const { text } = await generateText({
          model: googleAI(modelId),
          system: `אתה יועץ המכירות והמומחה הטכני הבכיר של "ח. סבן חומרי בניין". 
תפקידך לספק ייעוץ מקצועי, מדויק ומכירתי על בסיס נתוני המלאי: ${JSON.stringify(products)}.

חוקי ברזל למענה:
1. חישוב כמויות אוטומטי (חשוב!): אם הלקוח שואל על כמות או מציין שטח (מ"ר), בצע חישוב לפי הנוסחה: 
   (שטח במ"ר × צריכה לקמ"ר) / משקל השק. 
   לדוגמה עבור סיקה 255: שטח × 4 ק"ג / 25 ק"ג שק. תמיד עגל כלפי מעלה למספר השקים השלם הקרוב והוסף שק אחד לביטחון ("רזרבה").

2. נתונים טכניים: השתמש תמיד בנתונים מהטבלה (זמן ייבוש, כושר כיסוי, יישום). אם חסר נתון בטבלה, השתמש בידע המקצועי שלך כנציג סיקה/סבן (למשל: ייבוש ראשוני לסיקה 255 הוא 24 שעות).

3. סגנון דיבור: ענה בעברית רהוטה, מקצועית ואדיבה. פנה ללקוח כשותף לפרויקט. 

4. הנעה לפעולה: בסוף כל חישוב או ייעוץ, עודד את הלקוח להוסיף את הכמות המומלצת ל"סל המשלוח" כדי לקבל הצעת מחיר סופית בוואטסאפ.

5. טיפ זהב: לכל מוצר פרימיום, הוסף "טיפ זהב ליישום" (למשל: מריחה כפולה באריחים גדולים).`,
          messages
        });
        finalResponseText = text;
        activeModelName = modelId;
        break; 
      } catch (err) {
        console.warn(`Model ${modelId} failed, moving to next.`);
        continue;
      }
    }

    return Response.json({ 
      text: finalResponseText, 
      products, 
      activeModel: activeModelName 
    });

  } catch (error: any) {
    console.error("CRITICAL ERROR:", error.message);
    return Response.json({ 
      text: "ראמי אחי, קרתה שגיאה בתקשורת עם המודלים החדשים. וודא שהמפתח ב-Vercel מעודכן.",
      debug: error.message
    });
  }
}
