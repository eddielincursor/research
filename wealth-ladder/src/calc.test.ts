import { describe, expect, it } from "vitest"
import {
  LEVELS,
  carefreeDifference,
  compact,
  duration,
  levelOf,
  monthsToTarget,
  progressInLevel,
  project,
  requiredMonthly,
  totals,
} from "./calc"

describe("levelOf", () => {
  it("uses 10× USD bands with exclusive upper bounds", () => {
    expect(levelOf(-5000).id).toBe(1)
    expect(levelOf(9_999).id).toBe(1)
    expect(levelOf(10_000).id).toBe(2)
    expect(levelOf(99_999).id).toBe(2)
    expect(levelOf(100_000).id).toBe(3)
    expect(levelOf(1_000_000).id).toBe(4)
    expect(levelOf(10_000_000).id).toBe(5)
    expect(levelOf(100_000_000).id).toBe(6)
    expect(levelOf(5e9).id).toBe(6)
  })
})

describe("progressInLevel", () => {
  it("is linear inside Level 1 and clamps negatives to 0", () => {
    expect(progressInLevel(-1000, LEVELS[0])).toBe(0)
    expect(progressInLevel(5000, LEVELS[0])).toBeCloseTo(0.5)
  })

  it("is logarithmic above Level 1", () => {
    expect(progressInLevel(100_000, LEVELS[2])).toBeCloseTo(0)
    expect(progressInLevel(Math.sqrt(10) * 100_000, LEVELS[2])).toBeCloseTo(0.5)
    expect(progressInLevel(1e9, LEVELS[5])).toBe(1)
  })
})

describe("totals", () => {
  it("matches the article example (小芬)", () => {
    const t = totals(
      { cash: 180_000, invest: 250_000, retirement: 0, home: 12_000_000, property: 0, other: 0 },
      { mortgage: 7_600_000, highInterest: 200_000, loans: 0, otherDebt: 0 },
    )
    expect(t.netWorth).toBe(4_630_000)
    expect(t.liquid).toBe(230_000)
    expect(t.homeEquity).toBe(4_400_000)
  })
})

describe("carefreeDifference", () => {
  it("is 0.01% of positive net worth", () => {
    expect(carefreeDifference(3_000_000)).toBeCloseTo(300)
    expect(carefreeDifference(-50_000)).toBe(0)
  })
})

describe("time to next level", () => {
  it("returns 0 when already above target", () => {
    expect(monthsToTarget(500, 0, 0.05, 100)).toBe(0)
  })

  it("only adds deposits at 0%", () => {
    expect(monthsToTarget(0, 1000, 0, 12_000)).toBe(12)
  })

  it("returns null when the target is out of reach", () => {
    expect(monthsToTarget(0, 0, 0, 1)).toBeNull()
  })

  it("agrees with requiredMonthly", () => {
    const need = requiredMonthly(100_000, 0.06, 3_200_000, 120)
    const end = project(100_000, need, 0.06, 10).at(-1)!.balance
    expect(end).toBeCloseTo(3_200_000, 0)
  })

  it("needs nothing when growth alone reaches the target", () => {
    expect(requiredMonthly(3_000_000, 0.06, 3_200_000, 120)).toBe(0)
  })
})

describe("formatting", () => {
  it("formats 萬 and 億", () => {
    expect(compact(3_200_000)).toBe("320 萬")
    expect(compact(32_000_000)).toBe("3200 萬")
    expect(compact(320_000_000)).toBe("3.2 億")
    expect(compact(-100_000)).toBe("-10 萬")
  })

  it("formats durations", () => {
    expect(duration(5)).toBe("5 個月")
    expect(duration(24)).toBe("2 年")
    expect(duration(30)).toBe("2 年 6 個月")
  })
})
