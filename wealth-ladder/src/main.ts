import "./style.css"
import {
  LEVELS,
  carefreeDifference,
  clamp,
  compact,
  duration,
  levelOf,
  money,
  monthsToTarget,
  progressInLevel,
  project,
  requiredMonthly,
  spendExample,
  totals,
  type Assets,
  type Debts,
  type Level,
} from "./calc"

type Basis = "total" | "liquid"

type State = {
  assets: Assets
  debts: Debts
  basis: Basis
  fx: number
  monthly: number
  rate: number
  years: number
  expenses: number
}

type FieldDef<K extends string> = { key: K; label: string; hint: string; param: string }

const ASSET_FIELDS: FieldDef<keyof Assets>[] = [
  { key: "cash", label: "現金與存款", hint: "活存、定存、外幣存款", param: "c" },
  { key: "invest", label: "股票、基金、ETF", hint: "證券戶目前市值", param: "i" },
  { key: "retirement", label: "退休帳戶", hint: "勞退自提、年金等短期不能動用的錢", param: "r" },
  { key: "home", label: "自住房市值", hint: "估計現在賣得掉的價格", param: "h" },
  { key: "property", label: "其他不動產", hint: "出租房、土地、車位", param: "p" },
  { key: "other", label: "車子與其他資產", hint: "車、保單解約金、借給別人的錢", param: "o" },
]

const DEBT_FIELDS: FieldDef<keyof Debts>[] = [
  { key: "mortgage", label: "房貸餘額", hint: "還沒還完的本金", param: "m" },
  { key: "highInterest", label: "卡債與信貸", hint: "循環利息、信用貸款等高利負債", param: "hi" },
  { key: "loans", label: "車貸與學貸", hint: "其他分期貸款", param: "l" },
  { key: "otherDebt", label: "其他負債", hint: "親友借款、無息分期", param: "od" },
]

const DEFAULT_STATE: State = {
  assets: { cash: 200_000, invest: 350_000, retirement: 150_000, home: 0, property: 0, other: 300_000 },
  debts: { mortgage: 0, highInterest: 0, loans: 250_000, otherDebt: 0 },
  basis: "total",
  fx: 32,
  monthly: 15_000,
  rate: 6,
  years: 10,
  expenses: 30_000,
}

const EXAMPLE_STATE: State = {
  assets: { cash: 180_000, invest: 250_000, retirement: 0, home: 12_000_000, property: 0, other: 0 },
  debts: { mortgage: 7_600_000, highInterest: 200_000, loans: 0, otherDebt: 0 },
  basis: "total",
  fx: 32,
  monthly: 20_000,
  rate: 6,
  years: 10,
  expenses: 35_000,
}

const state: State = structuredClone(DEFAULT_STATE)

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T

const amountInputs = new Map<string, HTMLInputElement>()

function parseAmount(text: string): number {
  const n = Number(text.replace(/[^\d]/g, ""))
  return Number.isFinite(n) ? clamp(n, 0, 1e13) : 0
}

function parseDecimal(text: string): number {
  const n = Number(text.replace(/[^\d.]/g, ""))
  return Number.isFinite(n) ? n : 0
}

function buildFields() {
  const make = (host: HTMLElement, id: string, label: string, hint: string) => {
    const wrap = document.createElement("label")
    wrap.className = "field"
    wrap.innerHTML = `<span>${label}</span>
      <span class="input"><em>NT$</em><input id="f-${id}" inputmode="numeric" autocomplete="off" placeholder="0" /></span>
      <small class="hint">${hint}</small>`
    host.append(wrap)
    const input = wrap.querySelector("input")!
    amountInputs.set(id, input)
    return input
  }
  for (const f of ASSET_FIELDS) {
    const input = make($("asset-fields"), f.key, f.label, f.hint)
    bindAmount(input, (n) => (state.assets[f.key] = n))
  }
  for (const f of DEBT_FIELDS) {
    const input = make($("debt-fields"), f.key, f.label, f.hint)
    bindAmount(input, (n) => (state.debts[f.key] = n))
  }
}

function bindAmount(el: HTMLInputElement, apply: (n: number) => void) {
  el.addEventListener("input", () => {
    apply(parseAmount(el.value))
    update(el)
  })
  el.addEventListener("blur", () => syncInputs())
  el.addEventListener("focus", () => el.select())
}

