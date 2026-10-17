/**
 * 114 年（2025）工業及服務業受僱員工薪資。
 * 來源：行政院主計總處《薪資及生產力統計新聞稿》114 年 12 月（115 年 2 月 11 日發布），
 * 表 6 個人特性別、表 9 十等分位。114 年全年數字主計總處標為初步統計。
 * 同齡百分位的分布形狀，用 113 年全年總薪資的年齡別四分位（薪資中位數統計表 5）調整。
 * 官方沒有公布各年齡的月薪百分位，所以同齡百分比是粗估。
 */

export const YEAR = "114"

export const OVERALL = {
  average: 47_884,
  median: 38_406,
  /** 低於平均經常性薪資的員工比率，109 年到 114 年 */
  belowAverage: [66.78, 66.78, 67.22, 68.27, 69.22, 69.74],
  realAverageGrowth: 1.4,
  realMedianGrowth: 1.35,
  annualTotal: 760_632,
}

export const FULL_TIME = {
  average: 50_643,
  median: 39_890,
  belowAverage: 70.3,
  annualTotal: 806_448,
}

/** 第 1 到第 9 十分位數，單位元。第 5 個就是中位數。 */
export const DECILES = [28_590, 29_039, 30_804, 34_060, 38_406, 42_664, 48_062, 59_370, 79_053]

/** 113 年全體全年總薪資的四分位，單位萬元，只用來取分布形狀。 */
const ANNUAL_SHAPE = { q1: 40.6, median: 54.6, q3: 84.2 }

export type Stage = {
  id: string
  minAge: number
  maxAge: number
  name: string
  ages: string
  average: number
  median: number
  /** 下半部相對全體有多寬。1 代表和全體一樣。 */
  lower: number
  /** 上半部相對全體有多寬。 */
  upper: number
  note: string
}

function stretches(q1: number, median: number, q3: number) {
  const baseLo = 1 - ANNUAL_SHAPE.q1 / ANNUAL_SHAPE.median
  const baseHi = ANNUAL_SHAPE.q3 / ANNUAL_SHAPE.median - 1
  return {
    lower: (1 - q1 / median) / baseLo,
    upper: (q3 / median - 1) / baseHi,
  }
}

function stage(
  id: string,
  minAge: number,
  maxAge: number,
  name: string,
  ages: string,
  average: number,
  median: number,
  annualQ1: number,
  annualMedian: number,
  annualQ3: number,
  note: string,
): Stage {
  const s = stretches(annualQ1, annualMedian, annualQ3)
  return { id, minAge, maxAge, name, ages, average, median, lower: s.lower, upper: s.upper, note }
}

export const STAGES: Stage[] = [
  stage("u25", 0, 24, "初入職場", "未滿 25 歲", 27_829, 29_101, 30.2, 38.1, 49.1, "這個階段部分工時和剛入行的人多，低薪把平均往下拉，所以平均比中位數還低。過了平均，不代表已經贏過一半的人。"),
  stage("a25", 25, 29, "站穩腳步", "25–29 歲", 39_965, 35_404, 40.3, 52.1, 70.7, "中位數和平均開始分開。達到中位數算及格，達到平均就已經是同齡的前段。"),
  stage("a30", 30, 39, "累積期", "30–39 歲", 46_757, 39_081, 43, 58.1, 86.2, "很多人這時成家、轉職或開始帶人。同齡平均已經很接近全體平均。"),
  stage("a40", 40, 49, "責任加重", "40–49 歲", 53_593, 42_156, 44, 62, 99.5, "平均和中位數的差距拉到一萬多元。高薪的人開始明顯把平均墊高。"),
  stage("a50", 50, 64, "薪資高原", "50–64 歲", 56_769, 43_220, 42.3, 57.9, 98.3, "同齡中位數是六個階段裡最高的，但平均更高。典型的月薪停在四萬出頭，不是五萬六。"),
  stage("a65", 65, 200, "再就業", "65 歲以上", 47_940, 38_205, 33.9, 43.9, 62.7, "包含退休後再工作的人，工時和職務差很大，中位數回到和全體差不多的位置。"),
]

export function stageOf(age: number): Stage {
  return STAGES.find((s) => age >= s.minAge && age <= s.maxAge) ?? STAGES[STAGES.length - 1]
}

/** 全體月薪分布：薪資除以全體中位數，在百分位 p 的位置。p 取 0.1 到 0.9。 */
export function overallRatio(p: number): number {
  const x = Math.min(9, Math.max(1, p * 10))
  const i = Math.min(7, Math.floor(x) - 1)
  const t = x - (i + 1)
  const a = Math.log(DECILES[i])
  const b = Math.log(DECILES[Math.min(8, i + 1)])
  return Math.exp(a + (b - a) * t) / OVERALL.median
}

/** 把全體分布的寬度，依這個年齡在 113 年的形狀縮放。 */
export function ageRatio(stage: Stage, p: number): number {
  const r = overallRatio(p)
  if (p >= 0.5) return 1 + (r - 1) * stage.upper
  return 1 - (1 - r) * stage.lower
}

export type Percent = { percent: number; cap: "low" | "high" | null }

function percentileOf(target: number, ratioAt: (p: number) => number): Percent {
  if (target < ratioAt(0.1)) return { percent: 10, cap: "low" }
  if (target > ratioAt(0.9)) return { percent: 90, cap: "high" }
  let lo = 0.1
  let hi = 0.9
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2
    if (ratioAt(mid) < target) lo = mid
    else hi = mid
  }
  return { percent: ((lo + hi) / 2) * 100, cap: null }
}

export function overallPercent(salary: number): Percent {
  return percentileOf(salary / OVERALL.median, overallRatio)
}

export function agePercent(stage: Stage, salary: number): Percent {
  return percentileOf(salary / stage.median, (p) => ageRatio(stage, p))
}

/** 官方十分位的區間：至少贏過 floor%，還沒到 ceil%。ceil 為 null 代表已過第 9 十分位。 */
export function band(salary: number): { floor: number; ceil: number | null } {
  let floor = 0
  for (let i = 0; i < DECILES.length; i++) {
    if (salary < DECILES[i]) return { floor, ceil: (i + 1) * 10 }
    floor = (i + 1) * 10
  }
  return { floor: 90, ceil: null }
}

export type Verdict = "below" | "median" | "average" | "average-only"

/** 未滿 25 歲的平均比中位數低，所以「過了平均」要分開看。 */
export function verdict(stage: Stage, salary: number): Verdict {
  const pastMedian = salary >= stage.median
  const pastAverage = salary >= stage.average
  if (stage.average < stage.median) {
    if (pastMedian) return "median"
    if (pastAverage) return "average-only"
    return "below"
  }
  if (pastAverage) return "average"
  if (pastMedian) return "median"
  return "below"
}

export function money(n: number): string {
  return Math.round(n).toLocaleString("zh-Hant-TW")
}

/** 顯示用：粗估百分位取到最接近的 5。 */
export function rough(percent: number): number {
  return Math.min(90, Math.max(10, Math.round(percent / 5) * 5))
}
