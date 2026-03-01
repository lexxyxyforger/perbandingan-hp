"use client"

import CompareForm from "@/components/CompareForm"

export default function ComparePage() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-10 py-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-2">Compare</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
          Head-to-Head Comparison
        </h1>
        <p className="text-slate-500 mt-3 text-base leading-relaxed">
          Ketik nama dua perangkat dan dapatkan perbandingan skor secara langsung.
          Mendukung perangkat mobile dari GSMArena.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <CompareForm />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: "⚡", title: "Realtime Scraping", desc: "Data diambil langsung dari halaman perangkat" },
          { icon: "📊", title: "Smart Scoring", desc: "Bobot dari 5–6 faktor performa" },
          { icon: "🏆", title: "Pemenang Jelas", desc: "Hasil instan dengan breakdown lengkap" },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col gap-2">
            <span className="text-2xl">{item.icon}</span>
            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}