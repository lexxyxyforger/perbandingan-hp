import { NextRequest, NextResponse } from "next/server"
import axios from "axios"
import * as cheerio from "cheerio"

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
}

export type SearchResult = {
  name: string
  url: string
  image: string
  type: "Mobile" | "PC"
  slug: string
}

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    const { data } = await axios.get(
      `https://www.gsmarena.com/search.php3?sQuickSearch=yes&fDisplayX=1&sOQuickSearch=${encodeURIComponent(q)}`,
      { headers: HEADERS, timeout: 10000 }
    )

    const $ = cheerio.load(data)
    const results: SearchResult[] = []

    $("div.makers ul li, .search-results li").each((_, el) => {
      if (results.length >= 12) return false

      const a = $(el).find("a").first()
      const href = a.attr("href") || ""
      const name = a.find("strong span").last().text().trim() ||
                   a.attr("title")?.trim() || ""
      const img = a.find("img").attr("src") ||
                  a.find("img").attr("data-src") || ""

      if (!name || !href) return

      const slug = href.replace(".php", "").replace(/\//g, "")

      results.push({
        name,
        url: `https://www.gsmarena.com/${href}`,
        image: img,
        type: "Mobile",
        slug,
      })
    })

    return NextResponse.json(results)
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 502 })
  }
}