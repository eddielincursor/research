"use client"

import * as React from "react"
import { BudgetPlanner } from "@/components/budget-planner"
import { InvestmentCalculator, type CalculatorState } from "@/components/investment-calculator"

const INITIAL: CalculatorState = {
  initial: 100_000,
  monthly: 15_000,
  annualRate: 0.06,
  years: 20,
  timing: "end",
  stepUp: 0,
  inflation: 0.02,
  fromBudget: false,
}

export function FinanceTools() {
  const [calc, setCalc] = React.useState<CalculatorState>(INITIAL)
  const calcRef = React.useRef<HTMLElement>(null)

  const sendToInvest = (monthly: number) => {
    setCalc((prev) => ({ ...prev, monthly, fromBudget: true }))
    calcRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="grid gap-8">
      <section id="budget" className="scroll-mt-20">
        <BudgetPlanner onSendToInvest={sendToInvest} />
      </section>
      <section id="invest" ref={calcRef} className="scroll-mt-20">
        <InvestmentCalculator state={calc} onChange={setCalc} />
      </section>
    </div>
  )
}
