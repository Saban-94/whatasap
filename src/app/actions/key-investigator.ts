'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * המלשינון של ח. סבן - חוקר מפתחות API ומודלים
 */
export async function investigateApiKeys(keys: string[]) {
  const report: any[] = [];
  
  // המודלים המומלצים לפי עדכוני ינואר 2026
  const modelsToTest = [
    "gemini-3-pro-preview",   // החדש ביותר עם תמיכה ב-Computer Use
    "gemini-3-flash-preview", // המהיר ביותר מהדור החדש
    "gemini-1.5-flash"        // היציב לגיבוי
  ];

  console.log("--- 🕵️‍♂️ מלשינון: מתחיל חקירת מפתחות ---");

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const keyId = `Key_${i + 1}`;
    const keyStatus: any = { id: keyId, results: [] };

    if (!key || key.length < 10) {
      keyStatus.results.push({ model: "N/A", status: "❌ מפתח לא תקין או ריק" });
      report.push(keyStatus);
      continue;
    }

    const genAI = new GoogleGenerativeAI(key);

    for (const modelName of modelsToTest) {
      try {
        console.log(`🔎 בודק את ${keyId} מול מודל ${modelName}...`);
        
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // בדיקת תקשורת פשוטה
        const result = await model.generateContent("היי גימני, תגיד 'אוקיי' אם המפתח הזה עובד.");
        const response = await result.response;
        const text = response.text();

        if (text) {
          keyStatus.results.push({ 
            model: modelName, 
            status: "✅ תקין ופעיל",
            response: text.substring(0, 10) + "..."
          });
        }
      } catch (error: any) {
        let errorMsg = error.message || "תקלה לא ידועה";
        
        // חקירת סוג השגיאה
        if (errorMsg.includes("429")) errorMsg = "⚠️ עומס מכסות (Quota Exceeded)";
        if (errorMsg.includes("403")) errorMsg = "🚫 מפתח חסום או לא מורשה";
        if (errorMsg.includes("404")) errorMsg = "❓ מודל לא נמצא בגרסה זו";

        keyStatus.results.push({ 
          model: modelName, 
          status: `❌ נכשל: ${errorMsg}` 
        });
      }
    }
    report.push(keyStatus);
  }

  console.log("--- ✅ חקירה הסתיימה ---");
  return report;
}
