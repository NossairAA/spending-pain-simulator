"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

interface UserProfile {
  hourlyWage: number
  workingDaysPerYear: number
  monthlyExpenses: number
  emergencyFundGoal?: number
  freedomGoal?: number
  investmentReturn?: number
}

interface SetupFormProps {
  onComplete: (profile: UserProfile) => void
}

export function SetupForm({ onComplete }: SetupFormProps) {
  const [inputType, setInputType] = useState<"hourly" | "monthly">("monthly")
  const [inputValue, setInputValue] = useState("")
  const [workingDays, setWorkingDays] = useState("220")

  // Advanced settings (optional)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [monthlyExpenses, setMonthlyExpenses] = useState("")

  const canSubmit = !!inputValue

  function handleSubmit() {
    if (!canSubmit) return

    let hourly = 0
    let expenses = 0

    // Calculate hourly wage
    if (inputType === "hourly") {
      hourly = parseFloat(inputValue)
    } else {
      // Monthly -> Hourly
      // Standard: 8 hours * 21.6 days (avg month) = ~173 hours
      // Or simply: Monthly / (WorkingDays / 12 * 8)
      const daysPerYear = parseInt(workingDays) || 220
      const hoursPerYear = daysPerYear * 8
      const annualIncome = parseFloat(inputValue) * 12
      hourly = annualIncome / hoursPerYear
    }

    // Default expenses if not provided (assume 80% of income if monthly provided, or just 0)
    if (monthlyExpenses) {
      expenses = parseFloat(monthlyExpenses)
    } else {
      // Estimate based on income if possible
      if (inputType === "monthly") {
        expenses = parseFloat(inputValue) * 0.8
      } else {
        // If hourly, estimate monthly: Hourly * 8 * 21.6 * 0.8
        expenses = (parseFloat(inputValue) * 8 * 21.6) * 0.8
      }
    }

    onComplete({
      hourlyWage: Math.round(hourly * 100) / 100,
      workingDaysPerYear: parseInt(workingDays) || 220,
      monthlyExpenses: Math.round(expenses),
    })
  }

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
          Let&apos;s get personal
        </h1>
        <p className="max-w-md text-muted-foreground leading-relaxed">
          We need a baseline to calculate your &quot;Spending Pain&quot;.
          Only 2 numbers required.
        </p>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Income Input */}
        <div className="space-y-3">
          <div className="flex rounded-lg bg-secondary/50 p-1">
            <button
              onClick={() => { setInputType("monthly"); setInputValue("") }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${inputType === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Monthly Income
            </button>
            <button
              onClick={() => { setInputType("hourly"); setInputValue("") }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${inputType === "hourly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Hourly Wage
            </button>
          </div>

          <div className="group relative">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                {inputType === "monthly" ? "€" : "$"}
              </span>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputType === "monthly" ? "3000" : "25"}
                className="w-full rounded-xl border border-border bg-card py-4 pl-10 pr-4 text-lg text-foreground placeholder:text-muted-foreground/40 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground ml-1">
              {inputType === "monthly" ? "Net income after tax (take-home pay)" : "Net hourly wage after tax"}
            </p>
          </div>
        </div>

        {/* Working Days */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground ml-1">
            Days worked per year
          </label>
          <input
            type="number"
            value={workingDays}
            onChange={(e) => setWorkingDays(e.target.value)}
            placeholder="220"
            className="w-full rounded-xl border border-border bg-card py-3 px-4 text-foreground placeholder:text-muted-foreground/40 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-xs text-muted-foreground ml-1">
            Standard full-time is ~220 days
          </p>
        </div>

        {/* Advanced Toggle */}
        <div className="pt-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {showAdvanced ? "Hide advanced settings" : "Improve accuracy (optional)"}
            <ArrowRight className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-90" : ""}`} />
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 rounded-2xl border border-border/50 bg-secondary/20 p-4 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Monthly Expenses
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                  <input
                    type="number"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    placeholder="2000"
                    className="w-full rounded-lg border border-border bg-background py-2 pl-7 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to estimate based on income
                </p>
              </div>

            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-2xl bg-primary py-4 font-display text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
        >
          Start Spending Pain
        </button>
      </div>
    </div >
  )
}
