import { artSvgStandalone, itemSvg, svg, svgImage, type ItemId } from "./art"
import {
  BOBO_SECONDS,
  H,
  ITEM_R,
  MAX_LIVES,
  PLAYER_Y,
  ROUND_SECONDS,
  W,
  comboMultiplier,
  newGame,
  rankFor,
  step,
  type GameState,
  type Input,
} from "./game-core"

const BEST_KEY = "dinotaeng-marsh-best"

type Popup = { x: number; y: number; text: string; color: string; life: number }

const ITEM_IDS: ItemId[] = ["marsh", "golden", "burntMarsh", "donut", "boboHelper"]

export function mountGame() {
  const canvas = document.getElementById("game-canvas") as HTMLCanvasElement
  const overlay = document.getElementById("game-overlay")!
  const scoreEl = document.getElementById("hud-score")!
  const bestEl = document.getElementById("hud-best")!
  const timeEl = document.getElementById("hud-time")!
  const livesEl = document.getElementById("hud-lives")!
  const statusEl = document.getElementById("hud-status")!
  const pauseBtn = document.getElementById("game-pause") as HTMLButtonElement
  const ctx = canvas.getContext("2d")!

  const dpr = Math.min(2, window.devicePixelRatio || 1)
  canvas.width = W * dpr
  canvas.height = H * dpr
  ctx.scale(dpr, dpr)

  const sprites = Object.fromEntries(ITEM_IDS.map((k) => [k, svgImage(itemSvg(k))])) as Record<ItemId, HTMLImageElement>
  const player = svgImage(artSvgStandalone("quokka"))
  const boboBuddy = svgImage(artSvgStandalone("bobo"))

  let best = Number(localStorage.getItem(BEST_KEY)) || 0
  let s: GameState = newGame()
  let running = false
  let paused = false
  let last = 0
  let clock = 0
  let shake = 0
  let popups: Popup[] = []
  const keys = new Set<string>()
  let pointerX: number | null = null
  const held = { left: false, right: false }

  bestEl.textContent = String(best)

  const clouds = [
    { x: 60, y: 90, s: 1 },
    { x: 300, y: 150, s: 0.7 },
    { x: 420, y: 60, s: 0.9 },
  ]

  function input(): Input {
    const left = keys.has("ArrowLeft") || keys.has("a") || keys.has("A") || held.left
    const right = keys.has("ArrowRight") || keys.has("d") || keys.has("D") || held.right
    const dir = left === right ? 0 : left ? -1 : 1
    return { dir, targetX: dir === 0 ? pointerX : null }
  }

  function hud() {
    scoreEl.textContent = String(s.score)
    timeEl.textContent = String(Math.ceil(s.time))
    livesEl.innerHTML = Array.from({ length: MAX_LIVES }, (_, i) => `<i class="${i < s.lives ? "on" : ""}"></i>`).join("")
    livesEl.setAttribute("aria-label", `剩下 ${s.lives} 顆愛心`)
    const parts: string[] = []
    if (s.boboLeft > 0) parts.push(`BOBO 幫忙中，分數 ×2（${Math.ceil(s.boboLeft)} 秒）`)
    const m = comboMultiplier(s.combo)
    if (s.combo >= 3) parts.push(`連續接到 ${s.combo} 個${m > 1 ? `，倍率 ×${m}` : ""}`)
    statusEl.textContent = parts.join("・") || "用左右鍵、拖曳或下方按鈕移動"
  }

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, "#cfe8ff")
    g.addColorStop(0.65, "#fff1e2")
    g.addColorStop(1, "#ffe6d2")
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = "#fff4b8"
    ctx.beginPath()
    ctx.arc(400, 70, 34, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "rgba(255,255,255,.9)"
    for (const c of clouds) {
      const x = ((c.x + clock * 12 * c.s) % (W + 160)) - 80
      ctx.beginPath()
      ctx.ellipse(x, c.y, 46 * c.s, 18 * c.s, 0, 0, Math.PI * 2)
      ctx.ellipse(x + 26 * c.s, c.y - 12 * c.s, 28 * c.s, 18 * c.s, 0, 0, Math.PI * 2)
      ctx.ellipse(x - 24 * c.s, c.y - 6 * c.s, 22 * c.s, 14 * c.s, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = "#c8e6b8"
    ctx.beginPath()
    ctx.moveTo(0, H - 120)
    ctx.quadraticCurveTo(120, H - 170, 240, H - 120)
    ctx.quadraticCurveTo(360, H - 80, W, H - 140)
    ctx.lineTo(W, H)
    ctx.lineTo(0, H)
    ctx.fill()
    ctx.fillStyle = "#a9d69a"
    ctx.fillRect(0, H - 40, W, 40)
  }

  function drawPlayer() {
    const x = s.playerX
    if (s.boboLeft > 0) {
      ctx.save()
      ctx.globalAlpha = 0.35 + 0.15 * Math.sin(clock * 8)
      ctx.fillStyle = "#e6d4f2"
      ctx.beginPath()
      ctx.ellipse(x, PLAYER_Y, 70, 22, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
      if (boboBuddy.complete) ctx.drawImage(boboBuddy, x + 46, PLAYER_Y - 58 + Math.sin(clock * 6) * 4, 46, 47)
    }
    if (player.complete) ctx.drawImage(player, x - 44, PLAYER_Y - 96, 88, 91)

    ctx.fillStyle = "#c98b4f"
    ctx.strokeStyle = "#8e5a2e"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(x - 50, PLAYER_Y - 22, 100, 34, [6, 6, 16, 16])
    ctx.fill()
    ctx.stroke()
    ctx.strokeStyle = "rgba(142,90,46,.55)"
    ctx.lineWidth = 2
    for (let i = -36; i <= 36; i += 12) {
      ctx.beginPath()
      ctx.moveTo(x + i, PLAYER_Y - 18)
      ctx.lineTo(x + i, PLAYER_Y + 8)
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(x - 48, PLAYER_Y - 6)
    ctx.lineTo(x + 48, PLAYER_Y - 6)
    ctx.stroke()
  }

  function drawItems() {
    for (const it of s.items) {
      const img = sprites[it.kind]
      if (!img.complete) continue
      ctx.save()
      ctx.translate(it.x, it.y)
      ctx.rotate(Math.sin(clock * 3 + it.id) * 0.25 * it.spin)
      const size = ITEM_R * 2.3
      ctx.drawImage(img, -size / 2, -size / 2, size, size * 1.03)
      ctx.restore()
    }
  }

  function drawPopups(dt: number) {
    popups = popups.filter((p) => (p.life -= dt) > 0)
    ctx.textAlign = "center"
    ctx.font = "800 22px 'Noto Sans TC', 'PingFang TC', sans-serif"
    for (const p of popups) {
      ctx.globalAlpha = Math.min(1, p.life / 0.4)
      ctx.lineWidth = 5
      ctx.strokeStyle = "#fff"
      const y = p.y - (0.9 - p.life) * 50
      ctx.strokeText(p.text, p.x, y)
      ctx.fillStyle = p.color
      ctx.fillText(p.text, p.x, y)
    }
    ctx.globalAlpha = 1
  }

  function frame(now: number) {
    if (!running) return
    const dt = Math.min(0.05, (now - last) / 1000 || 0)
    last = now
    if (!paused) {
      clock += dt
      const events = step(s, dt, input())
      for (const e of events) {
        if (e.type === "catch") {
          const color = e.kind === "golden" ? "#e0a100" : e.kind === "donut" ? "#e2588f" : e.kind === "boboHelper" ? "#9b6fc0" : "#e98b5a"
          popups.push({ x: e.x, y: PLAYER_Y - 40, text: e.kind === "boboHelper" ? "BOBO 來幫忙！" : `+${e.points}`, color, life: 0.9 })
        } else if (e.type === "hit") {
          shake = 0.35
          popups.push({ x: e.x, y: PLAYER_Y - 40, text: "好燙！", color: "#c0392b", life: 0.9 })
        } else if (e.type === "end") {
          finish(e.reason)
        }
      }
      shake = Math.max(0, shake - dt)
      hud()
    }

    ctx.save()
    if (shake > 0) ctx.translate((Math.random() - 0.5) * 12 * shake * 3, (Math.random() - 0.5) * 8 * shake * 3)
    drawBackground()
    drawItems()
    drawPlayer()
    drawPopups(paused ? 0 : dt)
    if (shake > 0) {
      ctx.fillStyle = `rgba(231,76,60,${shake * 0.5})`
      ctx.fillRect(0, 0, W, H)
    }
    ctx.restore()
    if (running) requestAnimationFrame(frame)
  }

  function showStart() {
    overlay.hidden = false
    overlay.innerHTML = `
      <div class="ov-card">
        <div class="ov-art">${svg("quokka")}${svg("marsh")}</div>
        <h3>棉花糖接接樂</h3>
        <p>幫 Quokka 在 ${ROUND_SECONDS} 秒內接住最多棉花糖！</p>
        <ul class="legend">
          <li><img src="${sprites.marsh.src}" alt="" />棉花糖 +1</li>
          <li><img src="${sprites.donut.src}" alt="" />爸爸的甜甜圈 +3</li>
          <li><img src="${sprites.golden.src}" alt="" />金色棉花糖 +5</li>
          <li><img src="${sprites.boboHelper.src}" alt="" />BOBO：${BOBO_SECONDS} 秒分數 ×2</li>
          <li class="bad"><img src="${sprites.burntMarsh.src}" alt="" />烤焦棉花糖：扣一顆愛心</li>
        </ul>
        <p class="ov-hint">電腦用 ← → 或 A D；手機直接在畫面上左右拖曳。連續接到 8 個以上，分數倍率會上升。</p>
        <button type="button" class="btn primary" data-act="start">開始遊戲</button>
      </div>`
  }

  function finish(reason: "time" | "lives") {
    running = false
    pauseBtn.disabled = true
    const isBest = s.score > best
    if (isBest) {
      best = s.score
      localStorage.setItem(BEST_KEY, String(best))
      bestEl.textContent = String(best)
    }
    const rank = rankFor(s.score)
    overlay.hidden = false
    overlay.innerHTML = `
      <div class="ov-card" role="status">
        <p class="ov-eyebrow">${reason === "time" ? "時間到！" : "愛心用完了…"}</p>
        <h3>${s.score} 分${isBest ? `<span class="new-best">新紀錄</span>` : ""}</h3>
        <p class="rank">你的稱號：<b>${rank.title}</b></p>
        <blockquote>「${rank.line}」<cite>— ${rank.by}</cite></blockquote>
        <dl class="tally">
          <div><dt>棉花糖</dt><dd>${s.caught.marsh}</dd></div>
          <div><dt>甜甜圈</dt><dd>${s.caught.donut}</dd></div>
          <div><dt>金色</dt><dd>${s.caught.golden}</dd></div>
          <div><dt>最長連續</dt><dd>${s.bestCombo}</dd></div>
        </dl>
        <button type="button" class="btn primary" data-act="start">再玩一次</button>
      </div>`
    overlay.querySelector<HTMLButtonElement>("[data-act=start]")?.focus()
  }

  function start() {
    s = newGame()
    popups = []
    shake = 0
    paused = false
    running = true
    overlay.hidden = true
    pauseBtn.disabled = false
    pauseBtn.textContent = "暫停"
    pauseBtn.setAttribute("aria-pressed", "false")
    hud()
    last = performance.now()
    requestAnimationFrame(frame)
    canvas.focus({ preventScroll: true })
  }

  function setPaused(p: boolean) {
    if (!running) return
    paused = p
    pauseBtn.textContent = p ? "繼續" : "暫停"
    pauseBtn.setAttribute("aria-pressed", String(p))
    statusEl.textContent = p ? "已暫停" : statusEl.textContent
  }

  overlay.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("[data-act=start]")) start()
  })
  pauseBtn.addEventListener("click", () => setPaused(!paused))

  const toLogical = (clientX: number) => {
    const r = canvas.getBoundingClientRect()
    return ((clientX - r.left) / r.width) * W
  }
  canvas.addEventListener("pointerdown", (e) => {
    pointerX = toLogical(e.clientX)
    canvas.setPointerCapture(e.pointerId)
  })
  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse" || e.buttons) pointerX = toLogical(e.clientX)
  })
  canvas.addEventListener("pointerup", (e) => {
    if (e.pointerType !== "mouse") pointerX = null
  })
  canvas.addEventListener("pointerleave", () => (pointerX = null))

  const gameRoot = document.getElementById("game")!
  window.addEventListener("keydown", (e) => {
    if (!running) return
    if (["ArrowLeft", "ArrowRight"].includes(e.key) && gameRoot.contains(document.activeElement)) e.preventDefault()
    if (e.key === "p" || e.key === "P" || e.key === "Escape") setPaused(!paused)
    keys.add(e.key)
    pointerX = null
  })
  window.addEventListener("keyup", (e) => keys.delete(e.key))

  for (const [id, side] of [
    ["move-left", "left"],
    ["move-right", "right"],
  ] as const) {
    const b = document.getElementById(id)!
    const on = (e: Event) => {
      e.preventDefault()
      held[side] = true
      pointerX = null
    }
    const off = () => (held[side] = false)
    b.addEventListener("pointerdown", on)
    b.addEventListener("pointerup", off)
    b.addEventListener("pointerleave", off)
    b.addEventListener("pointercancel", off)
    b.addEventListener("contextmenu", (e) => e.preventDefault())
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) setPaused(true)
  })

  hud()
  pauseBtn.disabled = true
  const first = () => {
    drawBackground()
    drawPlayer()
  }
  player.addEventListener("load", first)
  first()
  showStart()
}