function readHash() {
  const p = new URLSearchParams(location.hash.slice(1))
  if (![...p.keys()].length) return
  const num = (k: string) => {
    const v = Number(p.get(k))
    return p.has(k) && Number.isFinite(v) ? v : 0
  }
  for (const f of ASSET_FIELDS) state.assets[f.key] = clamp(num(f.param), 0, 1e13)
  for (const f of DEBT_FIELDS) state.debts[f.key] = clamp(num(f.param), 0, 1e13)
  state.basis = p.get("b") === "liquid" ? "liquid" : "total"
  if (p.has("fx")) state.fx = clamp(num("fx"), 1, 1000) || 32
  state.monthly = clamp(num("mo"), 0, 1e10)
  if (p.has("rt")) state.rate = clamp(num("rt"), 0, 20)
  if (p.has("y")) state.years = clamp(Math.round(num("y")), 1, 60)
  state.expenses = clamp(num("ex"), 0, 1e10)
}

function writeHash() {
  const p = new URLSearchParams()
  for (const f of ASSET_FIELDS) if (state.assets[f.key]) p.set(f.param, String(state.assets[f.key]))
  for (const f of DEBT_FIELDS) if (state.debts[f.key]) p.set(f.param, String(state.debts[f.key]))
  if (state.basis === "liquid") p.set("b", "liquid")
  if (state.fx !== 32) p.set("fx", String(state.fx))
  p.set("mo", String(state.monthly))
  p.set("rt", String(state.rate))
  p.set("y", String(state.years))
  if (state.expenses) p.set("ex", String(state.expenses))
  history.replaceState(null, "", `#${p}`)
}

const twd = (usd: number) => usd * state.fx

function rangeText(level: Level): string {
  if (level.id === 1) return `NT$ ${compact(twd(level.maxUsd))} 以下`
  if (level.id === 6) return `NT$ ${compact(twd(level.minUsd))} 以上`
  return `NT$ ${compact(twd(level.minUsd))} – ${compact(twd(level.maxUsd))}`
}

function usdRangeText(level: Level): string {
  const f = (n: number) => (n >= 1e6 ? `${n / 1e6}M` : `${n / 1e3}k`)
  if (level.id === 1) return `< US$${f(level.maxUsd)}`
  if (level.id === 6) return `US$${f(level.minUsd)}+`
  return `US$${f(level.minUsd)} – ${f(level.maxUsd)}`
}

const basisName = (b: Basis) => (b === "total" ? "總淨值" : "流動淨值")

function renderSummary(t: ReturnType<typeof totals>) {
  const item = (label: string, value: number, cls = "", note = "") =>
    `<div class="sum ${cls}"><span>${label}</span><b>${value < 0 ? "−" : ""}NT$ ${money(Math.abs(value))}</b>${note ? `<small>${note}</small>` : ""}</div>`
  $("summary").innerHTML = [
    item("總資產", t.assets),
    item("總負債", t.debts),
    item("總淨值", t.netWorth, state.basis === "total" ? "active" : "", "資產 − 負債"),
    item("流動淨值", t.liquid, state.basis === "liquid" ? "active" : "", "現金＋投資 − 非房貸負債"),
  ].join("")
}

function renderBasis() {
  document.querySelectorAll<HTMLButtonElement>("#basis button").forEach((b) => {
    const on = b.dataset.basis === state.basis
    b.setAttribute("aria-checked", String(on))
    b.tabIndex = on ? 0 : -1
  })
  $("basis-hint").textContent =
    state.basis === "total"
      ? "包含自住房與退休帳戶，用來看長期站在哪一階。"
      : "只算馬上能動用的錢。決定消費與風險時比較保守，作者也建議參考這個數字。"
}

