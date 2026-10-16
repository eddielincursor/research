export type Bucket = {
  label: string
  weight: number
  color: string
  hint: string
  invest?: boolean
  living?: boolean
}

export type Method = {
  id: string
  name: string
  ratio: string
  buckets: Bucket[]
}

const C = {
  living: "#0f6e6a",
  invest: "#e95420",
  saving: "#244c7a",
  risk: "#5e2750",
  growth: "#a87014",
  want: "#b06030",
}

export const METHODS: Method[] = [
  {
    id: "631",
    name: "631",
    ratio: "60 / 30 / 10",
    buckets: [
      { label: "生活支出", weight: 60, color: C.living, hint: "房租、伙食、交通、帳單", living: true },
      { label: "儲蓄投資", weight: 30, color: C.invest, hint: "預備金存滿前先存現金", invest: true },
      { label: "風險準備", weight: 10, color: C.risk, hint: "保費與意外支出" },
    ],
  },
  {
    id: "333",
    name: "333",
    ratio: "1/3 × 3",
    buckets: [
      { label: "生活支出", weight: 1, color: C.living, hint: "含基本保障型保費", living: true },
      { label: "投資理財", weight: 1, color: C.invest, hint: "股票、基金、ETF", invest: true },
      { label: "長期儲蓄", weight: 1, color: C.saving, hint: "活存、定存、緊急預備金" },
    ],
  },
  {
    id: "5311",
    name: "5311",
    ratio: "50 / 30 / 10 / 10",
    buckets: [
      { label: "生活支出", weight: 50, color: C.living, hint: "最需要記帳控制的一格", living: true },
      { label: "儲蓄投資", weight: 30, color: C.invest, hint: "定存與定期定額", invest: true },
      { label: "保險", weight: 10, color: C.risk, hint: "醫療與意外保障" },
      { label: "自我成長", weight: 10, color: C.growth, hint: "課程、書、證照" },
    ],
  },
  {
    id: "503020",
    name: "50/30/20",
    ratio: "50 / 30 / 20",
    buckets: [
      { label: "必要支出", weight: 50, color: C.living, hint: "不付就會出事的帳", living: true },
      { label: "想要的花費", weight: 30, color: C.want, hint: "外食、娛樂、購物" },
      { label: "儲蓄與還債", weight: 20, color: C.invest, hint: "高利負債先還", invest: true },
    ],
  },
]

export type Share = Bucket & { share: number; monthly: number }

/** Whole-dollar split by largest remainder so the parts always add back to the income. */
export function allocate(income: number, buckets: Bucket[]): Share[] {
  const whole = Math.max(0, Math.round(income))
  const total = buckets.reduce((s, b) => s + b.weight, 0)
  const raw = buckets.map((b) => (whole * b.weight) / total)
  const parts = raw.map(Math.floor)
  let left = whole - parts.reduce((a, b) => a + b, 0)
  raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i)
    .forEach(({ i }) => {
      if (left > 0) {
        parts[i] += 1
        left -= 1
      }
    })
  return buckets.map((b, i) => ({ ...b, share: b.weight / total, monthly: parts[i] }))
}

/** Same thresholds as the tutorial: ~60% → 631, ~50% → 5311, ≤35% → 333. */
export function recommend(income: number, essentials: number): string | null {
  if (income <= 0 || essentials <= 0) return null
  const r = essentials / income
  if (r > 0.7) return "over"
  if (r > 0.55) return "631"
  if (r > 0.36) return "5311"
  return "333"
}

export type YearPoint = { year: number; contributed: number; balance: number }

/** Annual rate is treated as effective: monthly = (1 + r)^(1/12) − 1, deposits at month end. */
export function grow(initial: number, monthly: number, annualRate: number, years: number): YearPoint[] {
  const rm = Math.pow(1 + annualRate, 1 / 12) - 1
  let balance = initial
  let contributed = initial
  const points: YearPoint[] = [{ year: 0, contributed, balance }]
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + rm) + monthly
      contributed += monthly
    }
    points.push({ year: y, contributed, balance })
  }
  return points
}

export function money(n: number): string {
  return Math.round(n).toLocaleString("zh-TW")
}

export function compact(n: number): string {
  const a = Math.abs(n)
  if (a >= 1e8) return `${trim(n / 1e8)} 億`
  if (a >= 1e4) return `${trim(n / 1e4)} 萬`
  return money(n)
}

function trim(n: number): string {
  const d = Math.abs(n) >= 100 ? 0 : 1
  return n.toFixed(d).replace(/\.0$/, "")
}
