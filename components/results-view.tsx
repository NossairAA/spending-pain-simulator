"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import {
  TrendingUp,
  ShoppingCart,
  ShieldCheck,
  RotateCcw,
  Zap,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { savePurchaseHistory, saveGuestPurchaseHistory } from "@/lib/purchase-history"
import { logger } from "@/lib/logger"

interface UserProfile {
  hourlyWage: number
  workingDaysPerYear: number
  monthlyExpenses: number
  emergencyFundGoal?: number
  freedomGoal?: number
}

function GoalProgressCard({
  title,
  icon,
  color, // tailwind class for bg color
  price,
  goal,
  description
}: {
  title: string
  icon: React.ReactNode
  color: string
  price: number
  goal: number
  description: string
}) {
  const percentage = (price / goal) * 100
  // "Equivalence" - how much of the goal this represents
  const displayPercentage = percentage < 0.01
    ? "< 0.01%"
    : `${percentage.toFixed(2)}%`

  // For visual bar, cap at 100%
  const barWidth = Math.min(percentage, 100)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-secondary p-1.5">
            {icon}
          </div>
          <p className="font-medium text-foreground">{title}</p>
        </div>
        <p className="font-display font-bold text-lg text-foreground">
          {displayPercentage}
        </p>
      </div>

      {/* Progress Bar Container - Represents the Goal */}
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary/50">
        {/* The chunk this purchase represents */}
        <div
          className={`absolute left-0 top-0 h-full ${color} opacity-80`}
          style={{ width: `${Math.max(barWidth, 1)}%` }} // Ensure at least a sliver is visible if > 0
        />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        This amount is equivalent to <span className="font-medium text-foreground">{displayPercentage}</span> {description}.
      </p>
    </div>
  )
}

interface ResultsViewProps {
  price: number
  label: string
  category: string
  profile: UserProfile
  onNewPrice: () => void
  preventSave?: boolean
}

function formatTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const mins = Math.round(totalMinutes % 60)
  if (hours === 0) return `${mins}min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

function ComparisonCard({
  icon,
  color,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode
  color: string
  title: string
  value: string
  subtitle: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:border-border/80 hover:shadow-lg">
      <div className={`mb-3 inline-flex rounded-xl p-2.5 ${color}`}>
        {icon}
      </div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <p className="font-display text-2xl font-bold text-foreground leading-tight">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
        {subtitle}
      </p>
    </div>
  )
}

export function ResultsView({ price, label, category, profile, onNewPrice, preventSave }: ResultsViewProps) {
  const [regretAnswer, setRegretAnswer] = useState<string | null>(null)
  const { user, isGuest } = useAuth()
  const savedKey = useRef<string>("")

  // Auto-save purchase history when results are shown (only once per unique price+label)
  useEffect(() => {
    async function saveHistory() {
      // Skip saving if preventSave is true
      if (preventSave) {
        return
      }

      // Create a key for the current price and label combination
      const currentPriceLabelKey = `${price}-${label}`

      // Prevent duplicate saves for the same price+label combination
      if (savedKey.current === currentPriceLabelKey) {
        logger.debug("results", "Skipping save because purchase already persisted")
        return
      }

      // Update the savedKey to prevent future duplicate saves for this combination
      savedKey.current = currentPriceLabelKey

      logger.debug("results", "Starting purchase history save", {
        userId: user?.uid ?? null,
        isGuest,
      })

      try {
        const now = new Date()
        const purchase = {
          price,
          label,
          category,
          profile,
          calculations: {
            timeInMinutes: Math.round((price / profile.hourlyWage) * 60),
            groceryWeeks: Math.round((price / profile.monthlyExpenses) * 4),
            emergencyDays: Math.round(price / (profile.monthlyExpenses / 30)),
          },
          decision: "undecided" as const,
          timeOfDay: now.getHours(), // Track time of day for patterns
        }

        logger.debug("results", "Built purchase data", purchase)

        if (user) {
          logger.debug("results", "Saving purchase to Firestore", user.uid)
          await savePurchaseHistory(user.uid, purchase)
          logger.info("results", "Purchase saved to Firestore")
        } else if (isGuest) {
          logger.debug("results", "Saving purchase to guest localStorage")
          saveGuestPurchaseHistory(purchase)
          logger.info("results", "Purchase saved to localStorage")
        } else {
          logger.warn("results", "No user or guest, cannot save purchase history")
        }
      } catch (error) {
        logger.error("results", "Failed to save purchase history", error)
        if (error instanceof Error) {
          logger.error("results", "Purchase save error message", error.message)
          logger.error("results", "Purchase save error stack", error.stack)
        }
      }
    }

    saveHistory()
  }, [price, label, category, profile, user, isGuest, preventSave])

  // Time cost
  const totalMinutes = (price / profile.hourlyWage) * 60
  const workdayHours = 8
  const workdayFraction = totalMinutes / (workdayHours * 60)

  let timeContext: string
  if (workdayFraction < 0.25) {
    timeContext = "A quick coffee break of your life"
  } else if (workdayFraction < 0.5) {
    timeContext = "A solid chunk of your morning"
  } else if (workdayFraction < 1) {
    timeContext = `That's ${Math.round(workdayFraction * 100)}% of a full workday`
  } else {
    timeContext = `That's ${workdayFraction.toFixed(1)} full workdays of your life`
  }

  // Life equivalences — personalized based on monthly expenses
  const emergencyBufferDays = Math.round((price / (profile.monthlyExpenses / 30)) * 10) / 10
  const monthsOfExpenses = Math.round((price / profile.monthlyExpenses) * 100) / 100
  const weeksOfGroceries = Math.round((price / (profile.monthlyExpenses * 0.15 / 4)) * 10) / 10
  const daysOfUtilities = Math.round((price / 7) * 10) / 10

  return (
    <div className="flex flex-col gap-8 px-4 py-10">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          The real cost of
        </p>
        <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl text-balance">
          {label}
        </h2>
        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent/15 px-4 py-1.5">
          <span className="font-display text-xl font-bold text-accent">
            {"€"}{price.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Time Cost */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="h-1 w-6 rounded-full bg-primary" />
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-primary">
            Time Cost
          </h3>
        </div>
        <div className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <p className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            {"This costs "}{formatTime(totalMinutes)}{" of your life after taxes"}
          </p>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            {timeContext}. That is {formatTime(totalMinutes)} you will never get back.
          </p>
        </div>
      </section>

      {/* Financial Goals Impact */}
      {(profile.emergencyFundGoal || profile.freedomGoal) && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-[hsl(var(--chart-2))]" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[hsl(var(--chart-2))]">
              Goal Equivalence
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-1">
            {profile.emergencyFundGoal && (
              <GoalProgressCard
                title="Emergency Fund"
                icon={<ShieldCheck className="h-5 w-5 text-primary" />}
                color="bg-primary"
                price={price}
                goal={profile.emergencyFundGoal}
                description="of your safety net target"
              />
            )}

            {profile.freedomGoal && (
              <GoalProgressCard
                title="Future Freedom"
                icon={<TrendingUp className="h-5 w-5 text-[hsl(var(--chart-4))]" />}
                color="bg-[hsl(var(--chart-4))]"
                price={price}
                goal={profile.freedomGoal}
                description="of your freedom fund"
              />
            )}
          </div>
        </section>
      )}

      {/* Life Equivalences */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="h-1 w-6 rounded-full bg-accent" />
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-accent">
            What This Really Means
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ComparisonCard
            icon={<ShieldCheck className="h-5 w-5 text-primary" />}
            color="bg-primary/10"
            title="Emergency Buffer"
            value={`${emergencyBufferDays} days`}
            subtitle="Of financial safety and peace of mind"
          />
          <ComparisonCard
            icon={<ShoppingCart className="h-5 w-5 text-accent" />}
            color="bg-accent/10"
            title="Monthly Expenses"
            value={monthsOfExpenses >= 1 ? `${monthsOfExpenses.toFixed(1)} months` : `${Math.round(monthsOfExpenses * 100)}%`}
            subtitle={monthsOfExpenses >= 1 ? "Of your total living costs" : "Of one month's expenses"}
          />
          <ComparisonCard
            icon={<ShoppingCart className="h-5 w-5 text-[hsl(var(--chart-3))]" />}
            color="bg-[hsl(var(--chart-3))]/10"
            title="Groceries"
            value={`${weeksOfGroceries} weeks`}
            subtitle="Of feeding yourself well"
          />
          <ComparisonCard
            icon={<Zap className="h-5 w-5 text-[hsl(var(--chart-4))]" />}
            color="bg-[hsl(var(--chart-4))]/10"
            title="Utilities"
            value={`${daysOfUtilities} days`}
            subtitle="Electricity, water, internet"
          />
        </div>
      </section>



      {/* Regret Simulator */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-lg font-bold text-foreground">
            Will you be glad you bought this tomorrow morning?
          </h3>
          <p className="text-sm text-muted-foreground">Be honest with yourself.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {[
            { key: "yes", label: "Yes, clearly", color: "border-primary text-primary bg-primary/10 hover:bg-primary/20" },
            { key: "unsure", label: "Not sure", color: "border-[hsl(var(--chart-3))] text-[hsl(var(--chart-3))] bg-[hsl(var(--chart-3))]/10 hover:bg-[hsl(var(--chart-3))]/20" },
            { key: "no", label: "Probably not", color: "border-accent text-accent bg-accent/10 hover:bg-accent/20" },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setRegretAnswer(option.key)}
              className={`flex-1 rounded-xl border-2 px-5 py-3 font-medium transition-all ${regretAnswer === option.key
                ? option.color + " scale-[1.02] shadow-md"
                : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {regretAnswer && (
          <div className={`mt-2 rounded-xl p-4 ${regretAnswer === "yes"
            ? "bg-primary/10 border border-primary/20"
            : regretAnswer === "unsure"
              ? "bg-[hsl(var(--chart-3))]/10 border border-[hsl(var(--chart-3))]/20"
              : "bg-accent/10 border border-accent/20"
            }`}>
            <p className="text-sm text-foreground leading-relaxed">
              {regretAnswer === "yes" && (
                "Then buy it intentionally."
              )}
              {regretAnswer === "unsure" && (
                "Uncertainty is valuable information. Sleep on it. If you still want it tomorrow, it will still be there."
              )}
              {regretAnswer === "no" && (
                "Then don't buy it today. You can always come back. Your future self will thank you."
              )}
            </p>
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onNewPrice}
          className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
        >
          <RotateCcw className="h-4 w-4" />
          Check another price
        </button>
        <p className="text-xs text-muted-foreground/60">
          Use Settings in the header to update your profile
        </p>
      </div>
    </div>
  )
}
