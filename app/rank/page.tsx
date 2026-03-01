"use client"

import { useState } from "react"

export default function SearchPage() {
  const [query, setQuery] = useState("")

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <h2 className="text-3xl font-bold">Search Device</h2>

      <input
        className="p-3 bg-neutral-900 rounded border border-neutral-700"
        placeholder="Search device name..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <div className="bg-neutral-900 p-6 rounded-xl">
        <p className="text-neutral-400">
          Search feature coming soon
        </p>
      </div>
    </div>
  )
}