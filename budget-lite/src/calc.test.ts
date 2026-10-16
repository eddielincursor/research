import { describe, expect, it } from "vitest"
import { METHODS, allocate, compact, grow, recommend } from "./calc"

const method = (id: string) => METHODS.find((m) => m.id === id)!.buckets

describe("allocate", () => {
  it("splits 631 exactly", () => {
    expect(allocate(50000, method("631")).map((s) => s.monthly)).toEqual([30000, 15000, 5000])
  })

  it("puts the 333 remainder in the first bucket and keeps the total", () => {
    const parts = allocate(50000, method("333")).map((s) => s.monthly)
    expect(parts).toEqual([16667, 16667, 16666])
    expect(parts.reduce((a, b) => a + b)).toBe(50000)
  })
})

describe("recommend", () => {
  it("follows the tutorial thresholds", () => {
    expect(recommend(50000, 30000)).toBe("631")
    expect(recommend(50000, 25000)).toBe("5311")
    expect(recommend(80000, 24000)).toBe("333")
    expect(recommend(50000, 40000)).toBe("over")
    expect(recommend(50000, 0)).toBeNull()
  })
})

describe("grow", () => {
  it("treats the annual rate as effective", () => {
    expect(grow(100000, 0, 0.06, 1)[1].balance).toBeCloseTo(106000, 6)
  })

  it("only adds contributions at 0%", () => {
    const last = grow(0, 10000, 0, 10).at(-1)!
    expect(last.balance).toBeCloseTo(1200000, 6)
    expect(last.contributed).toBe(1200000)
  })
})

it("formats large amounts in 萬 and 億", () => {
  expect(compact(4_000_000)).toBe("400 萬")
  expect(compact(125_000)).toBe("12.5 萬")
  expect(compact(250_000_000)).toBe("2.5 億")
})
