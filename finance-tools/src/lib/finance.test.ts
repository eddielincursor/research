import { describe, expect, it } from "vitest"
import { allocate, getMethod, recommend } from "./budget"
import { finalRow, monthsToTarget, requiredMonthly, simulate } from "./invest"

const base = {
  initial: 0,
  monthly: 15000,
  annualRate: 0.06,
  years: 10,
  timing: "end" as const,
  stepUp: 0,
  inflation: 0,
}

describe("allocate", () => {
  it("matches the tutorial's 631 example", () => {
    const parts = allocate(50000, getMethod("631").buckets).map((a) => a.monthly)
    expect(parts).toEqual([30000, 15000, 5000])
  })

  it("keeps 333 summing to the full income", () => {
    const parts = allocate(50000, getMethod("333").buckets).map((a) => a.monthly)
    expect(parts.reduce((a, b) => a + b, 0)).toBe(50000)
    expect(parts).toEqual([16667, 16667, 16666])
  })

  it("splits the six jars exactly", () => {
    const parts = allocate(50000, getMethod("jars").buckets).map((a) => a.monthly)
    expect(parts).toEqual([27500, 5000, 5000, 5000, 5000, 2500])
  })
})

describe("recommend", () => {
  it("follows the tutorial thresholds", () => {
    expect(recommend(50000, 30000)?.method).toBe("631")
    expect(recommend(80000, 24000)?.method).toBe("333")
    expect(recommend(50000, 25000)?.method).toBe("5311")
    expect(recommend(50000, 40000)?.level).toBe("danger")
  })
})

describe("simulate", () => {
  it("returns principal only at 0% return", () => {
    const row = finalRow({ ...base, annualRate: 0 })
    expect(row.balance).toBeCloseTo(1_800_000)
    expect(row.gains).toBeCloseTo(0)
  })

  it("treats the rate as an effective annual return for a lump sum", () => {
    const row = finalRow({ ...base, initial: 100000, monthly: 0, years: 1 })
    expect(row.balance).toBeCloseTo(106000, 6)
  })

  it("adds one extra month of growth when contributing at the start", () => {
    const end = finalRow(base).balance
    const start = finalRow({ ...base, timing: "start" }).balance
    expect(start / end).toBeCloseTo(Math.pow(1.06, 1 / 12), 10)
  })

  it("steps up contributions each year", () => {
    const rows = simulate({ ...base, annualRate: 0, years: 2, stepUp: 0.1 })
    expect(rows[2].contributed).toBeCloseTo(15000 * 12 + 16500 * 12)
  })

  it("discounts by inflation", () => {
    const row = finalRow({ ...base, initial: 100000, monthly: 0, annualRate: 0, years: 2, inflation: 0.02 })
    expect(row.realBalance).toBeCloseTo(100000 / 1.0404)
  })
})

describe("goals", () => {
  it("finds the monthly amount that reaches the target", () => {
    const target = 2_000_000
    const needed = requiredMonthly(base, target)
    expect(needed).not.toBeNull()
    expect(finalRow({ ...base, monthly: needed! }).balance).toBeGreaterThanOrEqual(target)
    expect(finalRow({ ...base, monthly: needed! - 1 }).balance).toBeLessThan(target)
  })

  it("counts months to a target", () => {
    expect(monthsToTarget({ ...base, annualRate: 0 }, 150000)).toBe(10)
    expect(monthsToTarget({ ...base, monthly: 0, annualRate: 0 }, 1)).toBeNull()
  })
})
