import { describe, expect, it } from "vitest"
import { BOBO_SECONDS, MAX_LIVES, PLAYER_Y, comboMultiplier, newGame, pickKind, rankFor, step, type GameState } from "./game-core"
import type { ItemId } from "./art"

const still = { dir: 0 as const, targetX: null }

function drop(s: GameState, kind: ItemId, x = s.playerX) {
  s.items.push({ id: s.nextId++, kind, x, y: PLAYER_Y - 50, vy: 100, spin: 0 })
  s.spawnIn = 999
}

describe("game core", () => {
  it("catching a marshmallow scores a point and builds combo", () => {
    const s = newGame()
    drop(s, "marsh")
    const ev = step(s, 0.1, still)
    expect(ev).toContainEqual(expect.objectContaining({ type: "catch", kind: "marsh", points: 1 }))
    expect(s.score).toBe(1)
    expect(s.combo).toBe(1)
  })

  it("burnt marshmallows cost a life and reset the combo", () => {
    const s = newGame()
    s.combo = 5
    drop(s, "burntMarsh")
    step(s, 0.1, still)
    expect(s.lives).toBe(MAX_LIVES - 1)
    expect(s.combo).toBe(0)
  })

  it("items far from the basket are not caught and missing breaks combo", () => {
    const s = newGame()
    s.combo = 3
    s.items.push({ id: 1, kind: "marsh", x: 20, y: 700, vy: 100, spin: 0 })
    s.playerX = 400
    s.spawnIn = 999
    step(s, 0.1, still)
    expect(s.score).toBe(0)
    expect(s.combo).toBe(0)
  })

  it("BOBO doubles later catches for a while", () => {
    const s = newGame()
    drop(s, "boboHelper")
    step(s, 0.1, still)
    expect(s.boboLeft).toBeCloseTo(BOBO_SECONDS)
    drop(s, "golden")
    step(s, 0.1, still)
    expect(s.score).toBe(2 + 10)
  })

  it("combo multiplier caps at 3", () => {
    expect(comboMultiplier(0)).toBe(1)
    expect(comboMultiplier(8)).toBe(2)
    expect(comboMultiplier(100)).toBe(3)
  })

  it("never spawns a second BOBO while one is active", () => {
    const s = newGame()
    s.boboLeft = 3
    for (let r = 0; r < 1; r += 0.01) expect(pickKind(s, r)).not.toBe("boboHelper")
  })

  it("ends when time or lives run out", () => {
    const s = newGame()
    s.spawnIn = 999
    const ev = step(s, 61, still)
    expect(s.over).toBe(true)
    expect(ev).toContainEqual({ type: "end", reason: "time" })

    const t = newGame()
    t.lives = 1
    drop(t, "burntMarsh")
    expect(step(t, 0.1, still)).toContainEqual({ type: "end", reason: "lives" })
  })

  it("player stays inside the field", () => {
    const s = newGame()
    s.spawnIn = 999
    for (let i = 0; i < 50; i++) step(s, 0.1, { dir: -1, targetX: null })
    expect(s.playerX).toBeGreaterThan(0)
  })

  it("ranks by score", () => {
    expect(rankFor(0).title).toBe("棉花糖見習生")
    expect(rankFor(95).title).toBe("棉花糖獵人")
    expect(rankFor(999).title).toBe("傳說中的棉花糖王")
  })
})
