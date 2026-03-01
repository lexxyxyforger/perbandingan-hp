type Props = {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  label?: string
  error?: string
  hint?: string
  disabled?: boolean
}

export default function Input({ value, onChange, placeholder, label, error, hint, disabled }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <input
        className={`w-full px-4 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-xl border text-sm transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
          ${error ? "border-red-300 focus:border-red-400 focus:ring-red-500/20" : "border-slate-200 hover:border-slate-300"}
        `}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}