function renderResult(nw: number, level: Level, liquidLevel: Level, totalLevel: Level) {
  const nwUsd = nw / state.fx
  const progress = progressInLevel(nwUsd, level)
  const next = LEVELS[level.id] as Level | undefined
  const pct = Math.round(progress * 100)
  const stage = progress < 0.34 ? "剛進入這一階" : progress < 0.67 ? "這一階的中段" : "接近下一階"

  let gapHtml = `<p class="gap done">你已經在最高的一階。接下來的問題不是再多一個零，而是要留下什麼。</p>`
  if (next) {
    const target = twd(next.minUsd)
    const gap = target - nw
    const times = nw > 0 ? `，約是現在的 ${(target / nw).toFixed(target / nw >= 10 ? 0 : 1)} 倍` : ""
    gapHtml = `<div class="gap">
      <span>距離 Level ${next.id}「${next.freedom}」</span>
      <b>還差 NT$ ${money(gap)}</b>
      <small>門檻 NT$ ${compact(target)}${times}</small>
    </div>`
  }

  const other = state.basis === "total" ? liquidLevel : totalLevel
  const otherNote =
    other.id !== level.id
      ? `<p class="alt-note">改用${basisName(state.basis === "total" ? "liquid" : "total")}看，你在 <b>Level ${other.id}</b>（${other.freedom}）。兩個數字差很多時，代表資產大多卡在不能馬上動用的地方。</p>`
      : ""

  $("result").innerHTML = `
    <div class="result-head" style="--lv:${level.color}">
      <span class="lv-badge">Level ${level.id}</span>
      <span class="lv-range">${rangeText(level)}<small>${usdRangeText(level)}</small></span>
    </div>
    <h3 class="freedom" style="color:${level.color}">${level.freedom}</h3>
    <p class="feeling">${level.feeling}</p>
    <p class="basis-line">用來定位的${basisName(state.basis)}：<b>${nw < 0 ? "−" : ""}NT$ ${money(Math.abs(nw))}</b>（約 US$ ${money(Math.abs(nwUsd))}${nw < 0 ? "，為負" : ""}）</p>
    <div class="progress" role="img" aria-label="在這一階的位置約 ${pct}%">
      <div class="progress-track"><span style="width:${Math.max(2, pct)}%;background:${level.color}"></span></div>
      <div class="progress-labels">
        <span>${level.id === 1 ? "NT$ 0" : compact(twd(level.minUsd))}</span>
        <b>${level.id === 6 ? "最高階" : nw < 0 ? "淨值為負，先回到 0" : `${stage}（${pct}%）`}</b>
        <span>${level.id === 6 ? "" : compact(twd(level.maxUsd))}</span>
      </div>
      ${level.id > 1 && level.id < 6 ? `<small class="progress-note">Level 2 以上用對數刻度：每往上 10 倍才算走完一階，所以中段約是門檻的 3.16 倍。</small>` : ""}
    </div>
    ${gapHtml}
    ${otherNote}`
}

function renderLadder(level: Level) {
  $("ladder").innerHTML = [...LEVELS]
    .reverse()
    .map((l) => {
      const cls = l.id === level.id ? "current" : l.id < level.id ? "passed" : "future"
      return `<li class="rung ${cls}" style="--lv:${l.color}; --i:${l.id}">
        <span class="rung-badge">L${l.id}</span>
        <div class="rung-body">
          <b>${l.freedom}</b>
          <small>${rangeText(l)}</small>
        </div>
        <span class="rung-share" title="美國家戶約略分布">${l.usShare}</span>
        ${l.id === level.id ? `<span class="here">你在這裡</span>` : ""}
      </li>`
    })
    .join("")
}

function renderCarefree(nw: number, liquid: number) {
  const diff = carefreeDifference(nw)
  const liquidDiff = carefreeDifference(liquid)
  const extra =
    state.basis === "total" && Math.abs(diff - liquidDiff) > Math.max(30, diff * 0.3)
      ? `<p class="small">用流動淨值算比較保守：NT$ ${money(liquidDiff)}。房子不能賣一塊磁磚來付帳。</p>`
      : ""
  $("carefree").innerHTML = `
    <div class="cf-num">
      <span>0.01% 法則</span>
      <b>NT$ ${money(diff)}</b>
      <small>${basisName(state.basis)} × 0.01%</small>
    </div>
    <div class="cf-text">
      <p><b>一次消費決策裡，兩個選項之間多花的差額在 NT$ ${money(diff)} 以內，就不必花太多精神糾結。</b></p>
      <p>${spendExample(diff)}</p>
      <p class="small">它看的是「差額」不是總價，也不是每天都能多花的額度；買房、買車、轉職這類大決定，仍要回到預算慢慢算。</p>
      ${extra}
    </div>`
}

