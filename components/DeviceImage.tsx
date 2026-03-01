"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

type Props = {
  src: string
  alt: string
  className?: string
  fallbackType?: "Mobile" | "PC"
  size?: "sm" | "md" | "lg"
}

function MobileSVG({ size }: { size: number }) {
  return (
    <svg width={size * 0.45} height={size * 0.75} viewBox="0 0 45 75" fill="none">
      <rect x="1" y="1" width="43" height="73" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
      <rect x="5" y="8" width="35" height="52" rx="2" fill="#e2e8f0"/>
      <rect x="16" y="63" width="13" height="4" rx="2" fill="#cbd5e1"/>
      <rect x="18" y="3" width="9" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="8" y="11" width="29" height="46" rx="1" fill="#f1f5f9"/>
      <rect x="12" y="22" width="21" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="14" y="27" width="17" height="2" rx="1" fill="#e2e8f0"/>
      <rect x="16" y="32" width="13" height="2" rx="1" fill="#e2e8f0"/>
      <circle cx="22.5" cy="43" r="5" fill="#e2e8f0"/>
    </svg>
  )
}

function PCSVG({ size }: { size: number }) {
  return (
    <svg width={size * 0.8} height={size * 0.65} viewBox="0 0 80 65" fill="none">
      <rect x="1" y="1" width="78" height="52" rx="5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
      <rect x="5" y="5" width="70" height="44" rx="3" fill="#f1f5f9"/>
      <rect x="10" y="10" width="60" height="34" rx="2" fill="#e2e8f0"/>
      <rect x="30" y="53" width="20" height="5" fill="#e2e8f0"/>
      <rect x="20" y="58" width="40" height="3" rx="1.5" fill="#cbd5e1"/>
      <rect x="18" y="18" width="44" height="3" rx="1.5" fill="#cbd5e1"/>
      <rect x="22" y="24" width="36" height="2" rx="1" fill="#e2e8f0"/>
      <rect x="26" y="29" width="28" height="2" rx="1" fill="#e2e8f0"/>
    </svg>
  )
}

const sizeMap = { sm: 56, md: 96, lg: 140 }

export default function DeviceImage({
  src,
  alt,
  className = "",
  fallbackType = "Mobile",
  size = "md",
}: Props) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(!src ? "error" : "loading")
  const px = sizeMap[size]

  useEffect(() => {
    if (!src) {
      return
    }
    const img = document.createElement("img")
    img.src = src
    img.onload = () => setStatus("loaded")
    img.onerror = () => setStatus("error")
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  const Placeholder = (
    <div className={`flex items-center justify-center bg-slate-50 ${className}`}>
      {fallbackType === "Mobile" ? <MobileSVG size={px} /> : <PCSVG size={px} />}
    </div>
  )

  if (!src || status === "error") return Placeholder

  return (
    <div className={`relative flex items-center justify-center bg-slate-50 overflow-hidden ${className}`}>
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallbackType === "Mobile" ? <MobileSVG size={px} /> : <PCSVG size={px} />}
        </div>
      )}
      {status === "loaded" && (
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-contain w-full h-full p-3 transition-opacity duration-300 opacity-100`}
        />
      )}
    </div>
  )
}