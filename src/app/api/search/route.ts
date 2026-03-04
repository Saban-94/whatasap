import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .or(`product_name.ilike.%${q}%,sku.ilike.%${q}%`)
    .limit(8);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
