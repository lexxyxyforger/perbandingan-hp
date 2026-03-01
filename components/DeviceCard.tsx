import type { Device, MobileDevice, PCDevice } from "@/types/device"

type Props = {
  label: string
  score: number
  winner?: boolean
  device?: Device
}

function SpecRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-400 shrink-0">{label}</span>
      <span className="text-xs font-semibold text-slate-700 text-right truncate">{String(value)}</span>
    </div>
  )
}

function MobileSpecs({ device }: { device: MobileDevice }) {
  return (
    <>
      <SpecRow label="RAM" value={`${device.ram} GB`} />
      <SpecRow label="Storage" value={`${device.storage} GB`} />
      <SpecRow label="Battery" value={`${device.battery} mAh`} />
      <SpecRow label="Display" value={`${device.displayHz} Hz`} />
      <SpecRow label="Camera" value={`${device.camera} MP`} />
      <SpecRow label="Weight" value={`${device.weight} g`} />
      {device.chipset && <SpecRow label="Chipset" value={device.chipset} />}
      {device.os && <SpecRow label="OS" value={device.os} />}
    </>
  )
}

function PCSpecs({ device }: { device: PCDevice }) {
  return (
    <>
      <SpecRow label="CPU" value={device.cpuName || "N/A"} />
      <SpecRow label="GPU" value={device.gpuName || "N/A"} />
      <SpecRow label="RAM" value={`${device.ram} GB`} />
      <SpecRow label="Storage" value={`${device.storage} GB`} />
      <SpecRow label="TDP" value={`${device.tdp} W`} />
    </>
  )
}

export default function DeviceCard({ label, score, winner, device }: Props) {
  return (
    <div className={`bg-white rounded-2xl border p-6 flex flex-col gap-5 transition-all duration-300 ${
      winner
        ? "border-emerald-300 shadow-xl shadow-emerald-500/10"
        : "border-slate-100 shadow-sm"
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
          {device?.name && (
            <h3 className="text-base font-bold text-slate-800 leading-snug">{device.name}</h3>
          )}
        </div>
        {device && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
            device.type === "mobile"
              ? "bg-blue-50 text-blue-600 border border-blue-100"
              : "bg-violet-50 text-violet-600 border border-violet-100"
          }`}>
            {device.type === "mobile" ? "Mobile" : "PC"}
          </span>
        )}
      </div>

      <div className="flex items-end gap-2 min-w-0">
        <span className={`text-5xl sm:text-6xl font-bold tracking-tight ${winner ? "text-emerald-500" : "text-slate-800"}`}>
          {score}
        </span>
        <span className="text-slate-400 text-sm mb-2 font-medium">/100</span>
        {winner && (
          <span className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-200 mb-1 shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Winner
          </span>
        )}
      </div>

      {device && (
        <div className="border-t border-slate-50 pt-2">
          {device.type === "mobile" ? (
            <MobileSpecs device={device} />
          ) : (
            <PCSpecs device={device} />
          )}
        </div>
      )}
    </div>
  )
}