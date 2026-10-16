import "./style.css"
import { METHODS, allocate, compact, grow, money, recommend, type YearPoint } from "./calc"

type State = {
  income: number
  essentials: number
  method: string
  monthly: number
  linked: boolean
  initial: number
  rate: number
  years: number
}

const state: State = {
  income: 50000,
  essentials: 30000,
  method: "631",
  monthly: 15000,
  linked: true,
  initial: 0,
  rate: 6,
  years: 20,
}

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T

const inputs = {
  income: $<HTMLInputElement>("income"),
  essentials: $<HTMLInputElement>("essentials"),
  monthly: $<HTMLInputElement>("monthly"),
  initial: $<HTMLInputElement>("initial"),
  rate: $<HTMLInputElement>("rate"),
  years: $<HTMLInputElement>("years"),
}
const rateRange = $<HTMLInputElement>("rate-range")
const yearsRange = $<HTMLInputElement>("years-range")

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function parseAmount(text: string): number {
  const n = Number(text.replace(/[^\d]/g, ""))
  return Number.isFinite(n) ? clamp(n, 0, 1e10) : 0
}

function parseDecimal(text: string): number {
  const n = Number(text.replace(/[^\d.]/g, ""))
  return Number.isFinite(n) ? n : 0
}

function readHash() {
  const p = new URLSearchParams(location.hash.slice(1))
  const num = (k: string) => (p.has(k) ? Number(p.get(k)) : NaN)
  if (Number.isFinite(num("i"))) state.income = clamp(num("i"), 0, 1e10)
  if (Number.isFinite(num("e"))) state.essentials = clamp(num("e"), 0, 1e10)
  const m = p.get("m")
  if (m && METHODS.some((x) => x.id === m)) state.method = m
  if (Number.isFinite(num("mo"))) {
    state.monthly = clamp(num("mo"), 0, 1e10)
    state.linked = false
  }
  if (Number.isFinite(num("in"))) state.initial = clamp(num("in"), 0, 1e10)
  if (Number.isFinite(num("r"))) state.rate = clamp(num("r"), 0, 30)
  if (Number.isFinite(num("y"))) state.years = clamp(Math.round(num("y")), 1, 60)
}

function writeHash() {
  const p = new URLSearchParams({
    i: String(state.income),
    e: String(state.essentials),
    m: state.method,
  })
  if (!state.linked) p.set("mo", String(state.monthly))
  if (state.initial) p.set("in", String(state.initial))
  p.set("r", String(state.rate))
  p.set("y", String(state.years))
  history.replaceState(null, "", `#${p}`)
}

function currentMethod() {
  return METHODS.find((m) => m.id === state.method) ?? METHODS[0]
}

const methodButtons = METHODS.map((m) => {
  const b = document.createElement("button")
  b.type = "button"
  b.setAttribute("role", "radio")
  b.className = "method"
  b.innerHTML = `<b>${m.name}</b><span>${m.ratio}</span><i class="badge" hidden>建議</i>`
  b.addEventListener("click", () => {
    state.method = m.id
    update()
  })
  $("methods").append(b)
  return b
})

function renderMethods(rec: string | null) {
  METHODS.forEach((m, i) => {
    const b = methodButtons[i]
    const on = m.id === state.method
    b.setAttribute("aria-checked", String(on))
    b.tabIndex = on ? 0 : -1
    b.querySelector<HTMLElement>(".badge")!.hidden = rec !== m.id
  })
}

$("methods").addEventListener("keydown", (e) => {
  const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
  if (!dir) return
  e.preventDefault()
  const i = METHODS.findIndex((m) => m.id === state.method)
  const next = (i + dir + METHODS.length) % METHODS.length
  state.method = METHODS[next].id
  update()
  methodButtons[next].focus()
})

