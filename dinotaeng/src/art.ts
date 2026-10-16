export type ArtId =
  | "quokka"
  | "hatty"
  | "fatty"
  | "papa"
  | "mama"
  | "grandpa"
  | "burnt"
  | "bobo"
  | "marsh"

export type ItemId = "marsh" | "golden" | "burntMarsh" | "donut" | "boboHelper"

const INK = "#4a3426"

type QuokkaOpts = {
  fur?: string
  belly?: string
  rx?: number
  ry?: number
  eyes?: "dot" | "sleepy" | "small"
  brows?: "none" | "droopy" | "flat"
  hair?: string
  extras?: string
}

function eyes(kind: QuokkaOpts["eyes"], y: number): string {
  if (kind === "sleepy") {
    return `<path d="M41 ${y} q5 4 10 0 M69 ${y} q5 4 10 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`
  }
  const r = kind === "small" ? 3 : 4.2
  return `<circle cx="46" cy="${y}" r="${r}" fill="${INK}"/><circle cx="74" cy="${y}" r="${r}" fill="${INK}"/>
    <circle cx="47.3" cy="${y - 1.4}" r="1.3" fill="#fff"/><circle cx="75.3" cy="${y - 1.4}" r="1.3" fill="#fff"/>`
}

function twelveHairs(color: string): string {
  const out: string[] = []
  for (let i = 0; i < 12; i++) {
    const x = 42 + i * 3.3
    const lean = (i - 5.5) * 0.9
    out.push(`<path d="M${x.toFixed(1)} 32 q${(lean - 2).toFixed(1)} -9 ${(lean + 1).toFixed(1)} -15" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round"/>`)
  }
  return out.join("")
}

function quokka(o: QuokkaOpts = {}): string {
  const fur = o.fur ?? "#c08a5c"
  const belly = o.belly ?? "#f6dfc6"
  const rx = o.rx ?? 37
  const ry = o.ry ?? 37
  const earX = rx - 15
  const earY = 60 - ry + 4
  const brows =
    o.brows === "droopy"
      ? `<path d="M38 45 l12 -5 M82 45 l-12 -5" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`
      : o.brows === "flat"
        ? `<path d="M40 44 h11 M69 44 h11" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`
        : ""
  return `
    <ellipse cx="60" cy="104" rx="30" ry="15" fill="${fur}"/>
    <ellipse cx="60" cy="106" rx="17" ry="10" fill="${belly}"/>
    <ellipse cx="${60 - earX}" cy="${earY}" rx="8" ry="9" fill="${fur}"/>
    <ellipse cx="${60 + earX}" cy="${earY}" rx="8" ry="9" fill="${fur}"/>
    <ellipse cx="${60 - earX}" cy="${earY + 1}" rx="3.8" ry="4.6" fill="#e9a48f"/>
    <ellipse cx="${60 + earX}" cy="${earY + 1}" rx="3.8" ry="4.6" fill="#e9a48f"/>
    ${o.hair ? twelveHairs(o.hair) : ""}
    <path d="M${60 - rx} 62 C${60 - rx} ${60 - ry - 4} ${60 + rx} ${60 - ry - 4} ${60 + rx} 62 C${60 + rx} ${60 + ry} ${60 - rx} ${60 + ry} ${60 - rx} 62Z" fill="${fur}"/>
    <ellipse cx="60" cy="74" rx="19" ry="13" fill="${belly}"/>
    ${brows}
    ${eyes(o.eyes ?? "dot", 56)}
    <ellipse cx="60" cy="66" rx="4.5" ry="3.2" fill="${INK}"/>
    <path d="M53 72 q3.5 4 7 0 q3.5 4 7 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="34" cy="70" rx="6" ry="4" fill="#f4a3a3" opacity=".75"/>
    <ellipse cx="86" cy="70" rx="6" ry="4" fill="#f4a3a3" opacity=".75"/>
    ${o.extras ?? ""}`
}

function marshBody(top: string, side: string, face = true): string {
  return `
    <rect x="24" y="34" width="72" height="66" rx="22" fill="${side}"/>
    <ellipse cx="60" cy="38" rx="36" ry="14" fill="${top}"/>
    ${
      face
        ? `<circle cx="47" cy="68" r="4" fill="${INK}"/><circle cx="73" cy="68" r="4" fill="${INK}"/>
    <path d="M55 76 q5 5 10 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="38" cy="78" rx="6" ry="4" fill="#f7a8b8" opacity=".8"/>
    <ellipse cx="82" cy="78" rx="6" ry="4" fill="#f7a8b8" opacity=".8"/>`
        : ""
    }`
}

