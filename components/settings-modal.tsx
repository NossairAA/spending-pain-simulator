"use client"

import { useState } from "react"
import { X, ArrowRight, Trash2, ShieldCheck, TrendingUp } from "lucide-react"

interface UserProfile {
    hourlyWage: number
    workingDaysPerYear: number
    monthlyExpenses: number
    emergencyFundGoal?: number
    freedomGoal?: number
}

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    profile: UserProfile | null
    onSave: (profile: UserProfile) => void
    onReset: () => void
}

export function SettingsModal({ isOpen, onClose, profile, onSave, onReset }: SettingsModalProps) {
    const initialWorkingDays = profile?.workingDaysPerYear?.toString() || "220"
    const initialMonthlyIncome = profile
        ? Math.round((profile.hourlyWage * profile.workingDaysPerYear * 8) / 12).toString()
        : ""

    const [inputType, setInputType] = useState<"hourly" | "monthly">("monthly")
    const [inputValue, setInputValue] = useState(initialMonthlyIncome)
    const [workingDays, setWorkingDays] = useState(initialWorkingDays)



    // Advanced (Expenses & Goals)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [monthlyExpenses, setMonthlyExpenses] = useState(profile?.monthlyExpenses?.toString() || "")
    const [emergencyFund, setEmergencyFund] = useState(profile?.emergencyFundGoal?.toString() || "")
    const [freedomGoal, setFreedomGoal] = useState(profile?.freedomGoal?.toString() || "")

    if (!isOpen) return null

    function handleSave() {
        if (!inputValue) return

        let hourly = 0
        let expenses = 0

        // Calculate hourly wage
        if (inputType === "hourly") {
            hourly = parseFloat(inputValue)
        } else {
            // Monthly -> Hourly
            const daysPerYear = parseInt(workingDays) || 220
            const hoursPerYear = daysPerYear * 8
            const annualIncome = parseFloat(inputValue) * 12
            hourly = annualIncome / hoursPerYear
        }

        // Expenses handling
        if (monthlyExpenses) {
            expenses = parseFloat(monthlyExpenses)
        } else {
            // If user cleared expenses, re-estimate?
            // Or if they left it as is (pre-filled)?
            // Since we pre-fill monthlyExpenses from profile in useEffect,
            // this block likely only hits if they explicitly cleared it.
            // We'll stick to estimation logic if empty.
            if (inputType === "monthly") {
                expenses = parseFloat(inputValue) * 0.8
            } else {
                expenses = (parseFloat(inputValue) * 8 * 21.6) * 0.8
            }
        }

        onSave({
            hourlyWage: Math.round(hourly * 100) / 100,
            workingDaysPerYear: parseInt(workingDays) || 220,
            monthlyExpenses: Math.round(expenses),
            emergencyFundGoal: emergencyFund ? parseFloat(emergencyFund) : undefined,
            freedomGoal: freedomGoal ? parseFloat(freedomGoal) : undefined,
        })
        onClose()
    }

    function handleResetData() {
        if (confirm("Are you sure? This will clear all your data and you'll need to set up again.")) {
            onReset()
            onClose()
        }
    }

    const canSubmit = !!inputValue

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl mx-4 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-display text-2xl font-bold text-foreground">
                        Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-secondary"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Form Content - Mirrored from SetupForm */}
                <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
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
                                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-10 pr-4 text-lg text-foreground placeholder:text-muted-foreground/40 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                            className="w-full rounded-xl border border-border bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground/40 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <p className="text-xs text-muted-foreground ml-1">
                            Standard full-time is ~220 days
                        </p>
                    </div>

                    {/* Advanced Toggle */}
                    <div className="pt-2">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showAdvanced ? "Hide advanced details" : "More options"}
                            <ArrowRight className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-90" : ""}`} />
                        </button>

                        {showAdvanced && (
                            <div className="mt-4 space-y-4 rounded-xl border border-border/50 bg-secondary/20 p-4 animate-in slide-in-from-top-2 fade-in duration-300">
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
                                        Used for life equivalence calculations.
                                    </p>
                                </div>

                                <div className="pt-2 border-t border-border/50">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                        Optional Goals
                                    </p>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                                Emergency Fund
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">€</span>
                                                <input
                                                    type="number"
                                                    value={emergencyFund}
                                                    onChange={(e) => setEmergencyFund(e.target.value)}
                                                    placeholder="10000"
                                                    className="w-full rounded-lg border border-border bg-background py-2 pl-7 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                                <TrendingUp className="w-3.5 h-3.5 text-[hsl(var(--chart-4))]" />
                                                Future Freedom
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">€</span>
                                                <input
                                                    type="number"
                                                    value={freedomGoal}
                                                    onChange={(e) => setFreedomGoal(e.target.value)}
                                                    placeholder="50000"
                                                    className="w-full rounded-lg border border-border bg-background py-2 pl-7 pr-3 text-sm focus:border-[hsl(var(--chart-4))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--chart-4))]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Privacy Info */}
                <div className="mt-6 rounded-xl border border-border/50 bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Privacy:</strong> All data is stored locally.
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <button
                        onClick={handleResetData}
                        className="flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/20"
                    >
                        <Trash2 className="h-4 w-4" />
                        Reset Data
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-secondary sm:flex-initial"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!canSubmit}
                            className="flex-1 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 sm:flex-initial"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
