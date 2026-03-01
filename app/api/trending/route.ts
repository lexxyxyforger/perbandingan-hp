import { NextResponse } from "next/server"
import axios from "axios"
import * as cheerio from "cheerio"
import { TrendingItem } from "@/types/device"

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
}

const FALLBACK: TrendingItem[] = [
  {
    name: "Samsung Galaxy S25 Ultra",
    type: "Mobile",
    url: "https://www.gsmarena.com/samsung_galaxy_s25_ultra-12870.php",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra.jpg",
    slug: "samsung_galaxy_s25_ultra-12870",
    score: 0,
  },
  {
    name: "Apple iPhone 16 Pro Max",
    type: "Mobile",
    url: "https://www.gsmarena.com/apple_iphone_16_pro_max-12635.php",
    image: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg",
    slug: "apple_iphone_16_pro_max-12635",
    score: 0,
  },
  {
    name: "Google Pixel 9 Pro",
    type: "Mobile",
    // Fix: was using iPhone's ID (12635) for both URL and wrong slug (12525)
    url: "https://www.gsmarena.com/google_pixel_9_pro-12384.php",
    image: "https://fdn2.gsmarena.com/vv/bigpic/google-pixel-9-pro.jpg",
    slug: "google_pixel_9_pro-12384",
    score: 0,
  },
  {
    name: "OnePlus 13",
    type: "Mobile",
    url: "https://www.gsmarena.com/oneplus_13-12502.php",
    image: "https://fdn2.gsmarena.com/vv/bigpic/oneplus-13.jpg",
    slug: "oneplus_13-12502",
    score: 0,
  },
  {
    name: "Xiaomi 15 Pro",
    type: "Mobile",
    url: "https://www.gsmarena.com/xiaomi_15_pro-12900.php",
    image: "https://fdn2.gsmarena.com/vv/bigpic/xiaomi-15-pro.jpg",
    slug: "xiaomi_15_pro-12900",
    score: 0,
  },
  {
    name: "Samsung Galaxy Z Fold 6",
    type: "Mobile",
    url: "https://www.gsmarena.com/samsung_galaxy_z_fold6-12500.php",
    image: "https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg",
    slug: "samsung_galaxy_z_fold6-12500",
    score: 0,
  },
  {
    name: "Sony Xperia 1 VI",
    type: "Mobile",
    url: "https://www.gsmarena.com/sony_xperia_1_vi-12311.php",
    image: "https://fdn2.gsmarena.com/vv/bigpic/sony-xperia-1-vi.jpg",
    slug: "sony_xperia_1_vi-12311",
    score: 0,
  },
  {
    name: "OPPO Find X8 Pro",
    type: "Mobile",
    url: "https://www.gsmarena.com/oppo_find_x8_pro-12753.php",
    image: "https://fdn2.gsmarena.com/vv/bigpic/oppo-find-x8-pro.jpg",
    slug: "oppo_find_x8_pro-12753",
    score: 0,
  },
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, count)
}

function parseSlug(href: string): string {
  return href.replace(/^\//, "").replace(".php", "")
}

function toFullImage(src: string): string {
  // GSMArena search results return small thumbs — rewrite to bigpic CDN
  return src
    .replace(/\/\/cdn\d?\.gsmarena\.com\/vv\/assets\/media\/phones\/small\//, "//fdn2.gsmarena.com/vv/bigpic/")
    .replace(/^\/\//, "https://")
}

async function fetchGSMArena(): Promise<TrendingItem[]> {
  const { data } = await axios.get(
    "https://www.gsmarena.com/search.php3?chk_popular=selected",
    { headers: HEADERS, timeout: 8000 }
  )

  const $ = cheerio.load(data)
  const items: TrendingItem[] = []
  const seen = new Set<string>()

  // Try multiple selectors — GSMArena restructures their HTML occasionally
  const candidates = $("div.makers ul li, div.section-body ul li, ul.phones-list li")

  candidates.each((_, el) => {
    if (items.length >= 12) return false
    const a = $(el).find("a")
    const href = a.attr("href") || ""
    if (!href || !href.includes(".php")) return

    const name =
      a.find("strong span").last().text().trim() ||
      a.find("span").last().text().trim() ||
      a.attr("title")?.trim() ||
      ""
    const rawImg =
      a.find("img").attr("src") ||
      a.find("img").attr("data-src") ||
      ""

    if (!name || !href) return

    const slug = parseSlug(href)
    if (seen.has(slug)) return // deduplicate
    seen.add(slug)

    items.push({
      name,
      type: "Mobile",
      url: `https://www.gsmarena.com/${href.replace(/^\//, "")}`,
      image: toFullImage(rawImg),
      slug,
      score: 0,
    })
  })

  return items
}

export async function GET() {
  const cacheHeaders = {
    // Short cache so random feels fresh each visit
    "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
  }

  try {
    const scraped = await fetchGSMArena()

    // Merge scraped + fallback pool, deduplicate by slug, then pick 4 random
    const pool = [...scraped]
    const scrapedSlugs = new Set(scraped.map((i) => i.slug))
    for (const f of FALLBACK) {
      if (!scrapedSlugs.has(f.slug)) pool.push(f)
    }

    const result = pickRandom(pool, 4)
    return NextResponse.json(result, { headers: cacheHeaders })
  } catch {
    // Fallback: pick 4 random from the static list
    return NextResponse.json(pickRandom(FALLBACK, 4), { headers: cacheHeaders })
  }
}