function renderBudget() {
  const rec = recommend(state.income, state.essentials)
  renderMethods(rec)

  const note = $("recommend")
  if (rec === null) {
    note.hidden = true
  } else {
    const pct = Math.round((state.essentials / state.income) * 100)
    note.hidden = false
    note.textContent =
      rec === "over"
        ? `必要支出佔收入 ${pct}%，超過七成。任何比例都很難套，建議先減少固定開銷或增加收入。`
        : `必要支出佔收入 ${pct}%，教學建議從 ${METHODS.find((m) => m.id === rec)?.name} 開始。`
  }

  const shares = allocate(state.income, currentMethod().buckets)
  const bar = $("bar")
  bar.innerHTML = shares
    .map((s) => `<span style="flex:${s.share};background:${s.color}"></span>`)
    .join("")
  if (state.essentials > 0 && state.income > 0) {
    const at = clamp(state.essentials / state.income, 0, 1) * 100
    bar.insertAdjacentHTML("beforeend", `<em class="marker" style="left:${at}%"></em>`)
  }

  $("buckets").innerHTML = shares
    .map(
      (s) => `<li>
        <i style="background:${s.color}"></i>
        <div><b>${s.label}</b><small>${s.hint}</small></div>
        <span class="pct">${(s.share * 100).toFixed(s.share * 100 % 1 ? 1 : 0)}%</span>
        <span class="amt">${money(s.monthly)}<small>一年 ${money(s.monthly * 12)}</small></span>
      </li>`,
    )
    .join("")

  const fit = $("fit")
  const living = shares.find((s) => s.living)
  if (living && state.essentials > 0) {
    const gap = living.monthly - state.essentials
    fit.hidden = false
    fit.className = `callout ${gap >= 0 ? "ok" : "bad"}`
    fit.textContent =
      gap === 0
        ? `生活費 ${money(living.monthly)} 剛好等於必要支出，沒有緩衝。`
        : gap > 0
        ? `生活費 ${money(living.monthly)} 夠付必要支出，還多 ${money(gap)}。`
        : `生活費 ${money(living.monthly)} 比必要支出少 ${money(-gap)}，這個分法目前撐不住。`
  } else {
    fit.hidden = true
  }

  return shares.find((s) => s.invest)?.monthly ?? 0
}

function renderInvest(investBucket: number) {
  if (state.linked) state.monthly = investBucket

  const link = $("monthly-link")
  link.innerHTML = state.linked
    ? `跟著分配表的「投資」那一格`
    : `<button type="button" id="relink">改回分配表的 ${money(investBucket)}</button>`
  $("relink")?.addEventListener("click", () => {
    state.linked = true
    update()
  })

  const pts = grow(state.initial, state.monthly, state.rate / 100, state.years)
  const last = pts[pts.length - 1]
  const gains = last.balance - last.contributed
  $("r-years").textContent = String(state.years)
  $("r-final").textContent = `NT$ ${money(last.balance)}`
  $("r-multiple").textContent =
    last.contributed > 0 ? `是投入本金的 ${(last.balance / last.contributed).toFixed(2)} 倍` : "還沒有投入金額"
  $("r-principal").textContent = money(last.contributed)
  $("r-gains").textContent = money(gains)

  const step = state.years <= 10 ? 1 : state.years <= 20 ? 5 : 10
  const rows = pts.filter((p) => p.year > 0 && (p.year % step === 0 || p.year === state.years))
  $("milestones").innerHTML = rows
    .map(
      (p) =>
        `<tr><td>${p.year}</td><td>${money(p.contributed)}</td><td>${money(p.balance - p.contributed)}</td><td><b>${money(p.balance)}</b></td></tr>`,
    )
    .join("")

  drawChart(pts)
}

let lastPoints: YearPoint[] = []

function niceMax(v: number) {
  if (v <= 0) return 1
  const exp = Math.pow(10, Math.floor(Math.log10(v)))
  const f = v / exp
  const nice = [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10].find((s) => f <= s) ?? 10
  return nice * exp
}

