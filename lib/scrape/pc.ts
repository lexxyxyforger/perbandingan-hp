import axios from "axios"
import * as cheerio from "cheerio"
import { PCDevice } from "@/types/device"

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
    const cell = $(`td:contains('${label}'), th:contains('${label}'), .spec-name:contains('${label}')`)
      .filter((_, el) => $(el).text().trim().toLowerCase() === label.toLowerCase())
      .first()
    if (cell.length) return cell.next().text().trim()

    const row = $(`tr`).filter((_, el) => {
      return $(el).find("td, th").first().text().trim().toLowerCase() === label.toLowerCase()
    }).first()
    if (row.length) return row.find("td").last().text().trim()
  }
  return ""
}

function extractCpuScore(cpuName: string): number {
  const c = cpuName.toLowerCase()
  if (c.includes("i9-14") || c.includes("ryzen 9 7950")) return 99
  if (c.includes("i9-13") || c.includes("ryzen 9 7900")) return 96
  if (c.includes("i9-12") || c.includes("ryzen 9 5950")) return 93
  if (c.includes("i7-14") || c.includes("ryzen 9 7900x") || c.includes("ryzen 9 5900")) return 91
  if (c.includes("i7-13") || c.includes("ryzen 7 7800") || c.includes("ryzen 9 5900x")) return 88
  if (c.includes("i7-12") || c.includes("ryzen 7 7700")) return 84
  if (c.includes("i5-14") || c.includes("ryzen 7 5800") || c.includes("ryzen 7 5700")) return 80
  if (c.includes("i5-13") || c.includes("ryzen 5 7600")) return 76
  if (c.includes("i5-12") || c.includes("ryzen 5 5600")) return 72
  if (c.includes("i5-11") || c.includes("ryzen 5 5500")) return 67
  if (c.includes("i3") || c.includes("ryzen 3")) return 58
  if (c.includes("celeron") || c.includes("pentium")) return 40
  return 70
}

function extractGpuScore(gpuName: string): number {
  const g = gpuName.toLowerCase()
  if (g.includes("rtx 4090")) return 100
  if (g.includes("rtx 4080")) return 94
  if (g.includes("rtx 4070 ti") || g.includes("rx 7900 xtx")) return 88
  if (g.includes("rtx 4070") || g.includes("rx 7900 xt")) return 83
  if (g.includes("rtx 3090") || g.includes("rx 7900")) return 80
  if (g.includes("rtx 4060 ti") || g.includes("rx 7800")) return 76
  if (g.includes("rtx 3080") || g.includes("rx 6900")) return 74
  if (g.includes("rtx 4060") || g.includes("rx 7700")) return 70
  if (g.includes("rtx 3070") || g.includes("rx 6800")) return 68
  if (g.includes("rtx 3060") || g.includes("rx 6700")) return 63
  if (g.includes("rtx 3050") || g.includes("rx 6600")) return 55
  if (g.includes("gtx 1660") || g.includes("rx 5700")) return 50
  if (g.includes("gtx 1650") || g.includes("rx 5500")) return 43
  if (g.includes("gtx 1050") || g.includes("rx 570")) return 35
  if (g.includes("intel arc") || g.includes("iris xe")) return 30
  if (g.includes("integrated") || g.includes("uhd")) return 15
  return 60
}

function extractStorage(raw: string): number {
  const tbMatch = raw.match(/(\d+)\s*TB/i)
  if (tbMatch) return Number(tbMatch[1]) * 1000
  const gbMatch = raw.match(/(\d+)\s*GB/i)
  return gbMatch ? Number(gbMatch[1]) : 512
}

function extractTdp(raw: string): number {
  const match = raw.match(/(\d+)\s*W/i)
  return match ? Number(match[1]) : 65
}

function extractName($: cheerio.CheerioAPI): string {
  return $("h1").first().text().trim() ||
    $("title").text().split("|")[0].trim() ||
    "Unknown PC"
}

export async function scrapePC(url: string): Promise<PCDevice> {
  const { data } = await axios.get(url, { headers: HEADERS, timeout: 12000 })
  const $ = cheerio.load(data)

  const cpuName = getSpec($, "Processor", "CPU", "Processor Model")
  const gpuName = getSpec($, "Graphics", "GPU", "Graphics Card", "Video Card")
  const ramRaw = getSpec($, "RAM", "Memory", "System Memory")
  const storageRaw = getSpec($, "Storage", "HDD", "SSD", "Hard Drive")
  const tdpRaw = getSpec($, "TDP", "Power Consumption", "Max TDP", "Wattage")

  return {
    type: "pc",
    name: extractName($),
    cpuName,
    gpuName,
    ram: extractNumber(ramRaw, 16),
    cpuScore: extractCpuScore(cpuName),
    gpuScore: extractGpuScore(gpuName),
    storage: extractStorage(storageRaw),
    tdp: extractTdp(tdpRaw),
  }
}