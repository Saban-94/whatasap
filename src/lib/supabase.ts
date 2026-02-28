import { createClient } from '@supabase/supabase-js';

// משיכת המפתחות עם תמיכה רחבה ב-Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// בדיקת תקינות שתמנע מה-Build לקרוס אם המפתחות חסרים זמנית
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'production') {
    console.error("❌ SabanOS Missing Keys: Check Vercel Environment Variables!");
  }
}

// יצירת ה-Client עם ערכי ברירת מחדל ריקים כדי למנוע שגיאת "Required" ב-Build
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