function drawChart(pts: YearPoint[]) {
  lastPoints = pts
  const host = $("chart")
  const W = Math.max(280, host.clientWidth)
  const H = W < 480 ? 220 : 260
  const pad = { l: 56, r: 12, t: 12, b: 28 }
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const maxY = niceMax(Math.max(...pts.map((p) => p.balance)))
  const n = pts.length - 1
  const x = (i: number) => pad.l + (n === 0 ? 0 : (i / n) * iw)
  const y = (v: number) => pad.t + ih - (v / maxY) * ih

  const line = (key: "contributed" | "balance") => pts.map((p, i) => `${x(i)},${y(p[key])}`).join(" ")
  const principalArea = `M${x(0)},${y(0)} L${line("contributed")} L${x(n)},${y(0)} Z`
  const gainsArea = `M${pts.map((p, i) => `${x(i)},${y(p.balance)}`).join(" L")} L${pts
    .map((_, i) => `${x(n - i)},${y(pts[n - i].contributed)}`)
    .join(" L")} Z`

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxY)
  const xStep = n <= 10 ? (W < 480 ? 2 : 1) : n <= 20 ? 5 : 10
  const xTicks = pts.filter((p) => p.year % xStep === 0 && p.year > 0)

  const cross = pts.find((p) => p.balance - p.contributed > p.contributed && p.year > 0)

  host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="本金與累積報酬逐年變化">
    ${ticks
      .map(
        (t) =>
          `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(t)}" y2="${y(t)}" class="grid-line"/>
           <text x="${pad.l - 8}" y="${y(t) + 4}" text-anchor="end">${compact(t)}</text>`,
      )
      .join("")}
    <path d="${principalArea}" fill="var(--principal)" fill-opacity=".85"/>
    <path d="${gainsArea}" fill="var(--gains)" fill-opacity=".8"/>
    <polyline points="${line("balance")}" fill="none" stroke="var(--gains)" stroke-width="2"/>
    ${xTicks.map((p) => `<text x="${x(p.year)}" y="${H - 8}" text-anchor="middle">${p.year}年</text>`).join("")}
    ${
      cross
        ? `<line x1="${x(cross.year)}" x2="${x(cross.year)}" y1="${pad.t}" y2="${pad.t + ih}" class="cross"/>
           <text x="${x(cross.year) + (x(cross.year) > W - 120 ? -6 : 6)}" y="${pad.t + 12}" text-anchor="${
             x(cross.year) > W - 120 ? "end" : "start"
           }" class="cross-label">第 ${cross.year} 年報酬超過本金</text>`
        : ""
    }
  </svg>`
}

function syncInputs(skip?: HTMLInputElement) {
  const set = (el: HTMLInputElement, v: string) => {
    if (el !== skip) el.value = v
  }
  set(inputs.income, money(state.income))
  set(inputs.essentials, state.essentials ? money(state.essentials) : "")
  set(inputs.monthly, money(state.monthly))
  set(inputs.initial, state.initial ? money(state.initial) : "")
  set(inputs.rate, String(state.rate))
  set(inputs.years, String(state.years))
  rateRange.value = String(state.rate)
  yearsRange.value = String(state.years)
  document.querySelectorAll<HTMLButtonElement>("#rate-presets button").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.rate) === state.rate))
  })
}

function update(skip?: HTMLInputElement) {
  const investBucket = renderBudget()
  renderInvest(investBucket)
  syncInputs(skip)
  writeHash()
}

function bindAmount(el: HTMLInputElement, apply: (n: number) => void) {
  el.addEventListener("input", () => {
    apply(parseAmount(el.value))
    update(el)
  })
  el.addEventListener("blur", () => syncInputs())
  el.addEventListener("focus", () => el.select())
}

bindAmount(inputs.income, (n) => (state.income = n))
bindAmount(inputs.essentials, (n) => (state.essentials = n))
bindAmount(inputs.initial, (n) => (state.initial = n))
bindAmount(inputs.monthly, (n) => {
  state.monthly = n
  state.linked = false
})

inputs.rate.addEventListener("input", () => {
  state.rate = clamp(parseDecimal(inputs.rate.value), 0, 30)
  update(inputs.rate)
})
inputs.rate.addEventListener("blur", () => syncInputs())
inputs.years.addEventListener("input", () => {
  state.years = clamp(Math.round(parseDecimal(inputs.years.value)) || 1, 1, 60)
  update(inputs.years)
})
inputs.years.addEventListener("blur", () => syncInputs())
rateRange.addEventListener("input", () => {
  state.rate = Number(rateRange.value)
  update()
})
yearsRange.addEventListener("input", () => {
  state.years = Number(yearsRange.value)
  update()
})
document.querySelectorAll<HTMLButtonElement>("#rate-presets button").forEach((b) =>
  b.addEventListener("click", () => {
    state.rate = Number(b.dataset.rate)
    update()
  }),
)

let resizeTimer = 0
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => drawChart(lastPoints), 120)
})

readHash()
update()
