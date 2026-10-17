import { describe, expect, it } from "vitest"
import {
  DECILES,
  OVERALL,
  STAGES,
  agePercent,
  band,
  overallPercent,
  overallRatio,
  stageOf,
  verdict,
} from "./calc"

describe("salary position", () => {
  it("puts each age in the official group", () => {
    expect(stageOf(18).id).toBe("u25")
    expect(stageOf(24).id).toBe("u25")
    expect(stageOf(25).id).toBe("a25")
    expect(stageOf(29).id).toBe("a25")
    expect(stageOf(30).id).toBe("a30")
    expect(stageOf(39).id).toBe("a30")
    expect(stageOf(40).id).toBe("a40")
    expect(stageOf(50).id).toBe("a50")
    expect(stageOf(64).id).toBe("a50")
    expect(stageOf(65).id).toBe("a65")
    expect(stageOf(80).id).toBe("a65")
  })

  it("only the under-25 stage has an average below the median", () => {
    expect(STAGES[0].average).toBeLessThan(STAGES[0].median)
    for (const s of STAGES.slice(1)) expect(s.average).toBeGreaterThan(s.median)
  })

  it("hits the official deciles exactly", () => {
    expect(overallRatio(0.1)).toBeCloseTo(DECILES[0] / OVERALL.median, 6)
    expect(overallRatio(0.5)).toBeCloseTo(1, 6)
    expect(overallRatio(0.9)).toBeCloseTo(DECILES[8] / OVERALL.median, 6)
  })

  it("reads the overall median as 50% and the average as about 70%", () => {
    expect(overallPercent(OVERALL.median).percent).toBeCloseTo(50, 0)
    const avg = overallPercent(OVERALL.average)
    expect(avg.percent).toBeGreaterThan(68)
    expect(avg.percent).toBeLessThan(71)
    expect(band(OVERALL.average)).toEqual({ floor: 60, ceil: 70 })
  })

  it("caps the tails instead of inventing a percentile", () => {
    expect(overallPercent(20_000).cap).toBe("low")
    expect(overallPercent(200_000).cap).toBe("high")
    expect(band(20_000)).toEqual({ floor: 0, ceil: 10 })
    expect(band(200_000)).toEqual({ floor: 90, ceil: null })
  })

  it("puts a person on their age group's median at about 50%", () => {
    for (const s of STAGES) {
      const p = agePercent(s, s.median)
      expect(p.cap).toBeNull()
      expect(p.percent).toBeGreaterThan(48)
      expect(p.percent).toBeLessThan(52)
    }
  })

  it("ranks the age-group average as the front half, except under 25", () => {
    for (const s of STAGES.slice(1)) {
      expect(agePercent(s, s.average).percent).toBeGreaterThan(60)
    }
    expect(agePercent(STAGES[0], STAGES[0].average).percent).toBeLessThan(50)
  })

  it("keeps the age curve monotonic", () => {
    const s = stageOf(35)
    let prev = 0
    for (const pay of [25_000, 32_000, 39_081, 46_757, 60_000, 90_000]) {
      const p = agePercent(s, pay)
      const n = p.cap === "low" ? 5 : p.cap === "high" ? 95 : p.percent
      expect(n).toBeGreaterThan(prev)
      prev = n
    }
  })

  it("names the passing line", () => {
    const mid = stageOf(35)
    expect(verdict(mid, 30_000)).toBe("below")
    expect(verdict(mid, 40_000)).toBe("median")
    expect(verdict(mid, 50_000)).toBe("average")
    const young = stageOf(22)
    expect(verdict(young, 28_000)).toBe("average-only")
    expect(verdict(young, 30_000)).toBe("median")
  })
})