const BODIES: Record<ArtId, () => string> = {
  quokka: () => quokka(),
  hatty: () =>
    quokka({
      fur: "#c99563",
      extras: `<path d="M22 34 q38 -12 76 0 q-4 6 -10 6 h-56 q-6 0 -10 -6z" fill="#4f7cc4"/>
        <path d="M32 34 q4 -26 28 -26 q24 0 28 26z" fill="#6b97de"/>
        <rect x="32" y="27" width="56" height="6" rx="3" fill="#ffd166"/>`,
    }),
  fatty: () =>
    quokka({
      fur: "#b8835a",
      rx: 45,
      ry: 37,
      eyes: "small",
      brows: "droopy",
      extras: `<circle cx="96" cy="96" r="9" fill="#ffe6a7" stroke="#e7b75f" stroke-width="2"/><circle cx="94" cy="94" r="1.5" fill="#c9893e"/><circle cx="99" cy="98" r="1.5" fill="#c9893e"/>`,
    }),
  papa: () => quokka({ fur: "#a9744c", hair: INK, brows: "flat" }),
  mama: () =>
    quokka({
      fur: "#c58f61",
      extras: `<path d="M24 36 q36 -22 72 0" stroke="#e86f6f" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M88 30 l12 -8 l-2 14z M88 30 l14 4 l-12 6z" fill="#e86f6f"/>
        <circle cx="89" cy="31" r="3.5" fill="#c94f4f"/>`,
    }),
  grandpa: () =>
    quokka({
      fur: "#b59a83",
      belly: "#efe4d8",
      hair: "#f7f2ea",
      eyes: "sleepy",
      extras: `<circle cx="46" cy="56" r="9" fill="none" stroke="${INK}" stroke-width="2.4"/>
        <circle cx="74" cy="56" r="9" fill="none" stroke="${INK}" stroke-width="2.4"/>
        <path d="M55 56 h10" stroke="${INK}" stroke-width="2.4"/>
        <path d="M48 78 q12 8 24 0 q-12 -2 -24 0" fill="#f7f2ea"/>`,
    }),
  burnt: () =>
    quokka({
      fur: "#8a5a3b",
      belly: "#e9c9a6",
      brows: "flat",
      extras: `<rect x="28" y="31" width="64" height="8" rx="4" fill="#5b4636"/>
        <circle cx="46" cy="33" r="9" fill="#9fd3e6" stroke="#5b4636" stroke-width="3"/>
        <circle cx="74" cy="33" r="9" fill="#9fd3e6" stroke="#5b4636" stroke-width="3"/>
        <path d="M92 96 l12 -12 m-4 -4 l8 8" stroke="#8d99a6" stroke-width="5" stroke-linecap="round"/>`,
    }),
  bobo: () => `
    <ellipse cx="60" cy="104" rx="26" ry="14" fill="#fbfbfb" stroke="#e9e3dc" stroke-width="2"/>
    <circle cx="34" cy="32" r="12" fill="#fbfbfb" stroke="#e9e3dc" stroke-width="2"/>
    <circle cx="86" cy="32" r="12" fill="#fbfbfb" stroke="#e9e3dc" stroke-width="2"/>
    <circle cx="34" cy="32" r="5" fill="#fbd3dc"/><circle cx="86" cy="32" r="5" fill="#fbd3dc"/>
    <ellipse cx="60" cy="62" rx="38" ry="34" fill="#fbfbfb" stroke="#e9e3dc" stroke-width="2"/>
    <circle cx="47" cy="60" r="3.6" fill="${INK}"/><circle cx="73" cy="60" r="3.6" fill="${INK}"/>
    <ellipse cx="60" cy="68" rx="3.4" ry="2.4" fill="${INK}"/>
    <path d="M56 73 q4 3 8 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <ellipse cx="38" cy="72" rx="6" ry="4" fill="#fbc4cf"/><ellipse cx="82" cy="72" rx="6" ry="4" fill="#fbc4cf"/>`,
  marsh: () => marshBody("#fff7ef", "#ffe3e8"),
}

const ITEMS: Record<ItemId, () => string> = {
  marsh: () => marshBody("#fff7ef", "#ffe3e8"),
  golden: () => `${marshBody("#fff3c4", "#ffd35c")}
    <path d="M100 18 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3z" fill="#fff6c8" stroke="#e8b52e" stroke-width="1.5"/>`,
  burntMarsh: () => `
    <rect x="24" y="34" width="72" height="66" rx="22" fill="#6b4a37"/>
    <ellipse cx="60" cy="38" rx="36" ry="14" fill="#3c2a20"/>
    <path d="M40 62 l10 6 m0 -6 l-10 6 M70 62 l10 6 m0 -6 l-10 6" stroke="#f3e1d0" stroke-width="3" stroke-linecap="round"/>
    <path d="M52 84 q8 -6 16 0" stroke="#f3e1d0" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M46 18 q6 -8 0 -14 M62 20 q6 -8 0 -14 M78 18 q6 -8 0 -14" stroke="#a49a92" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  donut: () => `
    <circle cx="60" cy="64" r="40" fill="#e3a65f"/>
    <path d="M24 58 q8 -30 36 -32 q30 0 38 30 q-6 12 -14 6 q-8 10 -16 2 q-10 10 -18 0 q-10 8 -16 -2 q-8 6 -10 -4z" fill="#f78fb3"/>
    <circle cx="60" cy="64" r="13" fill="#fff8ef"/>
    <path d="M40 44 l5 -3 M70 38 l5 2 M82 52 l3 4 M50 34 l2 -4 M36 58 l4 1" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    <path d="M58 30 l6 3 M88 44 l-2 5" stroke="#7ed0f2" stroke-width="3" stroke-linecap="round"/>`,
  boboHelper: () => BODIES.bobo(),
}

export function svg(id: ArtId, cls = ""): string {
  return `<svg class="${cls}" viewBox="0 0 120 124" aria-hidden="true" focusable="false">${BODIES[id]()}</svg>`
}

export function itemSvg(id: ItemId): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 124" width="120" height="124">${ITEMS[id]()}</svg>`
}

export function artSvgStandalone(id: ArtId): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 124" width="120" height="124">${BODIES[id]()}</svg>`
}

export function svgImage(markup: string): HTMLImageElement {
  const img = new Image()
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
  return img
}
