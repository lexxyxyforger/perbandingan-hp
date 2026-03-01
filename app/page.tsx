"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import DeviceImage from "@/components/DeviceImage"

type TrendingItem = {
  name: string
  type: "Mobile" | "PC"
  url: string
  image: string
  slug: string
}

const CATEGORIES = [
  "Gaming PC",
  "Ultrabook",
  "Flagship Phone",
  "Midrange Phone",
  "Budget Build",
  "Workstation",
]

function TrendingCard({ item }: { item: TrendingItem }) {
  const href =
    item.type === "Mobile"
      ? `/device/${item.slug}?url=${encodeURIComponent(item.url)}`
      : `/compare?url1=${encodeURIComponent(item.url)}`

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5 transition-all duration-200"
    >
      <DeviceImage
        src={item.image}
        alt={item.name}
        fallbackType={item.type}
        size="md"
        className="w-full h-40 group-hover:scale-105 transition-transform duration-300"
      />

      <div className="px-4 pt-3 pb-4 flex flex-col gap-1">
        <span
          className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${
            item.type === "Mobile"
              ? "bg-blue-50 text-blue-600"
              : "bg-violet-50 text-violet-600"
          }`}
        >
          {item.type}
        </span>
        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors leading-snug line-clamp-2">
          {item.name}
        </h3>
        <span className="text-xs font-medium text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
          View details →
        </span>
      </div>
    </Link>
  )
}

function TrendingSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 overflow-hidden">
      <div className="h-40 w-full bg-slate-100 animate-pulse" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 w-3/4 bg-slate-100 rounded-lg animate-pulse" />
        <div className="h-3 w-1/2 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    </div>
  )
}

function RandomPickCard({ item }: { item: TrendingItem }) {
  const href =
    item.type === "Mobile"
      ? `/device/${item.slug}?url=${encodeURIComponent(item.url)}`
      : `/compare?url1=${encodeURIComponent(item.url)}`

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-200"
    >
      <DeviceImage
        src={item.image}
        alt={item.name}
        fallbackType={item.type}
        size="sm"
        className="w-12 h-14 flex-shrink-0 rounded-xl overflow-hidden"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors truncate">
          {item.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{item.type}</p>
      </div>
      <svg
        className="w-4 h-4 text-slate-300 group-hover:text-emerald-400 flex-shrink-0 transition-colors"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

export default function Home() {
  const [trending, setTrending] = useState<TrendingItem[]>([])
  const [randomPicks, setRandomPicks] = useState<TrendingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/trending")
      .then((r) => r.json())
      .then((data: TrendingItem[]) => {
        setTrending(data.slice(0, 4))
        const shuffled = data.slice().sort((a, b) => {
          const ha = a.name.charCodeAt(0) + a.name.charCodeAt(a.name.length - 1)
          const hb = b.name.charCodeAt(0) + b.name.charCodeAt(b.name.length - 1)
          return ha - hb
        })
        setRandomPicks(shuffled.slice(0, 4))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-20">
      <section className="relative flex flex-col items-center text-center gap-8 py-20 px-4 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/60 to-white" />
        <div
          className="absolute inset-0 -z-10 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgb(167 243 208 / 0.4), transparent)",
          }}
        />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-500 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Realtime Device Comparison
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] max-w-3xl">
          Compare{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
            PC & Mobile
          </span>{" "}
          Devices
        </h1>

        <p className="text-slate-500 max-w-xl text-base sm:text-lg leading-relaxed">
          Smart scoring comparison for gaming rigs, ultrabooks, and flagship
          smartphones — powered by live data.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Link
            href="/compare"
            className="px-8 py-3.5 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-slate-700 transition-all duration-200 shadow-lg shadow-slate-900/10 text-center"
          >
            Start Comparing
          </Link>
          <Link
            href="/search"
            className="px-8 py-3.5 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 text-center"
          >
            Search Device
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-1">Live</p>
            <h2 className="text-2xl font-bold text-slate-900">Trending Now</h2>
          </div>
          <Link href="/search" className="text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <TrendingSkeleton key={i} />)
            : trending.map((item, i) => <TrendingCard key={i} item={item} />)}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-1">Browse</p>
          <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/search?q=${encodeURIComponent(cat)}`}
              className="px-5 py-2.5 bg-white text-slate-700 font-medium text-sm rounded-xl border border-slate-200 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5 pb-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-1">Discover</p>
          <h2 className="text-2xl font-bold text-slate-900">Random Picks</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
              ))
            : randomPicks.map((item, i) => <RandomPickCard key={i} item={item} />)}
        </div>
      </section>
    </div>
  )
}