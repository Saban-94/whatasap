// src/lib/customerMemory.ts
import { supabase } from './supabase';

export interface CustomerBrainProfile {
  clientId: string;
  name: string;
  accumulated_knowledge: string;
  projects?: any[];
  preferences?: {
    delivery_method: string;
    preferred_hours: string;
  };
}

/**
 * שליפת הזיכרון עבור גימיני לפני תחילת השיחה
 */
export async function fetchCustomerBrain(clientId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('customer_memory')
      .select('*')
      .eq('clientId', clientId)
      .single();

    if (error || !data) {
      return "לקוח חדש. נהל שיחה ראשונית כדי להכיר את צרכיו המקצועיים.";
    }

    const profile = data as CustomerBrainProfile;
    return `
      זהו מידע מהזיכרון המצטבר שלך על ${profile.name}:
      - ידע מצטבר: ${profile.accumulated_knowledge}
      - העדפות אספקה: ${profile.preferences?.delivery_method || 'לא הוגדר'}
      - שעות מועדפות: ${profile.preferences?.preferred_hours || 'לא הוגדר'}
    `;
  } catch (err) {
    return "מידע הזיכרון אינו זמין כרגע.";
  }
}

/**
 * חיזוק המוח - הוספת תובנה חדשה לזיכרון הקיים
 */
export async function strengthenBrain(clientId: string, newInsight: string) {
  // קודם נשלוף את הידע הקיים כדי להוסיף עליו (Append) ולא לדרוס
  const { data } = await supabase
    .from('customer_memory')
    .select('accumulated_knowledge')
    .eq('clientId', clientId)
    .single();

  const updatedKnowledge = data 
    ? `${data.accumulated_knowledge} | ${newInsight}` 
    : newInsight;

  const { error } = await supabase
    .from('customer_memory')
    .upsert({ 
      clientId, 
      accumulated_knowledge: updatedKnowledge,
      last_update: new Date().toISOString()
    }, { onConflict: 'clientId' });

  if (error) throw error;
}
