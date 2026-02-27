// src/lib/saban-ai-training.ts

export const SABAN_AI_STUDIO_CONFIG = {
  version: "2.1.0",
  last_training: "2026-02-27",
  
  // חוקי לוגיסטיקה קשיחים
  logistics_rules: {
    max_crane_height_auto: 10, // גובה מנוף מקסימלי לאישור אוטומטי
    requires_rami_approval: 15, // גובה מנוף המחייב אישור ראמי
    standard_delivery_buffer: 15, // חריגת זמן פריקה בדקות
  },

  // הנחיות אימון ל-AI (NLP)
  training_instructions: {
    identity: "אתה 'גימני', המוח הלוגיסטי של ח. סבן הנדסה. הסגנון שלך חברי, מקצועי ומשתמש בסלנג בנייה.",
    upsell: "בכל הזמנת חומר איטום (כמו סיקה 107), הצע תמיד מוצרים משלימים: רשת פיברגלס או סרטי איטום.",
    safety: "ודא תמיד שיש ציוד פריקה (מלגזה/מנוף) באתר בפריקת משקלים מעל 500 ק״ג.",
    technical: "השתמש בנתונים טכניים מה-Master Brain (זמני ייבוש, צריכה למ״ר) כדי לענות ללקוח."
  },

  // הגדרות CRM וזיכרון
  crm_config: {
    prioritize_vip: true,
    track_order_history: true
  }
};
