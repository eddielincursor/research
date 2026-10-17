import "./style.css"
import {
  DECILES,
  OVERALL,
  STAGES,
  agePercent,
  band,
  money,
  rough,
  stageOf,
  verdict,
  type Stage,
} from "./calc"

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T

const PEOPLE = [30, 30, 30, 30, 30, 30, 30, 55, 80, 145]

function renderTen() {
  const avg = 49
  $("ten").innerHTML = PEOPLE.map((n, i) => {
    const h = 36 + n * 1.15
    const under = n < avg
    return `<div class="person ${under ? "under" : "over"}">
      <b>${n}</b>
      <span style="height:${h}px"></span>
      <small>${i + 1}</small>
    </div>`
  }).join("")
  $("ten").insertAdjacentHTML("afterend", `<p class="ten-key"><i class="sw under"></i>領不到平均 4.9 萬的 7 人<i class="sw over"></i>領得到的 3 人<span>單位：千元</span></p>`)
}

function renderTrend() {
  const years = [109, 110, 111, 112, 113, 114]
  $("trend").innerHTML = years.map((y, i) => {
    const v = OVERALL.belowAverage[i]
    return `<li class="${i === years.length - 1 ? "now" : ""}"><b>${v.toFixed(2)}%</b><span>${y} 年</span></li>`
  }).join("")
}

function renderBars() {
  const max = DECILES[DECILES.length - 1]
  const labels = ["贏過 10%", "贏過 20%", "贏過 30%", "贏過 40%", "贏過一半", "贏過 60%", "贏過 70%", "贏過 80%", "贏過 90%"]
  $("bars").innerHTML = DECILES.map((v, i) => {
    const mark = i === 4 ? "med" : i === 6 ? "avg" : ""
    const tag = i === 4 ? "中位數" : i === 6 ? "幾乎是全體平均" : i === 0 ? "114 年最低工資" : ""
    return `<div class="hbar ${mark}">
      <span class="hbar-lab">${labels[i]}</span>
      <span class="hbar-track"><i style="width:${(v / max) * 100}%"></i></span>
      <span class="hbar-val">${money(v)}${tag ? `<em>${tag}</em>` : ""}</span>
    </div>`
  }).join("")
}

function renderStages() {
  $("stage-list").innerHTML = STAGES.map((s) => {
    const flipped = s.average < s.median
    return `<article class="stage ${flipped ? "flipped" : ""}">
      <header>
        <span>${s.ages}</span>
        <h3>${s.name}</h3>
      </header>
      <div class="lines">
        <p><span>及格線・中位數</span><b>${money(s.median)}</b><small>贏過大約一半同齡</small></p>
        <p><span>${flipped ? "平均被低薪拉低" : "前段線・平均數"}</span><b>${money(s.average)}</b><small>${flipped ? "過了平均還沒到一半" : "達到這個算前段"}</small></p>
      </div>
      <p class="stage-note">${s.note}</p>
    </article>`
  }).join("")
}

function bandText(salary: number): string {
  const b = band(salary)
  if (b.ceil === null) return "月薪至少贏過全體受僱員工的 90%。官方只公布到第 9 個十分位，再高就沒有更細的數字。"
  if (b.floor === 0) return "月薪落在全體最低的 10% 以內，還沒到第 1 個十分位 28,590 元。"
  return `月薪至少贏過全體的 ${b.floor}%，還沒到 ${b.ceil}%。這是官方十分位，不用估計。`
}

function ageText(stage: Stage, salary: number): string {
  const p = agePercent(stage, salary)
  if (p.cap === "low") return `同齡裡大約落在最低的 10%。官方沒有公布各年齡的百分位，這是用全體分布的形狀粗估的。`
  if (p.cap === "high") return `同齡裡大約落在最高的 10%。再高的名次，官方資料分不出來。`
  const n = rough(p.percent)
  return `大約贏過同齡受僱員工的 ${n}%。這是粗估，實際可能上下差約 5 到 10 個百分點。`
}

function verdictBlock(stage: Stage, salary: number): { title: string; tone: string } {
  const v = verdict(stage, salary)
  if (v === "average") return { tone: "front", title: "過了同齡平均，算這個階段的前段" }
  if (v === "median") return { tone: "ok", title: stage.average < stage.median ? "過了同齡中位數，贏過大約一半" : "過了及格線，還沒到同齡平均" }
  if (v === "average-only") return { tone: "mid", title: "過了平均，但這個階段的平均比中位數低" }
  return { tone: "calm", title: "還沒到同齡中位數" }
}

