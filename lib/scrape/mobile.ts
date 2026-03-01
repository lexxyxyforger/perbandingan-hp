import axios from "axios"
import * as cheerio from "cheerio"
import { MobileDevice } from "@/types/device"

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
}

function extractNumber(text: string, fallback: number): number {
  const match = text.replace(/,/g, "").match(/\d+/)
  return match ? Number(match[0]) : fallback
}

function getSpec($: cheerio.CheerioAPI, ...labels: string[]): string {
  for (const label of labels) {
    // GSMArena uses <td class="ttl"> for labels and <td class="nfo"> for values
    const cell = $("td.ttl").filter((_, el) => {
      return $(el).text().trim().toLowerCase() === label.toLowerCase()
    }).first()
    if (cell.length) return cell.next("td.nfo").text().trim()
  }
  return ""
}

function extractCpuScore(chipset: string): number {
  const c = chipset.toLowerCase()
  if (c.includes("a18") || c.includes("snapdragon 8 elite")) return 99
  if (c.includes("a17") || c.includes("snapdragon 8 gen 3")) return 98
  if (c.includes("a16") || c.includes("snapdragon 8 gen 2") || c.includes("dimensity 9300")) return 94
  if (c.includes("a15") || c.includes("snapdragon 8 gen 1") || c.includes("dimensity 9200")) return 90
  if (c.includes("a14") || c.includes("dimensity 9000") || c.includes("snapdragon 888")) return 86
  if (c.includes("a13") || c.includes("snapdragon 870") || c.includes("dimensity 8300")) return 82
  if (c.includes("snapdragon 7s gen 3") || c.includes("dimensity 8200")) return 78
  if (c.includes("snapdragon 7 gen") || c.includes("dimensity 7200")) return 74
  if (c.includes("snapdragon 695") || c.includes("snapdragon 6 gen") || c.includes("dimensity 6020")) return 66
  if (c.includes("snapdragon 4 gen") || c.includes("helio g99")) return 58
  if (c.includes("helio g") || c.includes("unisoc t")) return 50
  if (c.includes("helio p") || c.includes("unisoc sc")) return 42
  return 60
}

function extractStorage(raw: string): number {
  // GSMArena internal storage format: "128GB 8GB RAM" or "64GB/128GB"
  const match = raw.match(/(\d+)\s*GB/i)
  return match ? Number(match[1]) : 128
}

function extractCamera(raw: string): number {
  const matches = [...raw.matchAll(/(\d+)\s*MP/gi)]
  if (!matches.length) return 12
  return Math.max(...matches.map((m) => Number(m[1])))
}

function extractWeight(raw: string): number {
  const match = raw.match(/(\d+(?:\.\d+)?)\s*g\b/i)
  return match ? Number(match[1]) : 185
}

function extractOs(raw: string): string {
  const match = raw.match(/Android\s*[\d.]+|iOS\s*[\d.]+/i)
  return match ? match[0] : raw.split(",")[0].trim() || "Unknown"
}

function extractName($: cheerio.CheerioAPI): string {
  return (
    $("h1.specs-phone-name-title").text().trim() ||
    $("h1").first().text().trim() ||
    "Unknown Device"
  )
}

function extractDisplayHz($: cheerio.CheerioAPI): number {
  // GSMArena puts refresh rate in the display type field, e.g. "IPS LCD, 120Hz"
  const displayType = getSpec($, "Type")
  const hzMatch = displayType.match(/(\d+)\s*Hz/i)
  if (hzMatch) return Number(hzMatch[1])

  // Fallback: search all nfo cells for Hz mention under display section
  let found = 60
  $("td.nfo").each((_, el) => {
    const text = $(el).text()
    const match = text.match(/(\d+)\s*Hz/i)
    if (match) {
      found = Number(match[1])
      return false // break
    }
  })
  return found
}

function extractRam($: cheerio.CheerioAPI): number {
  // GSMArena RAM is inside the "Internal" field: "128GB 8GB RAM"
  const internal = getSpec($, "Internal")
  const ramMatch = internal.match(/(\d+)\s*GB\s*RAM/i)
  if (ramMatch) return Number(ramMatch[1])

  // Fallback to dedicated RAM field
  const ramRaw = getSpec($, "RAM")
  return extractNumber(ramRaw, 8)
}

export async function scrapeMobile(url: string): Promise<MobileDevice> {
  const { data } = await axios.get(url, { headers: HEADERS, timeout: 12000 })
  const $ = cheerio.load(data)

  const chipset = getSpec($, "Chipset")
  const batteryRaw = getSpec($, "Type") // battery section "Type" — need section-aware lookup
  const storageRaw = getSpec($, "Internal")
  const cameraRaw = getSpec($, "Main Camera", "Triple", "Quad", "Dual", "Single")
  const weightRaw = getSpec($, "Weight")
  const osRaw = getSpec($, "OS")

  // GSMArena battery capacity is in its own row
  const batteryCapacity = (() => {
    let cap = 0
    $("td.nfo").each((_, el) => {
      const text = $(el).text()
      const match = text.match(/(\d{3,5})\s*mAh/i)
      if (match) { cap = Number(match[1]); return false }
    })
    return cap || 4000
  })()

  return {
    type: "mobile",
    name: extractName($),
    chipset,
    ram: extractRam($),
    battery: batteryCapacity,
    displayHz: extractDisplayHz($),
    cpuScore: extractCpuScore(chipset),
    storage: extractStorage(storageRaw),
    camera: extractCamera(cameraRaw),
    weight: extractWeight(weightRaw),
    os: extractOs(osRaw),
  }
}