function renderStrategy(level: Level) {
  const next = LEVELS[level.id] as Level | undefined
  $("strategy-body").innerHTML = `
    <div class="mantra" style="--lv:${level.color}">
      <span>Level ${level.id} 的口訣</span>
      <b>「${level.mantra}」</b>
      <small>${level.mantraEn}</small>
    </div>
    <p class="focus">${level.focus}</p>
    <div class="grid two lists">
      <div class="list do"><h4>優先去做</h4><ul>${level.doList.map((s) => `<li>${s}</li>`).join("")}</ul></div>
      <div class="list avoid"><h4>這一階最容易踩的坑</h4><ul>${level.avoidList.map((s) => `<li>${s}</li>`).join("")}</ul></div>
    </div>
    <div class="example"><b>生活例子</b><p>${level.example}</p></div>
    ${
      next
        ? `<p class="next-preview">到了 Level ${next.id}，你會擁有<b style="color:${next.color}">「${next.freedom}」</b>：${next.feeling} 那一階的口訣會變成「${next.mantra}」——方法會換，這是書最核心的提醒。</p>`
        : ""
    }`
}

type Insight = { tone: "bad" | "warn" | "ok" | "info"; text: string }

function renderInsights(t: ReturnType<typeof totals>, level: Level, liquidLevel: Level, monthsToNext: number | null) {
  const out: Insight[] = []
  const { assets, debts } = state

  if (t.netWorth < 0) {
    out.push({ tone: "bad", text: `淨值為負 NT$ ${money(-t.netWorth)}。第一個目標不是 Level 2，而是先回到 0：停止新增負債、把每月現金流轉正。` })
  }
  if (debts.highInterest > 0) {
    out.push({
      tone: "bad",
      text: `你有 NT$ ${money(debts.highInterest)} 的卡債或信貸。高利負債的利息通常高過任何合理的投資報酬，先還它，是報酬最確定的「投資」。`,
    })
  }
  if (state.expenses > 0) {
    const months = assets.cash / state.expenses
    if (months < 1) {
      out.push({ tone: "bad", text: `現金只夠付 ${months.toFixed(1)} 個月必要開銷。先存到 1 個月的小緩衝，再慢慢補到 3–6 個月。` })
    } else if (months < 3) {
      out.push({ tone: "warn", text: `緊急預備金約 ${months.toFixed(1)} 個月，建議先補到 3 個月（NT$ ${money(state.expenses * 3)}）以上，再加大投資。` })
    } else {
      out.push({ tone: "ok", text: `緊急預備金約 ${months.toFixed(1)} 個月必要開銷，已經有基本的安全網。` })
    }
  } else {
    out.push({ tone: "info", text: "在第 4 步填入每月必要開銷，可以順便檢查緊急預備金夠不夠。" })
  }
  if (t.netWorth > 0 && t.homeEquity > 0 && t.homeEquity / t.netWorth > 0.6) {
    out.push({
      tone: "warn",
      text: `自住房淨值佔總淨值 ${Math.round((t.homeEquity / t.netWorth) * 100)}%。帳面位置會比生活感受高；用流動淨值看，你在 Level ${liquidLevel.id}（${liquidLevel.freedom}）。`,
    })
  }
  if (t.assets > 0) {
    const share = t.incomeProducing / t.assets
    const pct = Math.round(share * 100)
    if (level.id >= 2 && share < 0.3) {
      out.push({
        tone: "warn",
        text: `會產生收入的資產（投資、退休帳戶、出租不動產）只佔總資產 ${pct}%。書中提到，越往上爬，資產會從「花錢的東西」移到「會賺錢的東西」。`,
      })
    } else if (level.id >= 2) {
      out.push({ tone: "ok", text: `會產生收入的資產佔總資產 ${pct}%，錢已經有一部分在幫你工作。` })
    }
  }
  if (level.id < 6 && monthsToNext !== null && monthsToNext > 0 && progressInLevel(stateNw() / state.fx, level) > 0.85) {
    out.push({ tone: "ok", text: "你已經很接近下一階了。這時最容易讓生活水準提早升級，先讓自動投入照常跑。" })
  }
  if (level.id >= 4 && level.id < 6 && (monthsToNext === null || monthsToNext > 25 * 12)) {
    out.push({
      tone: "info",
      text: `照目前的投入，到下一階${monthsToNext === null ? "要 100 年以上" : `要 ${duration(monthsToNext)}`}。書中說這一階靠薪水儲蓄會變慢，要考慮換引擎（股權、事業），或安心停留在這一階。`,
    })
  }
  if (state.monthly === 0 && level.id < 6) {
    out.push({ tone: "info", text: "每月投入為 0 時，只能靠既有資產的報酬往上爬。即使每月固定投入一小筆，也會讓時間大幅縮短。" })
  }

  $("insights").innerHTML = out.map((i) => `<li class="${i.tone}">${i.text}</li>`).join("")
}

