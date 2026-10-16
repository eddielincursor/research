import type { ItemId } from "./art"

export const W = 480
export const H = 640
export const ROUND_SECONDS = 60
export const PLAYER_Y = H - 78
export const PLAYER_HALF = 46
export const ITEM_R = 26
export const BOBO_SECONDS = 6
export const MAX_LIVES = 3

export type Item = { id: number; kind: ItemId; x: number; y: number; vy: number; spin: number }

export type GameEvent =
  | { type: "catch"; kind: ItemId; x: number; y: number; points: number }
  | { type: "hit"; x: number; y: number }
  | { type: "miss"; kind: ItemId }
  | { type: "end"; reason: "time" | "lives" }

export type GameState = {
  time: number
  score: number
  lives: number
  combo: number
  bestCombo: number
  boboLeft: number
  playerX: number
  items: Item[]
  spawnIn: number
  nextId: number
  over: boolean
  caught: Record<ItemId, number>
}

export type Input = { dir: -1 | 0 | 1; targetX: number | null }

export const POINTS: Record<ItemId, number> = { marsh: 1, donut: 3, golden: 5, burntMarsh: 0, boboHelper: 2 }

export function newGame(): GameState {
  return {
    time: ROUND_SECONDS,
    score: 0,
    lives: MAX_LIVES,
    combo: 0,
    bestCombo: 0,
    boboLeft: 0,
    playerX: W / 2,
    items: [],
    spawnIn: 0.6,
    nextId: 1,
    over: false,
    caught: { marsh: 0, donut: 0, golden: 0, burntMarsh: 0, boboHelper: 0 },
  }
}

/** 0 at the start of a round, 1 at the end. */
export function difficulty(s: GameState): number {
  return Math.min(1, Math.max(0, (ROUND_SECONDS - s.time) / ROUND_SECONDS))
}

export function comboMultiplier(combo: number): number {
  return Math.min(3, 1 + Math.floor(combo / 8))
}

export function pickKind(s: GameState, r: number): ItemId {
  const d = difficulty(s)
  const weights: [ItemId, number][] = [
    ["marsh", 58],
    ["burntMarsh", 14 + d * 16],
    ["donut", 12],
    ["golden", 4],
    ["boboHelper", s.boboLeft > 0 || s.items.some((i) => i.kind === "boboHelper") ? 0 : 4],
  ]
  const total = weights.reduce((a, [, w]) => a + w, 0)
  let acc = r * total
  for (const [k, w] of weights) {
    if (acc < w) return k
    acc -= w
  }
  return "marsh"
}

export function step(s: GameState, dt: number, input: Input, rand: () => number = Math.random): GameEvent[] {
  if (s.over) return []
  const events: GameEvent[] = []
  const d = difficulty(s)

  s.time = Math.max(0, s.time - dt)
  s.boboLeft = Math.max(0, s.boboLeft - dt)

  const speed = 440
  if (input.targetX !== null) {
    const delta = input.targetX - s.playerX
    s.playerX += Math.sign(delta) * Math.min(Math.abs(delta), speed * 1.6 * dt)
  } else {
    s.playerX += input.dir * speed * dt
  }
  s.playerX = Math.min(W - PLAYER_HALF, Math.max(PLAYER_HALF, s.playerX))

  s.spawnIn -= dt
  if (s.spawnIn <= 0) {
    const kind = pickKind(s, rand())
    s.items.push({
      id: s.nextId++,
      kind,
      x: ITEM_R + rand() * (W - ITEM_R * 2),
      y: -ITEM_R,
      vy: (150 + d * 230) * (kind === "golden" ? 1.25 : 1) * (0.85 + rand() * 0.3),
      spin: (rand() - 0.5) * 2,
    })
    s.spawnIn = 0.85 - d * 0.47
  }

  const keep: Item[] = []
  for (const it of s.items) {
    it.y += it.vy * dt
    const inBasket =
      it.y + ITEM_R >= PLAYER_Y - 18 && it.y - ITEM_R <= PLAYER_Y + 10 && Math.abs(it.x - s.playerX) <= PLAYER_HALF + ITEM_R * 0.4
    if (inBasket) {
      s.caught[it.kind]++
      if (it.kind === "burntMarsh") {
        s.lives--
        s.combo = 0
        events.push({ type: "hit", x: it.x, y: it.y })
      } else {
        s.combo++
        s.bestCombo = Math.max(s.bestCombo, s.combo)
        if (it.kind === "boboHelper") s.boboLeft = BOBO_SECONDS
        const pts = POINTS[it.kind] * comboMultiplier(s.combo) * (s.boboLeft > 0 && it.kind !== "boboHelper" ? 2 : 1)
        s.score += pts
        events.push({ type: "catch", kind: it.kind, x: it.x, y: it.y, points: pts })
      }
      continue
    }
    if (it.y - ITEM_R > H) {
      if (it.kind !== "burntMarsh") {
        s.combo = 0
        events.push({ type: "miss", kind: it.kind })
      }
      continue
    }
    keep.push(it)
  }
  s.items = keep

  if (s.lives <= 0) {
    s.over = true
    events.push({ type: "end", reason: "lives" })
  } else if (s.time <= 0) {
    s.over = true
    events.push({ type: "end", reason: "time" })
  }
  return events
}

export type Rank = { min: number; title: string; by: string; line: string }

export const RANKS: Rank[] = [
  { min: 0, title: "棉花糖見習生", by: "Grandpa Quokka", line: "我年輕時第一次也只撿到一顆，後來就環遊世界了。" },
  { min: 40, title: "Marshville 新住民", by: "Mama Quokka", line: "撿這麼多，晚餐我再多煮一鍋！" },
  { min: 90, title: "棉花糖獵人", by: "Hatty", line: "我算過了，你的接法很有效率。" },
  { min: 160, title: "Mr. Burnt 的得意助手", by: "Mr. Burnt", line: "這個速度，可以拿來測試我的新機器了。" },
  { min: 250, title: "傳說中的棉花糖王", by: "Quokka", line: "世界上最好吃的棉花糖，一定就在你的籃子裡！" },
]

export function rankFor(score: number): Rank {
  let r = RANKS[0]
  for (const k of RANKS) if (score >= k.min) r = k
  return r
}
