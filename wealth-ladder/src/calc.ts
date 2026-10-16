export type LevelId = 1 | 2 | 3 | 4 | 5 | 6

export type Level = {
  id: LevelId
  /** Lower bound in USD; Level 1 has no lower bound. */
  minUsd: number
  maxUsd: number
  freedom: string
  feeling: string
  mantra: string
  mantraEn: string
  focus: string
  doList: string[]
  avoidList: string[]
  example: string
  usShare: string
  color: string
}

export const LEVELS: Level[] = [
  {
    id: 1,
    minUsd: -Infinity,
    maxUsd: 1e4,
    freedom: "月光／負債",
    feeling: "每一筆錢都要算，突發支出就可能刷卡或借錢。",
    mantra: "不典型的結果，需要不典型的行動",
    mantraEn: "Atypical Results Require Atypical Actions",
    focus: "先止血、留一點緩衝，再增加收入。這一階不要先談報酬率。",
    doList: [
      "停止新增高利負債，列出每筆債的利率、最低應繳與到期日",
      "先存到 1 個月必要開銷的小緩衝，避免下一次意外又刷卡",
      "集中先還利率最高的卡債或信貸",
      "用加班、接案、賣掉用不到的東西換現金流",
      "用低成本、可驗證的方式學能加薪的技能",
    ],
    avoidList: ["借錢投資或買高槓桿商品", "再背新的消費性貸款", "為了轉職再借一大筆學費去賭"],
    example: "卡債 12 萬在循環利息裡時，每月少喝幾杯飲料當然有幫助，但真正的漏洞是利息。先補洞，再談投資。",
    usShare: "約 20%",
    color: "#b3261e",
  },
  {
    id: 2,
    minUsd: 1e4,
    maxUsd: 1e5,
    freedom: "超市自由",
    feeling: "買菜、日用品不必為了幾十元逐項比價。",
    mantra: "今天學的，會跟著你很久",
    mantraEn: "Learn Today, Earn Forever",
    focus: "最大的槓桿是讓未來每個月的收入變高：投資自己、離開沒有成長的工作。",
    doList: [
      "找出「我擅長、我有興趣、市場願意付錢」三者的交集",
      "投資能直接提高收入的課程、證照與作品集",
      "每年檢查一次：這份工作還在教我值錢的技能嗎？",
      "緊急預備金補到 3–6 個月必要開銷",
      "開始固定每月自動投入，養成習慣比金額重要",
    ],
    avoidList: ["停在沒有成長、薪水不動的工作", "忽略職涯停滯的機會成本", "只研究投資標的，卻不提高收入"],
    example: "一門 3.6 萬的課換來每月加薪 8,000，約 4.5 個月回本；之後每月多投入 8,000，假設年化 6%，20 年後約 363 萬。",
    usShare: "約 20%",
    color: "#a87014",
  },
  {
    id: 3,
    minUsd: 1e5,
    maxUsd: 1e6,
    freedom: "餐廳自由",
    feeling: "聚餐點想吃的，不必永遠選菜單上最便宜的那一道。",
    mantra: "持續買進",
    mantraEn: "Just Keep Buying",
    focus: "持續買進分散的生息資產，讓錢開始幫你工作；同時守住現金流。",
    doList: [
      "發薪日自動轉帳，定期買進分散的 ETF 或基金",
      "記錄淨值與生息資產佔比，每季看一次就好",
      "考慮副業或第二收入來源",
      "大跌時照計畫執行，不把整套計畫刪掉",
      "買房、買車、教育支出前，先算對每月投入金額的影響",
    ],
    avoidList: ["買太大的房子或車子，把每月投入擠到幾乎歸零", "頻繁進出、追逐熱門標的", "生活水準跟著淨值一起暴漲"],
    example: "一對伴侶每月原本能投入 3 萬，換房後房貸與管理費多 1.8 萬，投入只剩 1.2 萬；房子可以買，但要知道爬梯速度會換一條路。",
    usShare: "約 40%",
    color: "#0f6e6a",
  },
  {
    id: 4,
    minUsd: 1e6,
    maxUsd: 1e7,
    freedom: "旅行自由",
    feeling: "旅行時間、地點與住宿，有很大的選擇權。",
    mantra: "帶你來的方法，不一定能帶你走",
    mantraEn: "What Got You Here Won't Get You There",
    focus: "薪水與儲蓄的引擎開始變慢。想往上，要考慮股權或事業；不想，也可以安心守住成果。",
    doList: [
      "誠實決定：要換引擎往上爬，還是在這一階好好生活",
      "若要往上，評估持有公司股權、創業或加入有股權的團隊",
      "檢查是否真正分散：產業、國家、資產類別",
      "把健康、家庭與時間也算進「報酬」",
    ],
    avoidList: ["投機性投資與高槓桿", "其實只是「換個名字的工作」、完全依賴你本人的事業", "硬把薪水儲蓄推到極限，賠上生活"],
    example: "淨值 5,000 萬、每年能存 100 萬，即使加上投資報酬，要到下一階也往往是數十年的尺度；這時要的是新引擎，或是坦然停留。",
    usShare: "約 18%",
    color: "#244c7a",
  },
  {
    id: 5,
    minUsd: 1e7,
    maxUsd: 1e8,
    freedom: "房子自由",
    feeling: "買理想中的房子，也不至於傷到整體財務。",
    mantra: "只有偏執的人能活下來",
    mantraEn: "Only the Paranoid Survive",
    focus: "問題從「怎麼賺更多」變成「怎麼不要一次失去太多」：先守成。",
    doList: [
      "降低集中風險：自己的公司、單一產業或單一國家",
      "處理稅務、法律、保險與接班安排",
      "決定要出售事業、再創業，還是停止攀爬",
      "保護關係與心理健康，財富也會帶來壓力",
    ],
    avoidList: ["全部押在單一事業或資產", "用借來的錢放大部位", "個人責任與訴訟風險沒有隔離"],
    example: "年輕時把資產集中在自己公司是衝刺；金額與家庭責任變大後，同一個動作可能是把全家的安全感押上去。",
    usShare: "與 L6 合計約 2%",
    color: "#5e2750",
  },
  {
    id: 6,
    minUsd: 1e8,
    maxUsd: Infinity,
    freedom: "影響力自由",
    feeling: "能用錢支持他人、投資事業或做大規模公益。",
    mantra: "影響力 = 行動 × 財富",
    mantraEn: "Legacy = Action × Wealth",
    focus: "守護財富，並決定要留下什麼：關係、健康與影響力比再多一個零重要。",
    doList: ["思考你想留下的影響與制度", "慈善、投資他人與社群", "把時間留給關係與健康"],
    avoidList: ["為了再上一階冒不必要的險", "忽略婚姻、訴訟等重大個人風險"],
    example: "錢很多但沒有行動，影響仍然有限；這一階的問題是「我能讓什麼事情發生」。",
    usShare: "與 L5 合計約 2%",
    color: "#e95420",
  },
]

