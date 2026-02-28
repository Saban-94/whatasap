export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const checks = {
    gemini_key: {
      exists: !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY),
      nameUsed: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "GOOGLE_GENERATIVE_AI_API_KEY" : (process.env.GEMINI_API_KEY ? "GEMINI_API_KEY" : "NONE")
    },
    supabase_url: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      value: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Defined" : "MISSING"
    },
    supabase_service_role: {
      exists: !!process.env.SUPABASE_SERVICE_ROLE,
      status: process.env.SUPABASE_SERVICE_ROLE ? "Defined" : "MISSING (Check Vercel Secrets)"
    }
  };

  // בדיקת חיבור אקטיבית ל-Supabase
  let supabaseStatus = "Not Tested";
  if (checks.supabase_url.exists && checks.supabase_service_role.exists) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE!
      );
      const { data, error } = await supabase.from('inventory').select('count').limit(1);
      if (error) throw error;
      supabaseStatus = "✅ Connection Successful - Table 'inventory' found!";
    } catch (e: any) {
      supabaseStatus = `❌ Connection Failed: ${e.message}`;
    }
  }

  return NextResponse.json({
    message: "Saban OS Key Diagnostics",
    env_checks: checks,
    database_connection: supabaseStatus,
    timestamp: new Date().toISOString()
  });
}
