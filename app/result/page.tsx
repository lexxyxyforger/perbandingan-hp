"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import type { CompareResult } from "@/types/device"
import DeviceCard from "@/components/DeviceCard"
import ScoreCard from "@/components/ScoreCard"

function Skeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="h-10 w-64 bg-slate-100 rounded-xl" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-80 bg-slate-100 rounded-2xl" />
        <div className="h-80 bg-slate-100 rounded-2xl" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-100 rounded-2xl" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  )
}

export default function ResultPage() {
  const params = useSearchParams()
  const url1 = params.get("url1")
  const url2 = params.get("url2")

  const [data, setData] = useState<CompareResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!url1 || !url2) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/compare?url1=${encodeURIComponent(url1)}&url2=${encodeURIComponent(url2)}`
        )
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || `HTTP ${res.status}`)
        }
        const json = (await res.json()) as CompareResult
        setData(json)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load result")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [url1, url2])

  if (!url1 || !url2) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-slate-500 mb-4">Missing device URLs.</p>
        <Link href="/compare" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
          ← Go back to Compare
        </Link>
      </div>
    )
  }

  if (loading) return <Skeleton />

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center flex flex-col gap-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-500" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="font-semibold text-slate-800">Comparison Failed</p>
        <p className="text-sm text-slate-500">{error}</p>
        <Link href="/compare" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
          ← Try again
        </Link>
      </div>
    )
  }

  if (!data) return null

  const w1 = data.winner === "device1"
  const w2 = data.winner === "device2"
  const tie = data.winner === "tie"

  return (
    <div className="flex flex-col gap-10 py-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-1">Result</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {tie
              ? "It's a Tie!"
              : `${w1 ? data.specs.device1.name || "Device 1" : data.specs.device2.name || "Device 2"} Wins`}
          </h1>
        </div>
        <Link
          href="/compare"
          className="self-start sm:self-auto text-sm font-semibold px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
        >
          ← New Comparison
        </Link>
      </div>

      {tie && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm font-medium text-amber-700">
          Both devices scored equally. Try comparing different specs for a clearer result.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <DeviceCard
          label="Device 1"
          score={data.scores.device1}
          winner={w1}
          device={data.specs.device1}
        />
        <DeviceCard
          label="Device 2"
          score={data.scores.device2}
          winner={w2}
          device={data.specs.device2}
        />
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Score Breakdown</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <ScoreCard
            title={data.specs.device1.name || "Device 1"}
            score={data.scores.device1}
            breakdown={data.breakdown?.device1}
            winner={w1}
          />
          <ScoreCard
            title={data.specs.device2.name || "Device 2"}
            score={data.scores.device2}
            breakdown={data.breakdown?.device2}
            winner={w2}
          />
        </div>
      </div>
    </div>
  )
}