export type Assets = {
  cash: number
  invest: number
  retirement: number
  home: number
  property: number
  other: number
}

export type Debts = {
  mortgage: number
  highInterest: number
  loans: number
  otherDebt: number
}

export type Totals = {
  assets: number
  debts: number
  netWorth: number
  liquid: number
  incomeProducing: number
  homeEquity: number
}

export function totals(a: Assets, d: Debts): Totals {
  const assets = a.cash + a.invest + a.retirement + a.home + a.property + a.other
  const debts = d.mortgage + d.highInterest + d.loans + d.otherDebt
  return {
    assets,
    debts,
    netWorth: assets - debts,
    liquid: a.cash + a.invest - d.highInterest - d.loans - d.otherDebt,
    incomeProducing: a.invest + a.retirement + a.property,
    homeEquity: a.home - d.mortgage,
  }
}

export function levelOf(netWorthUsd: number): Level {
  for (const level of LEVELS) {
    if (netWorthUsd < level.maxUsd) return level
  }
  return LEVELS[LEVELS.length - 1]
}

/**
 * Where you stand inside your level, 0–1. Levels are 10× wide, so above Level 1
 * the position is measured on a log scale; Level 1 runs linearly from 0 to its cap.
 */
export function progressInLevel(netWorthUsd: number, level: Level): number {
  if (level.id === 6) return 1
  if (level.id === 1) return clamp(netWorthUsd / level.maxUsd, 0, 1)
  return clamp(Math.log10(netWorthUsd / level.minUsd), 0, 1)
}