function stateNw(): number {
  const t = totals(state.assets, state.debts)
  return state.basis === "total" ? t.netWorth : t.liquid
}

const nowYear = new Date().getFullYear()

function renderPlan(nw: number, level: Level): number | null {
  const next = LEVELS[level.id] as Level | undefined
  const rate = state.rate / 100
  const stats = $("plan-stats")

  if (!next) {
    stats.innerHTML = `<div class="stat wide"><span>你已經在最高階</span><b>Level 6</b><small>接下來的功課是守成與影響力，不是時間表。</small></div>`
    drawChart(nw, null)
    renderMilestones(nw, level)
    return null
  }

  const target = twd(next.minUsd)
  const months = monthsToTarget(nw, state.monthly, rate, target)
  const need = requiredMonthly(nw, rate, target, state.years * 12)
  const faster = monthsToTarget(nw, state.monthly + 5000, rate, target)

  const paceText = months === null ? "100 年以上" : duration(months)
  const paceYear = months === null ? "照目前設定在百年內到不了" : `大約在 ${nowYear + Math.ceil(months / 12)} 年`

  const needDiff = need - state.monthly
  const needNote =
    need === 0
      ? "不用再投入，光靠現有資產的假設報酬就會到"
      : needDiff <= 0
        ? `目前每月 ${money(state.monthly)}，已經夠了`
        : `比目前每月多 NT$ ${money(needDiff)}`

  let fasterText = "每月多投入 5,000，可以更快到達。"
  if (months !== null && faster !== null && months > faster) {
    fasterText = `每月多投入 5,000，可以提早 ${duration(months - faster)}。`
  } else if (months === null && faster !== null) {
    fasterText = `每月多投入 5,000，約 ${duration(faster)} 就能到。`
  }

  stats.innerHTML = `
    <div class="stat wide" style="--lv:${next.color}">
      <span>照目前速度到 Level ${next.id}「${next.freedom}」</span>
      <b>${paceText}</b>
      <small>${paceYear}。${fasterText}</small>
    </div>
    <div class="stat">
      <span>想在 ${state.years} 年內到，每月要投入</span>
      <b>NT$ ${money(need)}</b>
      <small>${needNote}</small>
    </div>
    <div class="stat">
      <span>下一階門檻</span>
      <b>NT$ ${compact(target)}</b>
      <small>US$ ${money(next.minUsd)} × ${state.fx}</small>
    </div>`

  drawChart(nw, months)
  renderMilestones(nw, level)
  return months
}

function renderMilestones(nw: number, level: Level) {
  const rate = state.rate / 100
  const rows = LEVELS.filter((l) => l.id > level.id).map((l) => {
    const target = twd(l.minUsd)
    const m = monthsToTarget(nw, state.monthly, rate, target)
    return `<tr style="--lv:${l.color}">
      <td><span class="dot" style="background:${l.color}"></span>Level ${l.id} ${l.freedom}</td>
      <td>${compact(target)}</td>
      <td>${m === null ? "100 年以上" : duration(m)}</td>
      <td>${m === null ? "—" : nowYear + Math.ceil(m / 12)}</td>
    </tr>`
  })
  $("milestones").innerHTML = rows.length
    ? rows.join("")
    : `<tr><td colspan="4">你已經在最高階。</td></tr>`
}

let lastChart: { nw: number; months: number | null } = { nw: 0, months: null }

