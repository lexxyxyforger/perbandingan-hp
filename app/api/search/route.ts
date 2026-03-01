// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server"
import Fuse from "fuse.js"
import devices from "@/public/devices.json"

type DeviceEntry = { name: string; slug: string }

const fuse = new Fuse(devices as DeviceEntry[], {
  keys: ["name"],
  threshold: 0.4,
  includeScore: true,
})

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const hits = fuse.search(q, { limit: 6 })

  const results = hits.map(({ item }) => ({
    name: item.name,
    url: `https://www.gsmarena.com/${item.slug}.php`,
    slug: item.slug,
    image: "",
    type: "Mobile",
  }))

  return NextResponse.json({ results })
}