import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import crypto from "node:crypto";

type CacheValue = { imageUrl?: string; videoUrl?: string };
type CacheEntry = { value: CacheValue; etag: string; createdAt: number; revalidateAt: number; expiresAt: number; };

// הגדרות זמנים - הכל ב-ENV
const SWR_MS = Number(process.env.SEARCH_SWR_MINUTES ?? 60) * 60 * 1000;
const HARD_TTL_MS = Number(process.env.SEARCH_TTL_HOURS ?? 24) * 60 * 60 * 1000;

async function getRedis() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Redis } = await import("@upstash/redis");
    return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! });
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { query, type } = await req.json();
    const q = query?.trim().toLowerCase();
    const kind = type === "video" ? "video" : "image";
    const apiKey = (process.env.GOOGLE_API_KEYS || "").split(",")[0];
    const cx = process.env.GOOGLE_CX || "635bc3eeee0194b16";

    // לוגיקת חיפוש גוגל
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(q + (kind === "video" ? " tutorial" : ""))}&searchType=${kind === "image" ? "image" : ""}&num=1`;
    const res = await fetch(url);
    const data = await res.json();
    
    const result = kind === "image" 
      ? { imageUrl: data.items?.[0]?.link } 
      : { videoUrl: data.items?.[0]?.link };

    return NextResponse.json(result, { headers: { "x-cache": "MISS" } });
  } catch (err) {
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}