function drawChart(nw: number, monthsToNext: number | null) {
  lastChart = { nw, months: monthsToNext }
  const host = $("chart")
  const W = Math.max(300, host.clientWidth)
  const H = W < 520 ? 260 : 320
  const pad = { l: W < 520 ? 58 : 70, r: 14, t: 16, b: 30 }
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b

  const want = monthsToNext === null ? 30 : Math.ceil(monthsToNext / 12) + 5
  const horizon = clamp(Math.max(want, state.years), 10, 40)
  const rate = state.rate / 100
  const pts = project(nw, state.monthly, rate, horizon)
  const principal = pts.map((p) => ({ year: p.year, balance: nw + state.monthly * 12 * p.year }))

  const floor = 10 ** Math.floor(Math.log10(Math.max(nw * 0.5, 1e4)))
  const maxBal = Math.max(...pts.map((p) => p.balance), floor * 10)
  const level = levelOf(nw / state.fx)
  const nextMin = LEVELS[level.id] ? twd(LEVELS[level.id].minUsd) : maxBal
  const top = Math.max(maxBal, nextMin) * 1.6
  const lo = Math.log10(floor)
  const hi = Math.log10(top)
  const x = (year: number) => pad.l + (year / horizon) * iw
  const y = (v: number) => pad.t + ih - ((Math.log10(Math.max(v, floor)) - lo) / (hi - lo)) * ih

  const ticks: number[] = []
  for (let e = Math.ceil(lo); e <= hi; e++) ticks.push(10 ** e)

  const thresholds = LEVELS.slice(1)
    .map((l) => ({ l, v: twd(l.minUsd) }))
    .filter(({ v }) => v > floor && v < top)

  const path = (arr: { year: number; balance: number }[]) =>
    arr.map((p, i) => `${i ? "L" : "M"}${x(p.year).toFixed(1)},${y(p.balance).toFixed(1)}`).join(" ")

  const xStep = horizon <= 10 ? (W < 520 ? 2 : 1) : horizon <= 20 ? 5 : 10
  const xTicks: number[] = []
  for (let yr = xStep; yr <= horizon; yr += xStep) xTicks.push(yr)

  const reachYear = monthsToNext !== null && monthsToNext > 0 && monthsToNext / 12 <= horizon ? monthsToNext / 12 : null

  host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="淨值預估與財富階梯門檻（對數刻度）">
    ${thresholds
      .map(
        ({ l, v }) => `<g>
          <line x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="${l.color}" stroke-width="1.5" stroke-dasharray="6 4" opacity=".7"/>
          <text x="${W - pad.r - 4}" y="${y(v) - 6}" text-anchor="end" class="th-label" fill="${l.color}">L${l.id} ${l.freedom} · ${compact(v)}</text>
        </g>`,
      )
      .join("")}
    ${ticks
      .map(
        (t) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(t)}" y2="${y(t)}" class="grid-line"/>
        <text x="${pad.l - 8}" y="${y(t) + 4}" text-anchor="end">${compact(t)}</text>`,
      )
      .join("")}
    <path d="${path(principal)}" fill="none" stroke="var(--navy)" stroke-width="2" stroke-dasharray="3 4"/>
    <path d="${path(pts)}" fill="none" stroke="var(--orange)" stroke-width="3"/>
    ${xTicks.map((yr) => `<text x="${x(yr)}" y="${H - 8}" text-anchor="middle">${yr}年</text>`).join("")}
    ${
      reachYear !== null
        ? `<line x1="${x(reachYear)}" x2="${x(reachYear)}" y1="${pad.t}" y2="${pad.t + ih}" class="reach"/>
           <circle cx="${x(reachYear)}" cy="${y(nextMin)}" r="5" fill="var(--orange)" stroke="#fff" stroke-width="2"/>`
        : ""
    }
  </svg>`

  $("chart-caption").innerHTML = `
    <span><i class="swatch" style="background:var(--orange)"></i>假設 ${state.rate}% 的淨值</span>
    <span><i class="swatch dashed"></i>只存不投資（0%）</span>
    <span>縱軸為對數刻度，每一格是 10 倍</span>`
}

function syncInputs(skip?: HTMLInputElement) {
  const set = (el: HTMLInputElement, v: string) => {
    if (el !== skip) el.value = v
  }
  for (const f of ASSET_FIELDS) set(amountInputs.get(f.key)!, state.assets[f.key] ? money(state.assets[f.key]) : "")
  for (const f of DEBT_FIELDS) set(amountInputs.get(f.key)!, state.debts[f.key] ? money(state.debts[f.key]) : "")
  set($<HTMLInputElement>("fx"), String(state.fx))
  set($<HTMLInputElement>("monthly"), money(state.monthly))
  set($<HTMLInputElement>("rate"), String(state.rate))
  set($<HTMLInputElement>("years"), String(state.years))
  set($<HTMLInputElement>("expenses"), state.expenses ? money(state.expenses) : "")
  $<HTMLInputElement>("rate-range").value = String(state.rate)
  $<HTMLInputElement>("years-range").value = String(state.years)
  document.querySelectorAll<HTMLButtonElement>("#rate-presets button").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.rate) === state.rate))
  })
}

