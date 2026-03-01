import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.trim();

    // Init Supabase & Google CSE
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);
    const googleAI = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! });

    // 1. Search DB
    const { data: products } = await supabase
      .from("inventory")
      .select("*")
      .or(`product_name.ilike.%${lastMsg}%,sku.ilike.%${lastMsg}%`)
      .limit(2);

    // 2. Add Images from Google if product found
    if (products?.[0]) {
      const imgRes = await fetch(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_CSE_API_KEY}&cx=${process.env.GOOGLE_CSE_CX_ID}&q=${encodeURIComponent(products[0].product_name)}&searchType=image&num=1`);
      const imgData = await imgRes.json();
      products[0].image_url = imgData.items?.[0]?.link;
    }

    // 3. Model Fallback Logic
    const models = ["gemini-3.1-flash-image-preview", "gemini-3-flash-preview", "gemini-1.5-flash-latest"];
    let finalRes = { text: "", model: "" };

    for (const m of models) {
      try {
        const { text } = await generateText({
          model: googleAI(m),
          system: `אתה יועץ המכירות של ח. סבן חומרי בניין. ענה בעברית. מלאי: ${JSON.stringify(products || [])}`,
          messages
        });
        finalRes = { text, model: m };
        break;
      } catch (e) { continue; }
    }

    return Response.json({ text: finalRes.text, products, activeModel: finalRes.model });
  } catch (error) {
    return Response.json({ text: "תקלה בסנכרון.", products: [] });
  }
}
