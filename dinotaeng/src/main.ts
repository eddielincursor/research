import "./style.css"
import { svg, type ArtId } from "./art"
import { CHARACTERS, QUIZ, TIMELINE, type Character } from "./data"
import { mountGame } from "./game"

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T
const byId = (id: ArtId) => CHARACTERS.find((c) => c.id === id)!

const GROUPS: Record<string, ArtId[]> = {
  trio: ["quokka", "hatty", "fatty"],
  family: ["quokka", "papa", "mama", "grandpa"],
  village: ["burnt", "bobo", "marsh"],
}

function renderHero() {
  const cast: ArtId[] = ["hatty", "quokka", "fatty", "bobo"]
  const floats = Array.from({ length: 6 }, (_, i) => `<span class="float f${i}">${svg("marsh")}</span>`).join("")
  $("hero-scene").innerHTML = `
    <div class="sun"></div>
    ${floats}
    <div class="hill"></div>
    <div class="cast">${cast.map((id) => `<span class="cast-${id}">${svg(id)}</span>`).join("")}</div>`
}

function renderCards() {
  $("cards").innerHTML = CHARACTERS.map(
    (c) => `<li data-id="${c.id}">
      <button type="button" class="card" style="--c:${c.color}" aria-haspopup="dialog">
        <span class="card-art">${svg(c.id)}</span>
        <span class="card-role">${c.role}</span>
        <b class="card-name">${c.name}</b>
        <span class="card-zh">${c.zh}</span>
        <span class="card-tag">「${c.tagline}」</span>
      </button>
    </li>`,
  ).join("")

  $("cards").addEventListener("click", (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>("li[data-id]")
    if (li) openDialog(byId(li.dataset.id as ArtId))
  })

  document.querySelectorAll<HTMLButtonElement>(".filters .chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      const f = chip.dataset.filter!
      document.querySelectorAll(".filters .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)))
      document.querySelectorAll<HTMLElement>("#cards li").forEach((li) => {
        li.hidden = f !== "all" && !GROUPS[f].includes(li.dataset.id as ArtId)
      })
    }),
  )
}

function openDialog(c: Character) {
  const dlg = $<HTMLDialogElement>("char-dialog")
  $("dlg-body").innerHTML = `
    <button type="button" class="dlg-close" aria-label="關閉">×</button>
    <div class="dlg-head" style="--c:${c.color}">
      <span class="dlg-art">${svg(c.id)}</span>
      <div>
        <span class="card-role">${c.role}</span>
        <h3 id="dlg-title">${c.name}</h3>
        <p class="dlg-zh">${c.zh}</p>
      </div>
    </div>
    <p class="dlg-tag">「${c.tagline}」</p>
    <p>${c.story}</p>
    <h4>小檔案</h4>
    <ul class="dlg-facts">${c.facts.map((f) => `<li>${f}</li>`).join("")}</ul>
    <div class="dlg-life"><b>生活裡的他</b><p>${c.everyday}</p></div>
    <div class="dlg-nav">
      <button type="button" class="btn small" data-step="-1">← 上一位</button>
      <button type="button" class="btn small" data-step="1">下一位 →</button>
    </div>`
  dlg.dataset.id = c.id
  if (!dlg.open) dlg.showModal()
}

function bindDialog() {
  const dlg = $<HTMLDialogElement>("char-dialog")
  dlg.addEventListener("click", (e) => {
    const t = e.target as HTMLElement
    if (t === dlg || t.closest(".dlg-close")) return dlg.close()
    const stepBtn = t.closest<HTMLElement>("[data-step]")
    if (stepBtn) {
      const i = CHARACTERS.findIndex((c) => c.id === dlg.dataset.id)
      const n = (i + Number(stepBtn.dataset.step) + CHARACTERS.length) % CHARACTERS.length
      openDialog(CHARACTERS[n])
      dlg.querySelector<HTMLElement>(`[data-step="${stepBtn.dataset.step}"]`)?.focus()
    }
  })
}

function avatar(id: ArtId, label = byId(id).name) {
  return `<span class="av" style="--c:${byId(id).color}">${svg(id)}<small>${label}</small></span>`
}

