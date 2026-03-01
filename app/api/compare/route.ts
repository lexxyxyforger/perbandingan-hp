import { NextRequest, NextResponse } from "next/server"
import { scrapeMobile } from "../../../lib/scrape/mobile"
import { scrapePC } from "../../../lib/scrape/pc"
import { scoreMobile, scorePC } from "@/lib/scoring"
import { Device, CompareResult } from "@/types/device"

function detectType(url: string): "mobile" | "pc" {
  if (url.includes("gsmarena.com")) return "mobile"
  if (url.includes("rtings.com/phones") || url.includes("kimovil.com")) return "mobile"
  return "pc"
}

async function scrapeDevice(url: string): Promise<Device> {
  const type = detectType(url)
  return type === "mobile" ? await scrapeMobile(url) : await scrapePC(url)
}

function getScoreBreakdown(device: Device) {
  return device.type === "mobile"
    ? scoreMobile(device)
    : scorePC(device)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url1 = searchParams.get("url1")
  const url2 = searchParams.get("url2")

  if (!url1 || !url2) {
    return NextResponse.json({ error: "Missing url1 or url2 query params" }, { status: 400 })
  }

  try {
    const [device1, device2] = await Promise.all([
      scrapeDevice(url1),
      scrapeDevice(url2),
    ])

    const breakdown1 = getScoreBreakdown(device1)
    const breakdown2 = getScoreBreakdown(device2)

    const score1 = breakdown1.total
    const score2 = breakdown2.total

    const winner: CompareResult["winner"] =
      score1 > score2 ? "device1" : score2 > score1 ? "device2" : "tie"

    const result: CompareResult = {
      winner,
      scores: {
        device1: score1,
        device2: score2,
      },
      breakdown: {
        device1: breakdown1,
        device2: breakdown2,
      },
      specs: {
        device1,
        device2,
      },
    }

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scraping failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}