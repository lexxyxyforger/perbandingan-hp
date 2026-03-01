import { MobileDevice, PCDevice } from "@/types/device"

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value))
}

function normalize(value: number, max: number): number {
  return clamp(Math.round((value / max) * 100))
}

export function scoreMobile(d: MobileDevice): Record<string, number> & { total: number } {
  const cpu = clamp(d.cpuScore)
  const ram = normalize(d.ram, 16)
  const battery = normalize(d.battery, 6000)
  const display = normalize(d.displayHz, 165)
  const camera = normalize(d.camera, 200)
  const storage = normalize(d.storage, 512)

  const total = Math.round(
    cpu * 0.30 +
    ram * 0.15 +
    battery * 0.20 +
    display * 0.15 +
    camera * 0.12 +
    storage * 0.08
  )

  return { cpu, ram, battery, display, camera, storage, total: clamp(total) }
}

export function scorePC(d: PCDevice): Record<string, number> & { total: number } {
  const cpu = clamp(d.cpuScore)
  const gpu = clamp(d.gpuScore)
  const ram = normalize(d.ram, 128)
  const storage = normalize(d.storage, 4000)
  const efficiency = clamp(100 - normalize(d.tdp, 300))

  const total = Math.round(
    cpu * 0.30 +
    gpu * 0.38 +
    ram * 0.17 +
    storage * 0.08 +
    efficiency * 0.07
  )

  return { cpu, gpu, ram, storage, efficiency, total: clamp(total) }
}