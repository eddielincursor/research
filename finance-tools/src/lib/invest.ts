export type Timing = "start" | "end"

export type InvestInput = {
  initial: number
  monthly: number
  /** Annual return as a fraction, e.g. 0.06. Treated as an effective annual rate. */
  annualRate: number
  years: number
  timing: Timing
  /** Yearly increase of the monthly contribution, as a fraction. */
  stepUp: number
  /** Yearly inflation, as a fraction, used to express results in today's money. */
  inflation: number
}

export type YearRow = {
  year: number
  contributed: number
  balance: number
  gains: number
  realBalance: number
  monthlyThisYear: number
}

export function monthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate, 1 / 12) - 1
}

function clampInput(input: InvestInput): InvestInput {
  return {
    ...input,
    initial: Math.max(0, input.initial),
    monthly: Math.max(0, input.monthly),
    years: Math.min(80, Math.max(0, Math.round(input.years))),
    annualRate: Math.max(-0.99, input.annualRate),
    stepUp: Math.max(-0.99, input.stepUp),
    inflation: Math.max(-0.99, input.inflation),
  }
}

export function simulate(raw: InvestInput): YearRow[] {
  const input = clampInput(raw)
  const rm = monthlyRate(input.annualRate)
  let balance = input.initial
  let contributed = input.initial
  const rows: YearRow[] = [
    {
      year: 0,
      contributed,
      balance,
      gains: 0,
      realBalance: balance,
      monthlyThisYear: 0,
    },
  ]
  for (let year = 1; year <= input.years; year++) {
    const monthlyThisYear = input.monthly * Math.pow(1 + input.stepUp, year - 1)
    for (let m = 0; m < 12; m++) {
      if (input.timing === "start") {
        balance += monthlyThisYear
        balance *= 1 + rm
      } else {
        balance *= 1 + rm
        balance += monthlyThisYear
      }
      contributed += monthlyThisYear
    }
    rows.push({
      year,
      contributed,
      balance,
      gains: balance - contributed,
      realBalance: balance / Math.pow(1 + input.inflation, year),
      monthlyThisYear,
    })
  }
  return rows
}

export function finalRow(input: InvestInput): YearRow {
  const rows = simulate(input)
  return rows[rows.length - 1]
}

/** Monthly contribution that reaches the target by the end of the period, or null if unreachable. */
export function requiredMonthly(input: InvestInput, target: number): number | null {
  if (target <= 0) return 0
  if (input.years <= 0) return input.initial >= target ? 0 : null
  if (finalRow({ ...input, monthly: 0 }).balance >= target) return 0
  let lo = 0
  let hi = Math.max(1000, target)
  while (finalRow({ ...input, monthly: hi }).balance < target) {
    hi *= 2
    if (hi > 1e13) return null
  }
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (finalRow({ ...input, monthly: mid }).balance >= target) hi = mid
    else lo = mid
  }
  return Math.ceil(hi)
}

/** Months until the balance first reaches the target, searching up to maxYears. */
export function monthsToTarget(input: InvestInput, target: number, maxYears = 80): number | null {
  const safe = clampInput({ ...input, years: maxYears })
  if (target <= 0 || safe.initial >= target) return 0
  const rm = monthlyRate(safe.annualRate)
  let balance = safe.initial
  for (let month = 1; month <= maxYears * 12; month++) {
    const monthly = safe.monthly * Math.pow(1 + safe.stepUp, Math.floor((month - 1) / 12))
    if (safe.timing === "start") {
      balance = (balance + monthly) * (1 + rm)
    } else {
      balance = balance * (1 + rm) + monthly
    }
    if (balance >= target) return month
  }
  return null
}

export function ruleOf72(annualRate: number): number | null {
  const pct = annualRate * 100
  if (pct <= 0) return null
  return 72 / pct
}

export function exactDoublingYears(annualRate: number): number | null {
  if (annualRate <= 0) return null
  return Math.log(2) / Math.log(1 + annualRate)
}
