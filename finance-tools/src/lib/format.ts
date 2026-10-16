const twd = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 0 })

export function money(value: number): string {
  if (!Number.isFinite(value)) return "—"
  return twd.format(Math.round(value))
}

export function compactMoney(value: number): string {
  if (!Number.isFinite(value)) return "—"
  const abs = Math.abs(value)
  if (abs >= 1e8) return `${trim(value / 1e8)} 億`
  if (abs >= 1e4) return `${trim(value / 1e4)} 萬`
  return money(value)
}

function trim(value: number): string {
  const digits = Math.abs(value) >= 100 ? 0 : Math.abs(value) >= 10 ? 1 : 2
  return Number(value.toFixed(digits)).toLocaleString("zh-TW")
}

export function percent(fraction: number, digits = 1): string {
  if (!Number.isFinite(fraction)) return "—"
  return `${Number((fraction * 100).toFixed(digits))}%`
}

export function duration(months: number): string {
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) return `${rest} 個月`
  if (rest === 0) return `${years} 年`
  return `${years} 年 ${rest} 個月`
}
