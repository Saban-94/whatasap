import { GoogleGenerativeAI } from "@google/generative-ai";
// ... שאר ה-Imports הקיימים

const SEARCH_ENGINE_ID = "1340c66f5e73a4076"; // המזהה שסיפקת

async function fetchGoogleDetails(query: string) {
  try {
    // קריאה למנוע החיפוש המותאם לקבלת מדיה ומפרטים
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY; 
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`;
    
    const searchRes = await fetch(url);
    const searchData = await searchRes.json();
    
    // חילוץ תמונה ראשונה וסרטון ראשון (אם קיימים)
    const firstImage = searchData.items?.find((i: any) => i.pagemap?.cse_image)?.[0]?.link;
    const youtubeLink = searchData.items?.find((i: any) => i.link.includes('youtube.com'))?.link;

    return {
      snippet: searchData.items?.[0]?.snippet || "לא נמצא מפרט נוסף.",
      image: firstImage,
      video: youtubeLink,
      link: searchData.items?.[0]?.link
    };
  } catch (e) {
    return null;
  }
}

// בתוך פונקציית fetchExtendedDetails הקיימת, נשלב את זה:
async function fetchExtendedDetails(query: string) {
  const searchResults = await fetchGoogleDetails(query);
  
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });
  const prompt = `נתח את המידע הבא מגוגל: ${searchResults?.snippet}. 
                  ספק למשתמש של ח. סבן מפרט טכני והסבר על המוצר: ${query}. 
                  אם יש קישור לסרטון הדרכה, ציין אותו במפורש. ענה בעברית.`;
                  
  const result = await model.generateContent(prompt);
  
  return {
    text: result.response.text(),
    orderList: [],
    media: {
      image: searchResults?.image,
      video: searchResults?.video
    },
    source: 'Google Custom Search + Gemini 3.1',
    type: 'extended'
  };
}
