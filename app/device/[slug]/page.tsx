"use client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useParams } from "next/navigation"
import Link from "next/link"
import DeviceImage from "@/components/DeviceImage"
import type { MobileDevice } from "@/types/device"

type ScoreBreakdown = Record<string, number> & { total: number }

function StatBadge({
  label,
  value,
  unit = "",
}: {
  label: string
  value: string | number
  unit?: string
}) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-1 border border-slate-100">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span className="text-xl font-bold text-slate-900">
        {value}
        <span className="text-sm font-medium text-slate-400 ml-1">{unit}</span>
      </span>
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
      <svg
        className="absolute inset-0 -rotate-90"
        width="144"
        height="144"
        viewBox="0 0 144 144"
      >
        <circle cx="72" cy="72" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="72"
          cy="72"
          r={r}
          fill="none"
          stroke="url(#sg)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <defs>
          <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="text-3xl font-bold text-slate-900">{score}</span>
        <span className="text-xs font-medium text-slate-400">/ 100</span>
      </div>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-10 py-6 animate-pulse">
      <div className="h-5 w-32 bg-slate-100 rounded-lg" />
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row gap-8">
        <div className="w-full sm:w-44 h-52 sm:h-60 bg-slate-100 rounded-xl flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-4 pt-2">
          <div className="h-3 w-24 bg-slate-100 rounded-full" />
          <div className="h-8 w-3/4 bg-slate-100 rounded-xl" />
          <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
          <div className="mt-2 w-36 h-36 bg-slate-100 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-slate-100 rounded-full" />
              <div className="h-3 w-8 bg-slate-100 rounded-full" />
            </div>
            <div className="h-2 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="max-w-md mx-auto py-24 text-center flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
        <svg
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#ef4444"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="font-semibold text-slate-800">Failed to load device</p>
      <p className="text-sm text-slate-400">{message}</p>
      <Link
        href="/"
        className="mt-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
      >
        ← Back to Home
      </Link>
    </div>
  )
}

function DevicePageInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const deviceUrl = searchParams.get("url") ?? ""
  const slug = (params?.slug as string) ?? ""

  const [device, setDevice] = useState<MobileDevice | null>(null)
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!deviceUrl) return

    let cancelled = false

    fetch(`/api/device?url=${encodeURIComponent(deviceUrl)}`)
      .then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}))
          throw new Error((j as { error?: string }).error ?? `HTTP ${r.status}`)
        }
        return r.json() as Promise<{ device: MobileDevice; breakdown: ScoreBreakdown }>
      })
      .then(({ device: d, breakdown: b }) => {
        if (!cancelled) {
          setDevice(d)
          setBreakdown(b)
          setFetchError(null)
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setFetchError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [deviceUrl])

  const loading = device === null && fetchError === null

  if (!deviceUrl) return <ErrorView message="No device URL provided" />
  if (loading) return <PageSkeleton />
  if (fetchError || !device || !breakdown) {
    return <ErrorView message={fetchError ?? "Unknown error"} />
  }

  const { total, ...categories } = breakdown
  const imgSrc = `https://fdn2.gsmarena.com/vv/bigpic/${slug}.jpg`

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-10 py-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-sm text-slate-400">Back to Home</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row gap-8 items-start">
        <div className="w-full sm:w-44 h-52 sm:h-60 rounded-xl overflow-hidden flex-shrink-0">
          <DeviceImage
            src={imgSrc}
            alt={device.name}
            fallbackType="Mobile"
            size="lg"
            className="w-full h-full"
          />
        </div>
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Mobile Device
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {device.name}
            </h1>
            {device.chipset && (
              <p className="text-sm text-slate-500 mt-1.5">{device.chipset}</p>
            )}
          </div>
          <div className="flex items-center gap-6">
            <ScoreRing score={total} />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-slate-700">Overall Score</span>
              <span className="text-xs text-slate-400 leading-relaxed">
                Based on CPU, battery,
                <br />
                display, camera & more
              </span>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {/* Kirim url1 + name1 supaya CompareForm bisa prefill */}
            <Link
              href={`/compare?url1=${encodeURIComponent(deviceUrl)}&name1=${encodeURIComponent(device.name)}`}
              className="flex-1 min-w-[140px] text-center px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition"
            >
              Compare This Device
            </Link>
            <a
              href={deviceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
            >
              GSMArena ↗
            </a>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Specifications</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatBadge label="RAM" value={device.ram} unit="GB" />
          <StatBadge label="Storage" value={device.storage} unit="GB" />
          <StatBadge label="Battery" value={device.battery} unit="mAh" />
          <StatBadge label="Display" value={device.displayHz} unit="Hz" />
          <StatBadge label="Camera" value={device.camera} unit="MP" />
          <StatBadge label="Weight" value={device.weight} unit="g" />
        </div>
      </div>

      <div className="pb-10">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Score Breakdown</h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          {Object.entries(categories).map(([key, val]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600 capitalize">{key}</span>
                <span className="text-sm font-bold text-slate-800">{val}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DevicePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DevicePageInner />
    </Suspense>
  )
}