/** Net worth × 0.01%: the size of an extra spending difference that should not cost you sleep. */
export function carefreeDifference(netWorth: number): number {
  return Math.max(0, netWorth) * 0.0001
}

export function monthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate, 1 / 12) - 1
}

/** Months until the balance reaches the target with end-of-month deposits; null if not within the cap. */
export function monthsToTarget(
  start: number,
  monthly: number,
  annualRate: number,
  target: number,
  capMonths = 100 * 12,
): number | null {
  if (start >= target) return 0
  const rm = monthlyRate(annualRate)
  let balance = start
  for (let m = 1; m <= capMonths; m++) {
    balance = balance * (1 + rm) + monthly
    if (balance >= target) return m
  }
  return null
}

/** Monthly deposit needed to reach the target in the given number of months. */
export function requiredMonthly(start: number, annualRate: number, target: number, months: number): number {
  if (months <= 0) return Infinity
  const rm = monthlyRate(annualRate)
  const growth = Math.pow(1 + rm, months)
  const annuity = rm === 0 ? months : (growth - 1) / rm
  return Math.max(0, (target - start * growth) / annuity)
}

export type Point = { year: number; balance: number }

export function project(start: number, monthly: number, annualRate: number, years: number): Point[] {
  const rm = monthlyRate(annualRate)
  let balance = start
  const points: Point[] = [{ year: 0, balance }]
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) balance = balance * (1 + rm) + monthly
    points.push({ year: y, balance })
  }
  return points
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n))
}

export function money(n: number): string {
  return Math.round(n).toLocaleString("zh-TW")
}

export function compact(n: number): string {
  const sign = n < 0 ? "-" : ""
  const a = Math.abs(n)
  if (a >= 1e8) return `${sign}${trim(a / 1e8)} 億`
  if (a >= 1e4) return `${sign}${trim(a / 1e4)} 萬`
  return `${sign}${money(a)}`
}

function trim(n: number): string {
  const d = n >= 100 ? 0 : n >= 10 ? 1 : 2
  const s = n.toFixed(d)
  return d === 0 ? s : s.replace(/\.?0+$/, "")
}

export function duration(months: number): string {
  const y = Math.floor(months / 12)
  const m = months % 12
  if (y === 0) return `${m} 個月`
  if (m === 0) return `${y} 年`
  return `${y} 年 ${m} 個月`
}

export type SpendExample = { max: number; text: string }

/** Everyday decisions sized to roughly match the 0.01% threshold, in TWD. */
export const SPEND_EXAMPLES: SpendExample[] = [
  { max: 10, text: "連飲料加料都要想一下，這很正常：先把力氣放在止血與收入。" },
  { max: 60, text: "超商飯糰、便當加一顆蛋這種差額，選喜歡的就好。" },
  { max: 600, text: "聚餐時主餐差兩三百元，點想吃的那一道，不會改變你的財務人生。" },
  { max: 6000, text: "機票選直飛、住宿升級一級，可以為睡眠與時間付錢。" },
  { max: 60000, text: "旅行行程、課程或家電升級的差額，可以優先考慮品質與時間。" },
  { max: 600000, text: "裝修、換車等級這類差額開始變得不痛不癢，但仍要看現金流。" },
  { max: Infinity, text: "一次決策的差額大到能改變別人的生活：思考影響力與留下什麼。" },
]

export function spendExample(diffTwd: number): string {
  return (SPEND_EXAMPLES.find((e) => diffTwd < e.max) ?? SPEND_EXAMPLES[SPEND_EXAMPLES.length - 1]).text
}
