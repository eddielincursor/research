"use client"

import * as React from "react"
import { ArrowDownRight, CircleAlert, CircleCheck, Lightbulb, RotateCcw, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { NumberField } from "@/components/number-field"
import {
  KIND_COLOR,
  METHODS,
  allocate,
  getMethod,
  recommend,
  sumKinds,
  weightSum,
  type Allocation,
  type BucketDef,
  type MethodId,
} from "@/lib/budget"
import { duration, money, percent } from "@/lib/format"
import { cn } from "@/lib/utils"

type BudgetPlannerProps = {
  onSendToInvest: (monthly: number) => void
}

function toPercentBuckets(buckets: BucketDef[]): BucketDef[] {
  const total = weightSum(buckets)
  return buckets
    .filter((b) => b.kind !== "unassigned")
    .map((b) => ({ ...b, weight: total > 0 ? Math.round((b.weight / total) * 1000) / 10 : 0 }))
}

export function BudgetPlanner({ onSendToInvest }: BudgetPlannerProps) {
  const [income, setIncome] = React.useState(50000)
  const [essentials, setEssentials] = React.useState(30000)
  const [methodId, setMethodId] = React.useState<MethodId>("631")
  const [custom, setCustom] = React.useState<BucketDef[]>(() => getMethod("custom").buckets)
  const [customTouched, setCustomTouched] = React.useState(false)
  const [fundMonths, setFundMonths] = React.useState(3)
  const [fundSaved, setFundSaved] = React.useState(0)

  const customSum = Math.round(weightSum(custom) * 10) / 10
  const buckets = React.useMemo<BucketDef[]>(() => {
    if (methodId !== "custom") return getMethod(methodId).buckets
    if (customSum < 100) {
      return [
        ...custom,
        { key: "unassigned", label: "尚未分配", weight: 100 - customSum, kind: "unassigned", hint: "比例加總不到 100%" },
      ]
    }
    return custom
  }, [methodId, custom, customSum])

  const allocations = React.useMemo(() => allocate(income, buckets), [income, buckets])
  const living = sumKinds(allocations, ["living"])
  const investMonthly = sumKinds(allocations, ["invest"])
  const towardFund = sumKinds(allocations, ["invest", "saving", "risk"])
  const rec = recommend(income, essentials)
  const essentialRatio = income > 0 ? essentials / income : 0
  const gap = essentials > 0 ? living - essentials : null

  const fundTarget = (essentials > 0 ? essentials : living) * fundMonths
  const fundRemaining = Math.max(0, fundTarget - fundSaved)
  const fundMonthsNeeded = towardFund > 0 ? Math.ceil(fundRemaining / towardFund) : null

  const selectMethod = (id: MethodId) => {
    if (id === "custom" && !customTouched && methodId !== "custom") {
      setCustom(toPercentBuckets(getMethod(methodId).buckets))
    }
    setMethodId(id)
  }

  const updateCustom = (key: string, weight: number) => {
    setCustomTouched(true)
    setCustom((prev) => prev.map((b) => (b.key === key ? { ...b, weight } : b)))
  }

  return (
    <Card className="overflow-visible border-0 py-0 shadow-[0_1px_0_rgba(27,36,48,0.04),0_12px_40px_-24px_rgba(27,36,48,0.35)] ring-1 ring-border">
      <CardHeader className="gap-2 border-b border-border px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">1</span>
          <CardTitle className="text-xl font-semibold tracking-tight">財務規劃表</CardTitle>
        </div>
        <CardDescription className="max-w-2xl text-[15px] leading-relaxed">
          填稅後月收入和每個月非付不可的開銷，選一種分法。每一格要放多少錢、生活費裝不裝得下，會直接算出來。
        </CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-8 px-5 py-6 sm:px-7 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-10">
        <div className="grid content-start gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <NumberField
              id="income"
              label="稅後月收入"
              value={income}
              onChange={setIncome}
              prefix="NT$"
              size="lg"
              max={100_000_000}
              hint="實際入帳的金額，不是年薪換算。"
            />
            <NumberField
              id="essentials"
              label="每月必要開銷"
              value={essentials}
              onChange={setEssentials}
              prefix="NT$"
              max={100_000_000}
              hint={
                essentials > 0 && income > 0 ? (
                  <>
                    佔收入 <span className="font-medium text-foreground">{percent(essentialRatio)}</span>
                    。房租、伙食、交通、帳單加起來。
                  </>
                ) : (
                  "房租、伙食、交通、帳單加起來。不填也能算，只是不會檢查裝不裝得下。"
                )
              }
            />
          </div>

          <div className="grid gap-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-medium text-foreground/80">理財方法</span>
              {rec?.method ? (
                <span className="text-xs text-muted-foreground">
                  依你的開銷佔比，建議 <span className="font-medium text-foreground">{getMethod(rec.method).name}</span>
                </span>
              ) : null}
            </div>
            <div role="radiogroup" aria-label="理財方法" className="grid grid-cols-2 gap-2">
              {METHODS.map((method) => {
                const active = method.id === methodId
                const suggested = rec?.method === method.id
                return (
                  <button
                    key={method.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => selectMethod(method.id)}
                    className={cn(
                      "group relative rounded-lg border px-3 py-2.5 text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card hover:border-foreground/30",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{method.name}</span>
                      {suggested ? (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-px text-[10px] font-medium",
                            active ? "bg-primary-foreground/15 text-primary-foreground" : "bg-[#0f6e6a]/10 text-[#0f6e6a]",
                          )}
                        >
                          建議
                        </span>
                      ) : null}
                    </div>
                    <div className={cn("mt-0.5 text-xs tabular-nums", active ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {method.ratio}
                    </div>
                  </button>
                )
              })}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{getMethod(methodId).summary}</p>
          </div>

          {methodId === "custom" ? (
            <div className="grid gap-3 rounded-lg border border-dashed border-input bg-secondary/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">自訂比例</span>
                <span
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    customSum === 100 ? "text-[#1e7a46]" : "text-destructive",
                  )}
                >
                  加總 {customSum}%
                  {customSum < 100 ? `，還差 ${Math.round((100 - customSum) * 10) / 10}%` : null}
                  {customSum > 100 ? `，多了 ${Math.round((customSum - 100) * 10) / 10}%` : null}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {custom.map((b) => (
                  <NumberField
                    key={b.key}
                    id={`custom-${b.key}`}
                    label={b.label}
                    value={b.weight}
                    decimals={1}
                    min={0}
                    max={100}
                    suffix="%"
                    onChange={(v) => updateCustom(b.key, v)}
                  />
                ))}
              </div>
              {customSum > 100 ? (
                <p className="text-xs text-destructive">超過 100% 時，下面的金額會依比例縮回收入總額。</p>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                className="justify-self-start"
                onClick={() => {
                  setCustom(getMethod("custom").buckets)
                  setCustomTouched(false)
                }}
              >
                <RotateCcw /> 還原預設
              </Button>
            </div>
          ) : null}
        </div>

        <div className="grid min-w-0 content-start gap-6">
          <AllocationBar allocations={allocations} income={income} essentials={essentials} />

          {gap !== null && income > 0 ? <FitCallout gap={gap} living={living} essentials={essentials} /> : null}

          <AllocationTable allocations={allocations} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="size-4 text-[#5e2750]" /> 緊急預備金
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">目標</span>
                <ToggleGroup
                  value={[String(fundMonths)]}
                  onValueChange={(v: string[]) => v[0] && setFundMonths(Number(v[0]))}
                  variant="outline"
                  size="sm"
                  spacing={0}
                >
                  <ToggleGroupItem value="3">3 個月</ToggleGroupItem>
                  <ToggleGroupItem value="6">6 個月</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="mt-3 text-2xl font-semibold tabular-nums">NT$ {money(fundTarget)}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {essentials > 0 ? "必要開銷" : "生活格"} × {fundMonths} 個月。收入不穩或家裡只有你一份薪水，選 6 個月。
              </p>
              <Separator className="my-3" />
              <NumberField id="fund-saved" label="已經存了" value={fundSaved} onChange={setFundSaved} prefix="NT$" />
              <p className="mt-2.5 text-[13px] leading-relaxed">
                {fundRemaining <= 0 ? (
                  <span className="font-medium text-[#1e7a46]">已經存滿，投資那一格可以開始投入。</span>
                ) : fundMonthsNeeded ? (
                  <>
                    暫停投資，把儲蓄、投資、風險格每月共{" "}
                    <span className="font-medium tabular-nums">{money(towardFund)}</span> 先拿來存，約{" "}
                    <span className="font-semibold">{duration(fundMonthsNeeded)}</span> 存滿。
                  </>
                ) : (
                  "這個分法沒有可以存錢的格子。"
                )}
              </p>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-xl bg-primary p-4 text-primary-foreground">
              <div>
                <div className="text-sm font-semibold">接到投資計算機</div>
                <p className="mt-1 text-xs leading-relaxed text-primary-foreground/70">
                  把「{allocations.filter((a) => a.kind === "invest").map((a) => a.label).join("、") || "投資"}」這格的金額，當作每月投入去試算。
                </p>
                <div className="mt-3 text-3xl font-semibold tabular-nums">NT$ {money(investMonthly)}</div>
                <div className="text-xs text-primary-foreground/60">每月</div>
              </div>
              <Button
                size="lg"
                disabled={investMonthly <= 0}
                onClick={() => onSendToInvest(investMonthly)}
                className="h-10 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                帶入並開始試算 <ArrowDownRight />
              </Button>
            </div>
          </div>

          {rec ? <RecommendationNote rec={rec} /> : null}

          <MethodComparison income={income} essentials={essentials} activeId={methodId} onSelect={selectMethod} />
        </div>
      </CardContent>
    </Card>
  )
}

function AllocationBar({
  allocations,
  income,
  essentials,
}: {
  allocations: Allocation[]
  income: number
  essentials: number
}) {
  const markerPct = income > 0 && essentials > 0 ? Math.min(100, (essentials / income) * 100) : null
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-sm text-muted-foreground">每月這樣分</div>
        <div className="text-sm tabular-nums text-muted-foreground">
          合計 <span className="font-semibold text-foreground">NT$ {money(income)}</span>
        </div>
      </div>
      <div className="relative mt-3 pb-6">
        <div className="flex h-12 w-full overflow-hidden rounded-lg bg-secondary">
          {allocations.map((a) =>
            a.share > 0 ? (
              <div
                key={a.key}
                className="flex min-w-0 items-center justify-center text-[11px] font-medium text-white transition-[width] duration-300 sm:text-xs"
                style={{ width: `${a.share * 100}%`, background: KIND_COLOR[a.kind] }}
                title={`${a.label} ${money(a.monthly)}`}
              >
                <span className="truncate px-1.5">{a.share >= 0.12 ? a.label : a.share >= 0.07 ? percent(a.share, 0) : ""}</span>
              </div>
            ) : null,
          )}
        </div>
        {markerPct !== null ? (
          <div className="pointer-events-none absolute top-[-6px] bottom-0" style={{ left: `${markerPct}%` }}>
            <div className="h-[60px] w-0.5 -translate-x-1/2 bg-destructive" />
            <div
              className={cn(
                "absolute top-[60px] mt-1 text-[11px] font-medium whitespace-nowrap text-destructive",
                markerPct > 75 ? "right-1" : "left-1",
              )}
            >
              必要開銷 {money(essentials)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function FitCallout({ gap, living, essentials }: { gap: number; living: number; essentials: number }) {
  if (gap >= 0) {
    return (
      <div className="flex gap-3 rounded-lg border border-[#1e7a46]/25 bg-[#1e7a46]/[0.06] p-3.5">
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-[#1e7a46]" />
        <div className="text-sm leading-relaxed">
          <span className="font-semibold">生活格裝得下。</span> 生活格 {money(living)}，必要開銷 {money(essentials)}
          {gap > 0 ? `，每月多 ${money(gap)} 可以彈性使用。` : "，剛好打平，沒有餘裕。"}
        </div>
      </div>
    )
  }
  return (
    <div className="flex gap-3 rounded-lg border border-destructive/25 bg-destructive/[0.06] p-3.5">
      <CircleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div className="text-sm leading-relaxed">
        <span className="font-semibold">生活格少了 {money(-gap)}。</span> 這個比例只給生活 {money(living)}
        ，你的必要開銷是 {money(essentials)}。照這樣分，月底會從其他格倒扣。換一種分法，或先降固定支出。
      </div>
    </div>
  )
}

function AllocationTable({ allocations }: { allocations: Allocation[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary/60 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 text-left font-medium">格子</th>
            <th className="px-2 py-2.5 text-right font-medium">比例</th>
            <th className="px-2 py-2.5 text-right font-medium">每月</th>
            <th className="hidden px-4 py-2.5 text-right font-medium sm:table-cell">每年</th>
          </tr>
        </thead>
        <tbody>
          {allocations.map((a) => (
            <tr key={a.key} className="border-t border-border bg-card">
              <td className="px-4 py-3">
                <div className="flex items-start gap-2.5">
                  <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: KIND_COLOR[a.kind] }} />
                  <div className="min-w-0">
                    <div className="font-medium">{a.label}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.hint}</div>
                  </div>
                </div>
              </td>
              <td className="px-2 py-3 text-right tabular-nums text-muted-foreground">{percent(a.share)}</td>
              <td className="px-2 py-3 text-right text-[15px] font-semibold tabular-nums">{money(a.monthly)}</td>
              <td className="hidden px-4 py-3 text-right tabular-nums text-muted-foreground sm:table-cell">{money(a.yearly)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecommendationNote({ rec }: { rec: NonNullable<ReturnType<typeof recommend>> }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg p-3.5",
        rec.level === "danger" ? "bg-destructive/[0.07]" : "bg-[#a87014]/[0.08]",
      )}
    >
      <Lightbulb className={cn("mt-0.5 size-5 shrink-0", rec.level === "danger" ? "text-destructive" : "text-[#a87014]")} />
      <div className="text-sm leading-relaxed">
        <span className="font-semibold">{rec.title}。</span> {rec.body}
      </div>
    </div>
  )
}

function MethodComparison({
  income,
  essentials,
  activeId,
  onSelect,
}: {
  income: number
  essentials: number
  activeId: MethodId
  onSelect: (id: MethodId) => void
}) {
  const rows = METHODS.filter((m) => m.id !== "custom").map((m) => {
    const alloc = allocate(income, m.buckets)
    return {
      method: m,
      living: sumKinds(alloc, ["living"]),
      invest: sumKinds(alloc, ["invest"]),
    }
  })
  return (
    <div>
      <div className="mb-2.5 flex items-baseline justify-between">
        <div className="text-sm font-semibold">同一筆收入，五種分法一起看</div>
        <div className="text-xs text-muted-foreground">點一列就切換</div>
      </div>
      <div className="grid gap-1.5">
        {rows.map(({ method, living, invest }) => {
          const fits = essentials <= 0 ? null : living >= essentials
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={cn(
                "grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-lg border px-3.5 py-2.5 text-left transition-colors sm:grid-cols-[150px_1fr_1fr_auto]",
                method.id === activeId ? "border-primary/50 bg-secondary" : "border-border bg-card hover:bg-secondary/50",
              )}
            >
              <span className="text-sm font-medium">{method.name}</span>
              <span className="order-last col-span-2 text-xs text-muted-foreground tabular-nums sm:order-none sm:col-span-1 sm:text-sm">
                生活 <span className="text-foreground">{money(living)}</span>
              </span>
              <span className="order-last col-span-2 text-xs text-muted-foreground tabular-nums sm:order-none sm:col-span-1 sm:text-sm">
                投資 <span className="text-foreground">{money(invest)}</span>
              </span>
              {fits === null ? (
                <Badge variant="outline">未填開銷</Badge>
              ) : fits ? (
                <Badge className="bg-[#1e7a46]/10 text-[#1e7a46]">裝得下</Badge>
              ) : (
                <Badge className="bg-destructive/10 text-destructive">差 {money(essentials - living)}</Badge>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
