import { FinanceTools } from "@/components/finance-tools"

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#top" className="flex min-w-0 items-center gap-2.5 font-semibold tracking-tight">
            <span className="flex h-6 w-6 shrink-0 overflow-hidden rounded-md">
              <span className="w-3/5 bg-[#0f6e6a]" />
              <span className="w-[30%] bg-[#e95420]" />
              <span className="w-[10%] bg-[#5e2750]" />
            </span>
            <span className="truncate">
              <span className="sm:hidden">理財試算</span>
              <span className="hidden sm:inline">薪水分配與投資試算</span>
            </span>
          </a>
          <nav className="flex shrink-0 items-center gap-1 text-sm whitespace-nowrap">
            <a href="#budget" className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <span className="hidden sm:inline">1 </span>財務規劃表
            </a>
            <a href="#invest" className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <span className="hidden sm:inline">2 </span>投資計算機
            </a>
          </nav>
        </div>
      </header>

      <main id="top" className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
        <div className="mb-10 max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">先決定每個月留多少，再看它能長成多少</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            第一步用 631、333、5311 等分法，把稅後收入拆成生活、儲蓄、投資和保障。第二步把投資那一格帶進計算機，看 10 年、20 年後的結果。所有計算都在你的瀏覽器裡完成，不會上傳。
          </p>
        </div>
        <FinanceTools />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed text-muted-foreground sm:px-6">
          比例與報酬率都是試算用的假設，不構成投資建議。分法的說明與例子見教學〈用同一筆薪水看懂 631、333、5311 和其他理財分法〉。
        </div>
      </footer>
    </div>
  )
}
