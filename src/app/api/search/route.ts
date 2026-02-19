import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query, type } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEYS?.split(',')[0];
    const cx = process.env.GOOGLE_CX || "635bc3eeee0194b16";
    const isVideo = type === "video";

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query + (isVideo ? " tutorial" : ""))}${!isVideo ? "&searchType=image" : ""}&num=1`;
    
    const res = await fetch(url);
    const data = await res.json();
    const link = data.items?.[0]?.link;

    return NextResponse.json(isVideo ? { videoUrl: link } : { imageUrl: link });
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
