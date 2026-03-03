export async function POST(req: Request) {
  try {
    const { messages, selectedProduct } = await req.json();
    const pool = process.env.GOOGLE_AI_KEY_POOL || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
    const keys = pool.split(",").map(k => k.trim()).filter(Boolean);
    const apiKey = keys[Math.floor(Math.random() * keys.length)];

    let systemPrompt = `אתה "סבן AI", מומחה לחומרי בניין. ענה ב-HTML נקי (<b>, <ul>, <li>).`;
    
    if (selectedProduct) {
      systemPrompt += `\nהלקוח מתייעץ על: ${selectedProduct.product_name}. מק"ט: ${selectedProduct.sku}. מחיר: ${selectedProduct.price}₪. הסבר על תכונותיו ושאל מה השטח במ"ר לחישוב.`;
    }

    const payload = {
      systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
      contents: messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      })),
      generationConfig: { temperature: 0.4, maxOutputTokens: 1024 }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "שגיאה בעיבוד הנתונים.";
    return Response.json({ text });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
