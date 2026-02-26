// src/lib/customerMemory.ts
import { supabase } from './supabase';
import { CustomerBrainProfile } from './types';

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

    if (error || !data) return "לקוח חדש במערכת. יש לבנות פרופיל העדפות.";

    const profile = data as CustomerBrainProfile;
    return `
      מידע מזיכרון ה-CRM על ${profile.name}:
      - ידע מצטבר: ${profile.accumulated_knowledge}
      - פרויקטים: ${profile.projects?.map(p => `${p.name} (${p.location})`).join(', ') || 'אין פרויקטים רשומים'}
      - העדפות אספקה: ${profile.preferences?.delivery_method || 'לא צוין'}
    `;
  } catch (err) {
    return "שגיאה בגישה למסד הנתונים.";
  }
}

/**
 * עדכון וחיזוק המוח של הלקוח
 */
export async function strengthenBrain(clientId: string, newInsight: string) {
  const { data: existing } = await supabase
    .from('customer_memory')
    .select('accumulated_knowledge')
    .eq('clientId', clientId)
    .single();

  const updatedKnowledge = existing 
    ? `${existing.accumulated_knowledge}\n- ${newInsight}` 
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