function update(skip?: HTMLInputElement) {
  const t = totals(state.assets, state.debts)
  const nw = state.basis === "total" ? t.netWorth : t.liquid
  const level = levelOf(nw / state.fx)
  const liquidLevel = levelOf(t.liquid / state.fx)
  const totalLevel = levelOf(t.netWorth / state.fx)

  renderSummary(t)
  renderBasis()
  renderResult(nw, level, liquidLevel, totalLevel)
  renderLadder(level)
  renderCarefree(nw, t.liquid)
  renderStrategy(level)
  const months = renderPlan(nw, level)
  renderInsights(t, level, liquidLevel, months)
  syncInputs(skip)
  writeHash()
}

function bindControls() {
  document.querySelectorAll<HTMLButtonElement>("#basis button").forEach((b) =>
    b.addEventListener("click", () => {
      state.basis = b.dataset.basis === "liquid" ? "liquid" : "total"
      update()
    }),
  )
  $("basis").addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return
    e.preventDefault()
    state.basis = state.basis === "total" ? "liquid" : "total"
    update()
    document.querySelector<HTMLButtonElement>(`#basis [data-basis="${state.basis}"]`)?.focus()
  })

  const fx = $<HTMLInputElement>("fx")
  fx.addEventListener("input", () => {
    state.fx = clamp(parseDecimal(fx.value), 1, 1000) || 32
    update(fx)
  })
  fx.addEventListener("blur", () => syncInputs())

  bindAmount($<HTMLInputElement>("monthly"), (n) => (state.monthly = n))
  bindAmount($<HTMLInputElement>("expenses"), (n) => (state.expenses = n))

  const rate = $<HTMLInputElement>("rate")
  rate.addEventListener("input", () => {
    state.rate = clamp(parseDecimal(rate.value), 0, 20)
    update(rate)
  })
  rate.addEventListener("blur", () => syncInputs())
  $<HTMLInputElement>("rate-range").addEventListener("input", (e) => {
    state.rate = Number((e.target as HTMLInputElement).value)
    update()
  })
  document.querySelectorAll<HTMLButtonElement>("#rate-presets button").forEach((b) =>
    b.addEventListener("click", () => {
      state.rate = Number(b.dataset.rate)
      update()
    }),
  )

  const years = $<HTMLInputElement>("years")
  years.addEventListener("input", () => {
    state.years = clamp(Math.round(parseDecimal(years.value)) || 1, 1, 60)
    update(years)
  })
  years.addEventListener("blur", () => syncInputs())
  $<HTMLInputElement>("years-range").addEventListener("input", (e) => {
    state.years = Number((e.target as HTMLInputElement).value)
    update()
  })

  $("example-btn").addEventListener("click", () => {
    Object.assign(state, structuredClone(EXAMPLE_STATE))
    update()
  })
  $("reset-btn").addEventListener("click", () => {
    for (const f of ASSET_FIELDS) state.assets[f.key] = 0
    for (const f of DEBT_FIELDS) state.debts[f.key] = 0
    state.monthly = 0
    state.expenses = 0
    update()
    amountInputs.get("cash")?.focus()
  })

  let resizeTimer = 0
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => drawChart(lastChart.nw, lastChart.months), 120)
  })
}

buildFields()
bindControls()
readHash()
update()