function diffLine(label: string, base: number, salary: number): string {
  const d = salary - base
  const pct = Math.abs(d / base) * 100
  const dir = d === 0 ? "剛好一樣" : d > 0 ? `高 ${money(d)} 元（約 ${pct.toFixed(pct >= 10 ? 0 : 1)}%）` : `低 ${money(-d)} 元（約 ${pct.toFixed(pct >= 10 ? 0 : 1)}%）`
  return `<li><span>${label} ${money(base)}</span><b>${dir}</b></li>`
}

function renderResult(age: number, salary: number) {
  const stage = stageOf(age)
  const v = verdictBlock(stage, salary)
  const below = salary < stage.median
  $("result").innerHTML = `
    <p class="result-kicker">${age} 歲・${stage.ages}</p>
    <h3>${stage.name}</h3>
    <p class="verdict ${v.tone}">${v.title}</p>
    <ul class="diffs">
      ${diffLine("同齡中位數", stage.median, salary)}
      ${diffLine("同齡平均", stage.average, salary)}
      ${diffLine("全體中位數", OVERALL.median, salary)}
      ${diffLine("全體平均", OVERALL.average, salary)}
    </ul>
    <div class="meter" role="img" aria-label="${ageText(stage, salary)}">
      <span class="meter-lab">同齡位置（粗估）</span>
      <span class="meter-track"><i style="width:${agePercent(stage, salary).cap === "high" ? 100 : agePercent(stage, salary).cap === "low" ? 4 : rough(agePercent(stage, salary).percent)}%"></i></span>
    </div>
    <p class="age-line">${ageText(stage, salary)}</p>
    <p class="all-line"><b>全體：</b>${bandText(salary)}</p>
    ${below ? `<p class="calm-note">一半的同齡受僱員工也在中位數以下。這條線是對照，不是落後。</p>` : ""}
    <p class="stage-note">${stage.note}</p>`
}

function readHash() {
  const p = new URLSearchParams(location.hash.slice(1))
  const age = Number(p.get("a"))
  const pay = Number(p.get("s"))
  if (Number.isFinite(age) && age > 0) $<HTMLInputElement>("age").value = String(age)
  if (Number.isFinite(pay) && pay > 0) $<HTMLInputElement>("pay").value = money(pay)
  return { age, pay }
}

function warnFor(age: number, salary: number): string {
  if (age < 15 || age > 80) return "年紀請填 15 到 80 歲。主計總處的分組沒有再切更細。"
  if (salary < 1_000) return "這個金額很像時薪。這裡要填每個月的金額。"
  if (salary > 500_000) return "這個金額很像年薪或含一大筆獎金。這裡要填每月經常性薪資，加班費和年終先不要算。"
  if (salary < 15_000) return "金額低於一般月薪。若是部分工時，對出來的位置會落在全體的後段，這是統計本來就包含部分工時的結果。"
  return ""
}

function submit(age: number, salary: number) {
  const warn = $("warn")
  const msg = warnFor(age, salary)
  warn.hidden = !msg
  warn.textContent = msg
  if (age < 15 || age > 80 || salary <= 0) {
    $("result").innerHTML = `<p class="placeholder">請填 15 到 80 歲，以及每個月的薪資。</p>`
    return
  }
  const p = new URLSearchParams()
  p.set("a", String(age))
  p.set("s", String(Math.round(salary)))
  history.replaceState(null, "", `#${p}`)
  renderResult(age, salary)
}

function bind() {
  const form = $<HTMLFormElement>("form")
  const age = $<HTMLInputElement>("age")
  const pay = $<HTMLInputElement>("pay")
  const parse = (el: HTMLInputElement) => Number(el.value.replace(/[^\d.]/g, ""))
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    submit(parse(age), parse(pay))
  })
  pay.addEventListener("blur", () => {
    const n = parse(pay)
    if (n) pay.value = money(n)
  })
  $("example").addEventListener("click", () => {
    age.value = "32"
    pay.value = money(42_000)
    submit(32, 42_000)
    $("result").scrollIntoView({ behavior: "smooth", block: "nearest" })
  })
}

renderTen()
renderTrend()
renderBars()
renderStages()
bind()
const initial = readHash()
if (initial.age > 0 && initial.pay > 0) submit(initial.age, initial.pay)
