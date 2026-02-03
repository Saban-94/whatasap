import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ 
      status: "שגיאה", 
      message: "מפתח API חסר! וודא שהגדרת GEMINI_API_KEY ב-Vercel" 
    }, { status: 500 });
  }

  try {
    // 1. בדיקה אם המפתח חי בכלל
    const testRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await testRes.json();

    if (data.error) {
      return NextResponse.json({ 
        status: "המפתח לא תקין או חסום", 
        google_error: data.error 
      }, { status: 403 });
    }

    // 2. שליפת רשימת המודלים שזמינים למפתח שלך
    const availableModels = data.models.map((m: any) => ({
      name: m.name.replace('models/', ''),
      displayName: m.displayName,
      description: m.description
    }));

    // 3. סינון המודלים המומלצים עבור ח. סבן (Flash נחשב להכי מהיר וחינמי)
    const recommended = availableModels.find((m: any) => m.name.includes('flash-latest'))?.name || availableModels[0].name;

    return NextResponse.json({
      status: "המפתח עובד פיקס! ✅",
      recommended_model_name: recommended,
      all_available_models: availableModels
    });

  } catch (error: any) {
    return NextResponse.json({ 
      status: "שגיאת חיבור", 
      error: error.message 
    }, { status: 500 });
  }
}
