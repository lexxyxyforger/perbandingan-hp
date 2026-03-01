"use client"

import { useEffect, useState } from "react"

type Props = {
  value: number
  color?: "emerald" | "blue" | "amber" | "rose"
  showLabel?: boolean
  size?: "sm" | "md"
}

const colorMap = {
  emerald: "from-emerald-400 to-teal-500",
  blue: "from-blue-400 to-indigo-500",
  amber: "from-amber-400 to-orange-500",
  rose: "from-rose-400 to-pink-500",
}

export default function ScoreBar({ value, color = "emerald", showLabel = false, size = "md" }: Props) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 100)
    return () => clearTimeout(t)
  }, [value])

  const h = size === "sm" ? "h-1.5" : "h-2"

  return (
    <div className="flex items-center gap-3 w-full">
      <div className={`flex-1 bg-slate-100 rounded-full ${h} overflow-hidden`}>
        <div
          className={`${h} rounded-full bg-gradient-to-r ${colorMap[color]} transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-500 w-8 text-right">{value}</span>
      )}
    </div>
  )
}