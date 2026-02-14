"use client"

import { useState } from "react"
import { X, ShieldCheck, TrendingUp, Target } from "lucide-react"

interface UserProfile {
    hourlyWage: number
    workingDaysPerYear: number
    monthlyExpenses: number
    emergencyFundGoal?: number
    freedomGoal?: number
}

interface GoalsModalProps {
    isOpen: boolean
    onClose: () => void
    profile: UserProfile | null
    onSave: (profile: UserProfile) => void
}

export function GoalsModal({ isOpen, onClose, profile, onSave }: GoalsModalProps) {
    const [emergencyFund, setEmergencyFund] = useState(profile?.emergencyFundGoal?.toString() || "")
    const [freedomGoal, setFreedomGoal] = useState(profile?.freedomGoal?.toString() || "")

    if (!isOpen) return null

    function handleSave() {
        if (!profile) return

        onSave({
            ...profile,
            emergencyFundGoal: emergencyFund ? parseFloat(emergencyFund) : undefined,
            freedomGoal: freedomGoal ? parseFloat(freedomGoal) : undefined,
        })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl mx-4 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Target className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-display text-xl font-bold text-foreground">
                                Financial Goals
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Optional targets to protect your future
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-secondary"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        {/* Emergency Fund */}
                        <div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                <label className="font-medium text-foreground">
                                    Emergency Fund
                                </label>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                                <input
                                    type="number"
                                    value={emergencyFund}
                                    onChange={(e) => setEmergencyFund(e.target.value)}
                                    placeholder="10000"
                                    className="w-full rounded-xl border border-border bg-background py-3 pl-8 pr-4 text-foreground placeholder:text-muted-foreground/40 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                A safety net for unexpected life events (usually 3-6 months of expenses).
                            </p>
                        </div>

                        {/* Future Freedom */}
                        <div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-[hsl(var(--chart-4))]" />
                                <label className="font-medium text-foreground">
                                    Future Freedom
                                </label>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                                <input
                                    type="number"
                                    value={freedomGoal}
                                    onChange={(e) => setFreedomGoal(e.target.value)}
                                    placeholder="50000"
                                    className="w-full rounded-xl border border-border bg-background py-3 pl-8 pr-4 text-foreground placeholder:text-muted-foreground/40 transition-all focus:border-[hsl(var(--chart-4))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--chart-4))]/20"
                                />
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Long-term savings for retirement, a house, or financial independence.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 shadow-lg shadow-primary/20"
                    >
                        Save Goals
                    </button>
                </div>
            </div>
        </div>
    )
}
