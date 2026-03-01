"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Input from "./Input"
import Button from "./Button"

async function searchDevice(name: string): Promise<string | null> {
  const r = await fetch(`/api/search?q=${encodeURIComponent(name.trim())}`)
  if (!r.ok) return null
  const j = await r.json()
  const results = Array.isArray(j) ? j : (j?.results ?? [])
  return results[0]?.url ?? null
}

export default function CompareForm() {
  const searchParams = useSearchParams()
  const prefilledUrl = searchParams.get("url1") ?? ""
  const prefilledName = searchParams.get("name1") ?? ""
  const hasPrefill = !!prefilledUrl || !!prefilledName

  const [name1, setName1] = useState("")
  const [name2, setName2] = useState("")
  const [errors, setErrors] = useState({ name1: "", name2: "" })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function validate() {
    const e = { name1: "", name2: "" }
    if (!hasPrefill && !name1.trim()) e.name1 = "Masukkan nama perangkat"
    if (!name2.trim()) e.name2 = "Masukkan nama perangkat"
    setErrors(e)
    return !e.name1 && !e.name2
  }

  async function handleCompare() {
    if (!validate()) return
    setLoading(true)

    try {
      let url1 = prefilledUrl
      if (!url1) {
        const query = hasPrefill ? prefilledName : name1
        const found = await searchDevice(query)
        if (!found) {
          setErrors((p) => ({ ...p, name1: `Perangkat "${query}" tidak ditemukan` }))
          setLoading(false)
          return
        }
        url1 = found
      }

      const url2 = await searchDevice(name2)
      if (!url2) {
        setErrors((p) => ({ ...p, name2: `Perangkat "${name2}" tidak ditemukan` }))
        setLoading(false)
        return
      }

      router.push(`/result?url1=${encodeURIComponent(url1)}&url2=${encodeURIComponent(url2)}`)
    } catch {
      setErrors({ name1: "", name2: "Terjadi kesalahan, coba lagi" })
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Device 1 */}
      {hasPrefill ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Perangkat 1</label>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="text-sm font-medium text-slate-700 truncate">
              {prefilledName || prefilledUrl}
            </span>
            <span className="ml-auto text-xs text-slate-400 font-medium flex-shrink-0">Terpilih</span>
          </div>
          <p className="text-xs text-slate-400">Dipilih dari halaman perangkat sebelumnya</p>
        </div>
      ) : (
        <Input
          label="Perangkat 1"
          value={name1}
          onChange={(e) => { setName1(e.target.value); setErrors((p) => ({ ...p, name1: "" })) }}
          placeholder="Contoh: Samsung Galaxy S24"
          hint="Ketik nama perangkat mobile"
          error={errors.name1}
        />
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">vs</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* Device 2 */}
      <Input
        label="Perangkat 2"
        value={name2}
        onChange={(e) => { setName2(e.target.value); setErrors((p) => ({ ...p, name2: "" })) }}
        placeholder="Contoh: iPhone 15 Pro"
        hint="Ketik nama perangkat mobile"
        error={errors.name2}
      />

      <Button onClick={handleCompare} size="lg" className="w-full mt-2" disabled={loading}>
        {loading ? "Mencari perangkat..." : "Compare Now"}
      </Button>
    </div>
  )
}