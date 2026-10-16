"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts"
import { Download, Info, Sparkles, Target, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { NumberField } from "@/components/number-field"
import {
  exactDoublingYears,
  monthsToTarget,
  requiredMonthly,
  ruleOf72,
  simulate,
  type InvestInput,
  type YearRow,
} from "@/lib/invest"
import { compactMoney, duration, money, percent } from "@/lib/format"
import { cn } from "@/lib/utils"

export type CalculatorState = InvestInput & { fromBudget: boolean }

type InvestmentCalculatorProps = {
  state: CalculatorState
  onChange: (next: CalculatorState) => void
}

const PRESETS = [
  { label: "定存", rate: 1.7 },
  { label: "保守", rate: 4 },
  { label: "穩健", rate: 6 },
  { label: "積極", rate: 8 },
]

const growthConfig = {
  contributed: { label: "投入本金", color: "#244c7a" },
  gains: { label: "累積報酬", color: "#e95420" },
} satisfies ChartConfig

const scenarioConfig = {
  low: { label: "低", color: "#9aa3ad" },
  base: { label: "你的設定", color: "#e95420" },
  high: { label: "高", color: "#0f6e6a" },
  principal: { label: "只存不投資", color: "#244c7a" },
} satisfies ChartConfig

export function InvestmentCalculator({ state, onChange }: InvestmentCalculatorProps) {
  const [showReal, setShowReal] = React.useState(false)
  const [target, setTarget] = React.useState(5_000_000)

  const set = <K extends keyof CalculatorState>(key: K, value: CalculatorState[K]) =>
    onChange({ ...state, [key]: value, ...(key === "monthly" ? { fromBudget: false } : {}) })

  const rows = React.useMemo(() => simulate(state), [state])
  const last = rows[rows.length - 1]
  const deflate = (row: YearRow, value: number) => (showReal ? value / Math.pow(1 + state.inflation, row.year) : value)

  const shownBalance = deflate(last, last.balance)
  const gainShare = last.balance > 0 ? Math.max(0, last.gains) / last.balance : 0

  const chartData = rows.map((r) => ({
    year: r.year,
    contributed: Math.round(deflate(r, r.contributed)),
    gains: Math.round(deflate(r, Math.max(0, r.gains))),
    loss: Math.round(deflate(r, Math.min(0, r.gains))),
    balance: Math.round(deflate(r, r.balance)),
  }))

  const spread = 0.02
  const lowRate = Math.max(0, state.annualRate - spread)
  const highRate = state.annualRate + spread
  const lowRows = React.useMemo(() => simulate({ ...state, annualRate: lowRate }), [state, lowRate])
  const highRows = React.useMemo(() => simulate({ ...state, annualRate: highRate }), [state, highRate])
  const zeroRows = React.useMemo(() => simulate({ ...state, annualRate: 0 }), [state])
  const scenarioData = rows.map((r, i) => ({
    year: r.year,
    low: Math.round(deflate(r, lowRows[i].balance)),
    base: Math.round(deflate(r, r.balance)),
    high: Math.round(deflate(r, highRows[i].balance)),
    principal: Math.round(deflate(r, zeroRows[i].balance)),
  }))

  const crossover = React.useMemo(() => {
    for (let i = 1; i < rows.length; i++) {
      const added = rows[i].contributed - rows[i - 1].contributed
      const growth = rows[i].balance - rows[i - 1].balance - added
      if (added > 0 && growth > added) return rows[i].year
    }
    return null
  }, [rows])

  const needed = React.useMemo(() => requiredMonthly(state, target), [state, target])
  const reachIn = React.useMemo(() => monthsToTarget(state, target), [state, target])
  const r72 = ruleOf72(state.annualRate)
  const exact = exactDoublingYears(state.annualRate)

  const downloadCsv = () => {
    const header = ["年", "當年每月投入", "累計投入本金", "期末金額", "累積報酬", "換算今日幣值"]
    const lines = rows.map((r) =>
      [r.year, Math.round(r.monthlyThisYear), Math.round(r.contributed), Math.round(r.balance), Math.round(r.gains), Math.round(r.realBalance)].join(","),
    )
    const blob = new Blob(["\ufeff" + [header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `投資試算_${state.years}年_${state.annualRate * 100}%.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="overflow-visible border-0 py-0 shadow-[0_1px_0_rgba(27,36,48,0.04),0_12px_40px_-24px_rgba(27,36,48,0.35)] ring-1 ring-border">
      <CardHeader className="gap-2 border-b border-border px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-[#e95420] text-sm font-semibold text-white">2</span>
          <CardTitle className="text-xl font-semibold tracking-tight">投資計算機</CardTitle>
        </div>
        <CardDescription className="max-w-2xl text-[15px] leading-relaxed">
          單筆、每月定期，或兩者一起。看本金和報酬各佔多少，換一個報酬率差多少，以及要多久才到你的目標。
        </CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-8 px-5 py-6 sm:px-7 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-10">
        <div className="grid content-start gap-5">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              id="initial"
              label="單筆投入"
              value={state.initial}
              onChange={(v) => set("initial", v)}
              prefix="NT$"
              max={10_000_000_000}
            />
            <div className="grid gap-1.5">
              <NumberField
                id="monthly"
                label="每月投入"
                value={state.monthly}
                onChange={(v) => set("monthly", v)}
                prefix="NT$"
                max={1_000_000_000}
              />
            </div>
          </div>
          {state.fromBudget ? (
            <div className="-mt-2 flex items-center gap-1.5 text-xs text-[#0f6e6a]">
              <Sparkles className="size-3.5" /> 每月投入來自財務規劃表
            </div>
          ) : null}

          <div className="grid gap-3">
            <div className="grid grid-cols-[112px_1fr] items-end gap-4">
              <NumberField
                id="rate"
                label="年化報酬率"
                value={Math.round(state.annualRate * 1000) / 10}
                onChange={(v) => set("annualRate", v / 100)}
                decimals={1}
                min={-50}
                max={50}
                suffix="%"
              />
              <Slider
                className="pb-4"
                value={[Math.min(15, Math.max(0, state.annualRate * 100))]}
                onValueChange={(v) => set("annualRate", (Array.isArray(v) ? v[0] : v) / 100)}
                min={0}
                max={15}
                step={0.1}
                aria-label="年化報酬率"
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESETS.map((p) => (
                <Button
                  key={p.label}
                  variant={Math.abs(state.annualRate * 100 - p.rate) < 0.05 ? "default" : "outline"}
                  size="sm"
                  className="h-auto flex-col gap-0 py-1.5 text-xs"
                  onClick={() => set("annualRate", p.rate / 100)}
                >
                  <span>{p.label}</span>
                  <span className="tabular-nums opacity-70">{p.rate}%</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid grid-cols-[112px_1fr] items-end gap-4">
              <NumberField
                id="years"
                label="投資年數"
                value={state.years}
                onChange={(v) => set("years", Math.round(v))}
                min={0}
                max={80}
                suffix="年"
              />
              <Slider
                className="pb-4"
                value={[Math.min(50, Math.max(1, state.years))]}
                onValueChange={(v) => set("years", Array.isArray(v) ? v[0] : v)}
                min={1}
                max={50}
                step={1}
                aria-label="投資年數"
              />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[5, 10, 20, 30].map((y) => (
                <Button
                  key={y}
                  variant={state.years === y ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => set("years", y)}
                >
                  {y} 年
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5">
            <span className="text-[13px] font-medium text-foreground/80">每月扣款時間</span>
            <ToggleGroup
              value={[state.timing]}
              onValueChange={(v: string[]) => v[0] && set("timing", v[0] as CalculatorState["timing"])}
              variant="outline"
              spacing={0}
              className="w-full"
            >
              <ToggleGroupItem value="start" className="flex-1">
                月初投入
              </ToggleGroupItem>
              <ToggleGroupItem value="end" className="flex-1">
                月底投入
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-xs text-muted-foreground">月初投入每筆多滾一個月，結果會略高。</p>
          </div>

          <div className="grid gap-4 rounded-xl border border-border bg-secondary/40 p-4">
            <div className="text-sm font-semibold">進階</div>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                id="stepup"
                label="每年加碼"
                value={Math.round(state.stepUp * 1000) / 10}
                onChange={(v) => set("stepUp", v / 100)}
                decimals={1}
                min={0}
                max={50}
                suffix="%"
                hint="加薪後每月投入跟著調高"
              />
              <NumberField
                id="inflation"
                label="通膨率"
                value={Math.round(state.inflation * 1000) / 10}
                onChange={(v) => set("inflation", v / 100)}
                decimals={1}
                min={0}
                max={20}
                suffix="%"
                hint="用來換算成今天的購買力"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="real" className="text-sm font-normal">
                結果以今天的購買力顯示
              </Label>
              <Switch id="real" checked={showReal} onCheckedChange={setShowReal} />
            </div>
          </div>
        </div>

        <div className="grid min-w-0 content-start gap-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat
              label={showReal ? `${state.years} 年後，換算今天的購買力` : `${state.years} 年後的總額`}
              value={shownBalance}
              sub={
                last.contributed > 0
                  ? `投入 ${compactMoney(deflate(last, last.contributed))}，長成本金的 ${(last.balance / last.contributed).toFixed(2)} 倍`
                  : undefined
              }
              emphasis
            />
            <Stat label="投入本金" value={deflate(last, last.contributed)} tone="#244c7a" />
            <Stat
              label={last.gains >= 0 ? "累積報酬" : "累積虧損"}
              value={deflate(last, last.gains)}
              tone={last.gains >= 0 ? "#e95420" : "#b03024"}
            />
            <Stat label="報酬佔總額" text={percent(gainShare)} className="col-span-2 sm:col-span-1" />
          </div>

          <Tabs defaultValue="growth" className="gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <TabsList>
                <TabsTrigger value="growth" className="px-3">
                  本金與報酬
                </TabsTrigger>
                <TabsTrigger value="scenario" className="px-3">
                  報酬率情境
                </TabsTrigger>
                <TabsTrigger value="table" className="px-3">
                  逐年明細
                </TabsTrigger>
              </TabsList>
              {showReal ? <Badge variant="outline">已扣除通膨 {percent(state.inflation)}</Badge> : null}
            </div>

            <TabsContent value="growth">
              <ChartContainer config={growthConfig} className="aspect-auto h-[300px] w-full sm:h-[340px]">
                <AreaChart data={chartData} margin={{ left: 4, right: 12, top: 12 }}>
                  <defs>
                    <linearGradient id="fill-contributed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-contributed)" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="var(--color-contributed)" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="fill-gains" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-gains)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="var(--color-gains)" stopOpacity={0.55} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(v) => (v === 0 ? "現在" : `${v}年`)}
                    minTickGap={24}
                  />
                  <YAxis tickLine={false} axisLine={false} width={64} tickFormatter={(v) => compactMoney(v)} />
                  <ChartTooltip cursor={{ strokeDasharray: "4 4" }} content={<GrowthTooltip />} />
                  {crossover ? (
                    <ReferenceLine
                      x={crossover}
                      stroke="#1b2430"
                      strokeDasharray="4 4"
                      label={{ value: "報酬超過投入", position: "insideTopLeft", fontSize: 11, fill: "#1b2430" }}
                    />
                  ) : null}
                  <Area
                    dataKey="contributed"
                    type="monotone"
                    stackId="a"
                    stroke="var(--color-contributed)"
                    fill="url(#fill-contributed)"
                    isAnimationActive={false}
                  />
                  <Area
                    dataKey="gains"
                    type="monotone"
                    stackId="a"
                    stroke="var(--color-gains)"
                    fill="url(#fill-gains)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ChartContainer>
              <Legend items={[growthConfig.contributed, growthConfig.gains]} />
            </TabsContent>

            <TabsContent value="scenario">
              <ChartContainer config={scenarioConfig} className="aspect-auto h-[300px] w-full sm:h-[340px]">
                <LineChart data={scenarioData} margin={{ left: 4, right: 12, top: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(v) => (v === 0 ? "現在" : `${v}年`)}
                    minTickGap={24}
                  />
                  <YAxis tickLine={false} axisLine={false} width={64} tickFormatter={(v) => compactMoney(v)} />
                  <ChartTooltip
                    cursor={{ strokeDasharray: "4 4" }}
                    content={
                      <ScenarioTooltip
                        labels={{
                          high: `${percent(highRate)}`,
                          base: `${percent(state.annualRate)}（你的設定）`,
                          low: `${percent(lowRate)}`,
                          principal: "0%，只存不投資",
                        }}
                      />
                    }
                  />
                  <Line dataKey="principal" stroke="var(--color-principal)" strokeDasharray="5 5" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  <Line dataKey="low" stroke="var(--color-low)" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line dataKey="high" stroke="var(--color-high)" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line dataKey="base" stroke="var(--color-base)" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ChartContainer>
              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                {[
                  { key: "principal", label: "只存不投資", value: scenarioData.at(-1)!.principal, color: scenarioConfig.principal.color },
                  { key: "low", label: `年化 ${percent(lowRate)}`, value: scenarioData.at(-1)!.low, color: scenarioConfig.low.color },
                  { key: "base", label: `年化 ${percent(state.annualRate)}`, value: scenarioData.at(-1)!.base, color: scenarioConfig.base.color },
                  { key: "high", label: `年化 ${percent(highRate)}`, value: scenarioData.at(-1)!.high, color: scenarioConfig.high.color },
                ].map((s) => (
                  <div key={s.key} className="rounded-lg border border-border bg-card px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="size-2 rounded-full" style={{ background: s.color }} />
                      {s.label}
                    </div>
                    <div className="mt-0.5 font-semibold tabular-nums">{money(s.value)}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                上下各差 2 個百分點。差距會隨年數放大，所以長期試算對報酬率特別敏感。
              </p>
            </TabsContent>

            <TabsContent value="table">
              <div className="max-h-[380px] overflow-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-secondary text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2.5 text-left font-medium">年</th>
                      <th className="hidden px-3 py-2.5 text-right font-medium sm:table-cell">當年每月</th>
                      <th className="px-3 py-2.5 text-right font-medium">累計本金</th>
                      <th className="px-3 py-2.5 text-right font-medium">累積報酬</th>
                      <th className="px-3 py-2.5 text-right font-medium">{showReal ? "今日幣值" : "期末金額"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(1).map((r) => (
                      <tr key={r.year} className={cn("border-t border-border bg-card", r.year === crossover && "bg-[#e95420]/[0.06]")}>
                        <td className="px-3 py-2 tabular-nums">{r.year}</td>
                        <td className="hidden px-3 py-2 text-right tabular-nums text-muted-foreground sm:table-cell">
                          {money(r.monthlyThisYear)}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{money(deflate(r, r.contributed))}</td>
                        <td className={cn("px-3 py-2 text-right tabular-nums", r.gains < 0 ? "text-destructive" : "text-[#c2410c]")}>
                          {money(deflate(r, r.gains))}
                        </td>
                        <td className="px-3 py-2 text-right font-medium tabular-nums">{money(deflate(r, r.balance))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length <= 1 ? <div className="p-6 text-center text-sm text-muted-foreground">投資年數設 1 年以上才有明細。</div> : null}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">CSV 一律是名目金額，另附一欄今日幣值。</p>
                <Button variant="outline" size="sm" onClick={downloadCsv} disabled={rows.length <= 1}>
                  <Download /> 下載 CSV
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Target className="size-4 text-[#0f6e6a]" /> 目標金額
              </div>
              <NumberField id="target" label="想存到" value={target} onChange={setTarget} prefix="NT$" className="mt-3" />
              <div className="mt-3 grid gap-2 text-[13px] leading-relaxed">
                <p>
                  {reachIn === 0 ? (
                    "單筆投入就已經超過目標。"
                  ) : reachIn ? (
                    <>
                      照現在的設定，約 <span className="font-semibold">{duration(reachIn)}</span> 到達。
                    </>
                  ) : (
                    "照現在的設定，80 年內到不了。"
                  )}
                </p>
                <p>
                  {state.years <= 0 ? (
                    "設定投資年數後，會算出每月要投入多少。"
                  ) : needed === null ? (
                    `${state.years} 年內到不了，調高報酬率或拉長年數。`
                  ) : needed === 0 ? (
                    `單筆投入在 ${state.years} 年內就會長到目標，不需要每月再投入。`
                  ) : (
                    <>
                      想在 {state.years} 年內到，每月要投入{" "}
                      <span className="font-semibold tabular-nums">NT$ {money(needed)}</span>
                      {state.monthly > 0 ? (
                        <span className="text-muted-foreground">
                          （現在是 {money(state.monthly)}
                          {needed > state.monthly ? `，差 ${money(needed - state.monthly)}` : "，已經夠了"}）
                        </span>
                      ) : null}
                      。
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="grid content-start gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="size-4 text-[#e95420]" /> 從結果看出來的事
              </div>
              <Insight>
                {crossover ? (
                  <>
                    第 <span className="font-semibold">{crossover}</span> 年起，一年的報酬會超過你當年投入的錢。圖上的虛線就是這個點。
                  </>
                ) : state.monthly > 0 ? (
                  `${state.years} 年內，每年的報酬都還追不上當年投入的錢，主要靠本金在長。`
                ) : (
                  "只有單筆投入時，資產完全靠報酬成長。"
                )}
              </Insight>
              <Insight>
                {r72 && exact ? (
                  <>
                    72 法則：年化 {percent(state.annualRate)} 時，一筆錢約 <span className="font-semibold">{r72.toFixed(1)} 年</span>
                    翻倍（精算是 {exact.toFixed(1)} 年）。
                  </>
                ) : (
                  "報酬率為 0 或負數時，錢不會翻倍。"
                )}
              </Insight>
              <Insight>
                通膨 {percent(state.inflation)} 時，{state.years} 年後的 {compactMoney(last.balance)}，約等於今天的{" "}
                <span className="font-semibold">{compactMoney(last.realBalance)}</span>。
              </Insight>
            </div>
          </div>

          <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            年化報酬率當作每年實際複利，換成每月複利計算，不含手續費、稅和匯率。報酬率是你填的假設，實際投資會有起伏、也可能虧損，這裡的結果不是預測或投資建議。
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({
  label,
  value,
  text,
  sub,
  tone,
  emphasis,
  className,
}: {
  label: string
  value?: number
  text?: string
  sub?: string
  tone?: string
  emphasis?: boolean
  className?: string
}) {
  const display = text ?? (value !== undefined ? money(value) : "—")
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl px-4 py-3.5",
        emphasis ? "col-span-2 bg-primary px-5 py-4 text-primary-foreground sm:col-span-3" : "border border-border bg-card",
        className,
      )}
    >
      <div className={cn("flex items-center gap-1.5 truncate text-xs", emphasis ? "text-primary-foreground/70" : "text-muted-foreground")}>
        {tone ? <span className="size-2 shrink-0 rounded-full" style={{ background: tone }} /> : null}
        {label}
      </div>
      <Tooltip>
        <TooltipTrigger
          render={
            <div
              className={cn(
                "mt-1 truncate font-semibold tabular-nums",
                emphasis ? "text-3xl sm:text-4xl" : "text-lg sm:text-xl",
              )}
            />
          }
        >
          {text ? display : `${emphasis ? "NT$ " : ""}${display}`}
        </TooltipTrigger>
        <TooltipContent>{text ?? `NT$ ${display}`}</TooltipContent>
      </Tooltip>
      {sub ? <div className={cn("text-xs", emphasis ? "text-primary-foreground/60" : "text-muted-foreground")}>{sub}</div> : null}
    </div>
  )
}

function Insight({ children }: { children: React.ReactNode }) {
  return <p className="border-l-2 border-border pl-3 text-[13px] leading-relaxed">{children}</p>
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

type TooltipPayload = { dataKey?: string | number; value?: number; payload?: Record<string, number> }

function GrowthTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload ?? {}
  return (
    <div className="grid min-w-44 gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <div className="font-medium">{row.year === 0 ? "現在" : `第 ${row.year} 年底`}</div>
      <Row color={growthConfig.contributed.color} label="投入本金" value={row.contributed} />
      <Row color={growthConfig.gains.color} label="累積報酬" value={row.loss < 0 ? row.loss : row.gains} />
      <div className="mt-0.5 flex justify-between border-t border-border pt-1.5 font-semibold">
        <span>合計</span>
        <span className="tabular-nums">{money(row.balance)}</span>
      </div>
    </div>
  )
}

function ScenarioTooltip({
  active,
  payload,
  labels,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  labels: Record<string, string>
}) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload ?? {}
  const order = ["high", "base", "low", "principal"] as const
  return (
    <div className="grid min-w-52 gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <div className="font-medium">{row.year === 0 ? "現在" : `第 ${row.year} 年底`}</div>
      {order.map((key) => (
        <Row key={key} color={scenarioConfig[key].color} label={labels[key]} value={row[key]} />
      ))}
    </div>
  )
}

function Row({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <span className="size-2 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="font-medium tabular-nums">{money(value)}</span>
    </div>
  )
}
