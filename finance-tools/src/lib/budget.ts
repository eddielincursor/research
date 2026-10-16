export type BucketKind =
  | "living"
  | "saving"
  | "invest"
  | "risk"
  | "growth"
  | "want"
  | "give"
  | "unassigned"

export type BucketDef = {
  key: string
  label: string
  weight: number
  kind: BucketKind
  hint: string
}

export type MethodId = "631" | "333" | "5311" | "503020" | "jars" | "custom"

export type MethodDef = {
  id: MethodId
  name: string
  ratio: string
  summary: string
  buckets: BucketDef[]
}

export const KIND_COLOR: Record<BucketKind, string> = {
  living: "#0f6e6a",
  invest: "#e95420",
  saving: "#244c7a",
  risk: "#5e2750",
  growth: "#a87014",
  want: "#b06030",
  give: "#1e7a46",
  unassigned: "#c9bfae",
}

export const METHODS: MethodDef[] = [
  {
    id: "631",
    name: "631 法則",
    ratio: "60 / 30 / 10",
    summary: "生活費已經接近六成時最貼近現實。",
    buckets: [
      { key: "living", label: "生活支出", weight: 60, kind: "living", hint: "房租、伙食、交通、帳單" },
      { key: "invest", label: "儲蓄投資", weight: 30, kind: "invest", hint: "預備金存滿前先存現金" },
      { key: "risk", label: "風險準備", weight: 10, kind: "risk", hint: "保費與意外支出" },
    ],
  },
  {
    id: "333",
    name: "333 原則",
    ratio: "1/3 × 3",
    summary: "固定支出很低，才有三分之二能留下來。",
    buckets: [
      { key: "living", label: "生活支出", weight: 1, kind: "living", hint: "含基本保障型保費" },
      { key: "invest", label: "投資理財", weight: 1, kind: "invest", hint: "股票、基金、ETF" },
      { key: "saving", label: "長期儲蓄", weight: 1, kind: "saving", hint: "活存、定存、緊急預備金" },
    ],
  },
  {
    id: "5311",
    name: "5311 理財術",
    ratio: "50 / 30 / 10 / 10",
    summary: "必要開銷壓得住一半，還想留保險和進修。",
    buckets: [
      { key: "living", label: "生活支出", weight: 50, kind: "living", hint: "最需要記帳控制的一格" },
      { key: "invest", label: "儲蓄投資", weight: 30, kind: "invest", hint: "定存與定期定額" },
      { key: "risk", label: "保險", weight: 10, kind: "risk", hint: "醫療與意外保障" },
      { key: "growth", label: "自我成長", weight: 10, kind: "growth", hint: "課程、書、證照" },
    ],
  },
  {
    id: "503020",
    name: "50/30/20",
    ratio: "50 / 30 / 20",
    summary: "把想要的花費單獨列出來，避免吃掉儲蓄。",
    buckets: [
      { key: "living", label: "必要支出", weight: 50, kind: "living", hint: "不付就會出事的帳" },
      { key: "want", label: "想要的花費", weight: 30, kind: "want", hint: "外食、娛樂、購物" },
      { key: "invest", label: "儲蓄與還債", weight: 20, kind: "invest", hint: "高利負債先還" },
    ],
  },
  {
    id: "jars",
    name: "六罐子",
    ratio: "55 / 10 × 4 / 5",
    summary: "願意把錢拆細、每格都自動轉帳的人。",
    buckets: [
      { key: "living", label: "生活必需", weight: 55, kind: "living", hint: "房租、伙食、交通、保費" },
      { key: "invest", label: "財務自由", weight: 10, kind: "invest", hint: "只進不出，用來投資" },
      { key: "saving", label: "長期消費儲蓄", weight: 10, kind: "saving", hint: "旅行或大筆購物" },
      { key: "growth", label: "教育", weight: 10, kind: "growth", hint: "提高收入的技能" },
      { key: "want", label: "玩樂", weight: 10, kind: "want", hint: "當月可以花掉" },
      { key: "give", label: "給予", weight: 5, kind: "give", hint: "送禮或捐款" },
    ],
  },
  {
    id: "custom",
    name: "自訂比例",
    ratio: "自己決定",
    summary: "從上面任何一種改起，比例加總要等於 100%。",
    buckets: [
      { key: "living", label: "生活支出", weight: 55, kind: "living", hint: "必要開銷" },
      { key: "invest", label: "投資", weight: 20, kind: "invest", hint: "長期不動用" },
      { key: "saving", label: "儲蓄", weight: 10, kind: "saving", hint: "預備金與短期目標" },
      { key: "risk", label: "保障", weight: 5, kind: "risk", hint: "保費" },
      { key: "want", label: "彈性花費", weight: 10, kind: "want", hint: "想要的東西" },
    ],
  },
]

export function getMethod(id: MethodId): MethodDef {
  const method = METHODS.find((m) => m.id === id)
  if (!method) throw new Error(`Unknown method ${id}`)
  return method
}

export type Allocation = BucketDef & { share: number; monthly: number; yearly: number }

/** Splits whole dollars by largest remainder so the parts always add back to the income. */
export function allocate(income: number, buckets: BucketDef[]): Allocation[] {
  const total = buckets.reduce((sum, b) => sum + Math.max(0, b.weight), 0)
  const whole = Math.max(0, Math.round(income))
  if (total <= 0) {
    return buckets.map((b) => ({ ...b, share: 0, monthly: 0, yearly: 0 }))
  }
  const raw = buckets.map((b) => (whole * Math.max(0, b.weight)) / total)
  const floors = raw.map(Math.floor)
  let remainder = whole - floors.reduce((a, b) => a + b, 0)
  const order = raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index)
  for (const { index } of order) {
    if (remainder <= 0) break
    floors[index] += 1
    remainder -= 1
  }
  return buckets.map((b, i) => ({
    ...b,
    share: Math.max(0, b.weight) / total,
    monthly: floors[i],
    yearly: floors[i] * 12,
  }))
}

export function weightSum(buckets: BucketDef[]): number {
  return buckets.reduce((sum, b) => sum + Math.max(0, b.weight), 0)
}

export function sumKinds(allocations: Allocation[], kinds: BucketKind[]): number {
  return allocations.filter((a) => kinds.includes(a.kind)).reduce((sum, a) => sum + a.monthly, 0)
}

export type Recommendation = {
  level: "danger" | "tight" | "balanced" | "roomy"
  method: MethodId | null
  title: string
  body: string
}

export function recommend(income: number, essentials: number): Recommendation | null {
  if (income <= 0 || essentials <= 0) return null
  const ratio = essentials / income
  if (ratio > 0.7) {
    return {
      level: "danger",
      method: null,
      title: "先處理現金流",
      body: "必要開銷超過收入七成，任何比例都很難撐。先找能降的固定支出，或增加收入，再談投資。",
    }
  }
  if (ratio > 0.55) {
    return {
      level: "tight",
      method: "631",
      title: "建議用 631",
      body: "生活費已近六成。631 的生活格裝得下，不必為了套用更緊的比例去砍房租。",
    }
  }
  if (ratio > 0.36) {
    return {
      level: "balanced",
      method: "5311",
      title: "建議用 5311 或 50/30/20",
      body: "必要開銷約一半，還有空間同時留保險、進修或想要的花費。",
    }
  }
  return {
    level: "roomy",
    method: "333",
    title: "可以試 333",
    body: "固定支出低，才有三分之一拿去投資、三分之一放長期儲蓄。",
  }
}
