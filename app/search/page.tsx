"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Input from "@/components/Input"
import DeviceImage from "@/components/DeviceImage"

type SearchResult = {
  name: string
  url: string
  image: string
  type: "Mobile" | "PC"
  slug: string
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debouncedQuery = useDebounce(query, 500)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([])
      setSearched(false)
      return
    }

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    async function search() {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}`,
          { signal: abortRef.current!.signal }
        )
        if (!res.ok) throw new Error()
        const data = await res.json()
        setResults(data)
        setSearched(true)
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setResults([])
          setSearched(true)
        }
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [debouncedQuery])

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8 py-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-2">Search</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Find a Device</h1>
        <p className="text-slate-500 mt-3">Search any phone or PC, then compare it with another device.</p>
      </div>

      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. iPhone 15 Pro, Samsung S24, RTX 4090..."
          hint="Type at least 2 characters to search"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg className="animate-spin w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:border-emerald-200 hover:shadow-md transition-all duration-200"
            >
              {item.image && (
                <DeviceImage
                  src={item.image}
                  alt={item.name}
                  fallbackType={item.type}
                  size="sm"
                  className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  item.type === "Mobile"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-violet-50 text-violet-600"
                }`}>
                  {item.type}
                </span>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Link
                  href={`/device/${item.slug}?url=${encodeURIComponent(item.url)}`}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition text-center border border-slate-200"
                >
                  Detail
                </Link>
                <Link
                  href={`/compare?url1=${encodeURIComponent(item.url)}`}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition text-center"
                >
                  Compare →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center">
          <p className="text-2xl mb-3">🔍</p>
          <p className="font-semibold text-slate-700">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-sm text-slate-400 mt-1">Try a different name or brand</p>
        </div>
      )}

      {!query && (
        <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center">
          <p className="text-2xl mb-3">📱💻</p>
          <p className="font-semibold text-slate-700">Search any device</p>
          <p className="text-sm text-slate-400 mt-1">Results appear as you type</p>
        </div>
      )}
    </div>
  )
}