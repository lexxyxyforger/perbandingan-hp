import { NextRequest, NextResponse } from "next/server"
import { scrapeMobile } from "@/lib/scrape/mobile"
import { scoreMobile } from "@/lib/scoring"

export async function GET(req: NextRequest) {
  const url = new URL(req.url).searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 })
  }

  try {
    const device = await scrapeMobile(url)
    const breakdown = scoreMobile(device)

    return NextResponse.json(
      { device, breakdown },
      { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } }
    )
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to scrape device"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}