function renderRelations() {
  $("relations").innerHTML = `
    <article class="rel">
      <h3>Quokka 一家</h3>
      <div class="rel-row">${avatar("grandpa", "爺爺")}<span class="link">12 根頭髮<br />遺傳給</span>${avatar("papa", "爸爸")}</div>
      <div class="rel-row">${avatar("papa", "爸爸")}<span class="link">一家人</span>${avatar("mama", "媽媽")}</div>
      <div class="rel-row">${avatar("mama", "媽媽")}<span class="link">衣服都是<br />媽媽做的</span>${avatar("quokka", "Quokka")}</div>
    </article>
    <article class="rel">
      <h3>好朋友三人組</h3>
      <div class="rel-trio">${avatar("hatty")}${avatar("quokka")}${avatar("fatty")}</div>
      <ul class="rel-notes">
        <li><b>Quokka</b> 負責衝</li>
        <li><b>Hatty</b> 負責想</li>
        <li><b>Fatty</b> 負責想吃的</li>
      </ul>
    </article>
    <article class="rel">
      <h3>村裡的夥伴</h3>
      <div class="rel-row">${avatar("burnt")}<span class="link">發明工具<br />幫全村做</span>${avatar("marsh")}</div>
      <div class="rel-row">${avatar("bobo")}<span class="link">默默守護<br />常被連累</span>${avatar("quokka")}</div>
      <p class="rel-foot">而 <b>Marsh</b> 是每個人都在追的夢想。</p>
    </article>`
}

function renderTimeline() {
  $("timeline-list").innerHTML = TIMELINE.map(
    (t) => `<li>
      <span class="tl-when">${t.when}</span>
      <div class="tl-body"><b>${t.title}</b><span class="tl-place">${t.place}</span><p>${t.text}</p></div>
    </li>`,
  ).join("")
}

function mountQuiz() {
  const box = $("quiz-box")
  let index = 0
  let scores: Partial<Record<ArtId, number>> = {}

  const question = (focus = true) => {
    const q = QUIZ[index]
    box.innerHTML = `
      <div class="quiz-progress" aria-hidden="true">${QUIZ.map((_, i) => `<i class="${i < index ? "done" : i === index ? "now" : ""}"></i>`).join("")}</div>
      <p class="quiz-count">第 ${index + 1} / ${QUIZ.length} 題</p>
      <h3 class="quiz-q" tabindex="-1">${q.q}</h3>
      <div class="quiz-options">${q.options.map((o, i) => `<button type="button" class="opt" data-i="${i}">${o.text}</button>`).join("")}</div>`
    if (focus) box.querySelector<HTMLElement>(".quiz-q")?.focus({ preventScroll: true })
  }

  const result = () => {
    const order = CHARACTERS.map((c) => c.id).filter((id) => id !== "marsh")
    const top = order.reduce((a, b) => ((scores[b] ?? 0) > (scores[a] ?? 0) ? b : a))
    const c = byId(top)
    box.innerHTML = `
      <div class="quiz-result" style="--c:${c.color}" role="status">
        <span class="qr-art">${svg(c.id)}</span>
        <p class="quiz-count">你最像</p>
        <h3>${c.name}<small>${c.zh}</small></h3>
        <p class="dlg-tag">「${c.tagline}」</p>
        <p>${c.everyday}</p>
        <div class="hero-actions center">
          <button type="button" class="btn primary" data-act="more">看 ${c.name} 的完整介紹</button>
          <button type="button" class="btn" data-act="again">再測一次</button>
        </div>
      </div>`
    box.dataset.result = c.id
  }

  box.addEventListener("click", (e) => {
    const t = e.target as HTMLElement
    const opt = t.closest<HTMLElement>(".opt")
    if (opt) {
      for (const [k, v] of Object.entries(QUIZ[index].options[Number(opt.dataset.i)].score)) {
        scores[k as ArtId] = (scores[k as ArtId] ?? 0) + (v ?? 0)
      }
      index++
      if (index < QUIZ.length) question()
      else result()
      return
    }
    const act = t.closest<HTMLElement>("[data-act]")?.dataset.act
    if (act === "again") {
      index = 0
      scores = {}
      question()
    } else if (act === "more") {
      openDialog(byId(box.dataset.result as ArtId))
    }
  })

  question(false)
}

renderHero()
renderCards()
bindDialog()
renderRelations()
renderTimeline()
mountQuiz()
mountGame()
