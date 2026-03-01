import ScoreBar from "./ScoreBar"

type Props = {
  title: string
  score: number
  breakdown?: Record<string, number>
  winner?: boolean
}

const barColor = (key: string) => {
  if (key === "cpu") return "blue"
  if (key === "gpu") return "rose"
  if (key === "battery") return "amber"
  if (key === "camera") return "emerald"
  return "emerald"
}

export default function ScoreCard({ title, score, breakdown, winner }: Props) {
  return (
    <div className={`bg-white p-6 rounded-2xl border flex flex-col gap-5 transition-all duration-300 ${
      winner ? "border-emerald-300 shadow-lg shadow-emerald-500/10" : "border-slate-100 shadow-sm"
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{title}</p>
          <p className={`text-5xl font-bold tracking-tight ${winner ? "text-emerald-500" : "text-slate-800"}`}>
            {score}
          </p>
        </div>
        {winner && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-200">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Winner
          </span>
        )}
      </div>

      <ScoreBar value={score} color={winner ? "emerald" : "blue"} />

      {breakdown && (
        <div className="flex flex-col gap-3 pt-2 border-t border-slate-50">
          {Object.entries(breakdown)
            .filter(([k]) => k !== "total")
            .map(([key, val]) => (
              <div key={key} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500 capitalize">{key}</span>
                  <span className="text-xs font-bold text-slate-700">{val}</span>
                </div>
                <ScoreBar value={val} color={barColor(key) as "emerald" | "blue" | "amber" | "rose"} size="sm" />
              </div>
            ))}
        </div>
      )}
    </div>
  )
}