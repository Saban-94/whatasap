// שלב 3: שימוש ב-generateText לתמיכה ב-Tools + Structured Output
const { text, toolResults } = await generateText({
  model: google('gemini-1.5-pro-latest'), // מודל יציב שתומך ב-Tools
  system: `אתה המומחה של ח. סבן. עליך להחזיר תשובה בפורמט JSON בלבד התואם לסכימת UIBlueprint. 
           אם חסר מידע, השתמש בכלי ה-webSearch.
           סכימה נדרשת: { text, source, type, components: [{type, props}], media: {image, video} }`,
  prompt: query,
  tools: {
    webSearch: tool({
      description: 'חיפוש מפרטים, תמונות או סרטונים בגוגל',
      inputSchema: z.object({ q: z.string() }),
      execute: async ({ q }) => {
        const res = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_API_KEY}&cx=${process.env.GOOGLE_CSE_CX}&q=${encodeURIComponent(q)}`);
        return res.json();
      }
    })
  },
  maxSteps: 5, // מאפשר ל-AI לחפש ואז לענות
});

// המרה של הטקסט שחזר מהמודל לאובייקט JSON בטוח
let object;
try {
  object = JSON.parse(text);
} catch (e) {
  // Fallback במקרה שהמודל החזיר טקסט ולא JSON
  object = {
    text: text,
    source: 'Gemini AI',
    type: 'fallback',
    components: []
  };
}

// שמירה ב-Supabase Cache
await supabase.from('answers_cache').upsert({ key, payload: object });
return NextResponse.json(object);
