export type MobileDevice = {
  type: "mobile"
  name: string
  ram: number
  battery: number
  displayHz: number
  cpuScore: number
  storage: number
  camera: number
  weight: number
  os: string
  chipset: string
}

export type PCDevice = {
  type: "pc"
  name: string
  ram: number
  cpuScore: number
  gpuScore: number
  storage: number
  cpuName: string
  gpuName: string
  tdp: number
}

export type Device = MobileDevice | PCDevice

export type CompareResult = {
  winner: "device1" | "device2" | "tie"
  scores: {
    device1: number
    device2: number
  }
  breakdown: {
    device1: Record<string, number>
    device2: Record<string, number>
  }
  specs: {
    device1: Device
    device2: Device
  }
}

export type TrendingItem = {
  name: string
  type: "Mobile" | "PC"
  url: string
  score: number
  image: string
  slug: string
}