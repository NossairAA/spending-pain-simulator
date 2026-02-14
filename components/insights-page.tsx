"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getPurchaseHistory, getGuestPurchaseHistory, PurchaseHistory, updatePurchaseDecision, deletePurchase, deleteGuestPurchase } from "@/lib/purchase-history"
import { X, TrendingDown, Clock, Calendar, ShoppingBag, Ban, Trash2 } from "lucide-react"

interface InsightsPageProps {
    onClose: () => void
    onProductClick: (purchase: PurchaseHistory) => void
}

export function InsightsPage({ onClose, onProductClick }: InsightsPageProps) {
    const { user, isGuest } = useAuth()

    const [history, setHistory] = useState<PurchaseHistory[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    useEffect(() => {
        async function loadHistory() {
            try {
                if (user) {
                    const data = await getPurchaseHistory(user.uid)
                    setHistory(data)
                } else if (isGuest) {
                    const data = getGuestPurchaseHistory()
                    setHistory(data)
                }
            } catch (error) {
                console.error("Failed to load history:", error)
            } finally {
                setLoading(false)
            }
        }

        loadHistory()
    }, [user, isGuest, refreshTrigger]) // Add refreshTrigger to dependencies

    // Calculate insights
    const totalChecks = history.length
    const skippedCount = history.filter(h => h.decision === "skipped").length
    const boughtCount = history.filter(h => h.decision === "bought").length
    const totalSkippedValue = history
        .filter(h => h.decision === "skipped")
        .reduce((sum, h) => sum + h.price, 0)

    const totalSkippedTime = history
        .filter(h => h.decision === "skipped")
        .reduce((sum, h) => sum + (h.calculations?.timeInMinutes || 0), 0)

    function formatTime(minutes: number): string {
        const hours = Math.floor(minutes / 60)
        const mins = Math.round(minutes % 60)

        // Constants
        const WORK_DAY_HOURS = 8
        const WORK_DAYS_IN_YEAR = 220 // Standard work year used in setup

        // If less than 24 hours total, show Hours + Mins
        if (hours < 24) {
            if (hours === 0) return `${mins}m`
            if (mins === 0) return `${hours}h`
            return `${hours}h ${mins}m`
        }

        // Calculate working days (8h)
        const totalWorkDays = Math.floor(hours / WORK_DAY_HOURS)
        const remainingHours = hours % WORK_DAY_HOURS

        // If more than a year of working days
        if (totalWorkDays >= WORK_DAYS_IN_YEAR) {
            const years = Math.floor(totalWorkDays / WORK_DAYS_IN_YEAR)
            const daysRemaining = totalWorkDays % WORK_DAYS_IN_YEAR
            return `${years}y ${daysRemaining}d`
        }

        // Show Days + Hours
        return `${totalWorkDays}d ${remainingHours}h`
    }

    // Time patterns
    const lateNightChecks = history.filter(h => h.timeOfDay && h.timeOfDay >= 22).length
    const lateNightPercentage = totalChecks > 0 ? Math.round((lateNightChecks / totalChecks) * 100) : 0

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentChecks = history.filter(h => new Date(h.timestamp) > sevenDaysAgo).length

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">Insights</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Your spending awareness journey
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 transition-colors hover:bg-secondary"
                    >
                        <X className="h-6 w-6 text-muted-foreground" />
                    </button>
                </div>

                {totalChecks === 0 ? (
                    <div className="rounded-2xl border border-border/50 bg-card/50 p-12 text-center">
                        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-lg font-medium text-foreground">No purchase checks yet</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Start checking prices to see your insights here
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Key Metrics */}
                        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <MetricCard
                                icon={<Calendar className="h-5 w-5" />}
                                label="Total Checks"
                                value={totalChecks.toString()}
                                color="bg-primary/10 text-primary"
                            />
                            <MetricCard
                                icon={<Ban className="h-5 w-5" />}
                                label="Skipped"
                                value={skippedCount.toString()}
                                color="bg-primary/10 text-primary"
                            />
                            <MetricCard
                                icon={<ShoppingBag className="h-5 w-5" />}
                                label="Bought"
                                value={boughtCount.toString()}
                                color="bg-muted/50 text-foreground"
                            />
                            <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                                <div className="mb-2 inline-flex rounded-lg p-2 bg-primary/10 text-primary">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <p className="text-sm text-muted-foreground">Life Preserved</p>
                                <p className="mt-1 font-display text-2xl font-bold text-foreground">
                                    {formatTime(totalSkippedTime)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    ${Math.round(totalSkippedValue)} saved
                                </p>
                            </div>
                        </div>

                        {/* Insights */}
                        <div className="mb-6 space-y-4">
                            <h2 className="font-display text-xl font-bold text-foreground">Patterns</h2>

                            {skippedCount > 2 && (
                                <InsightCard
                                    icon={<TrendingDown className="h-5 w-5 text-primary" />}
                                    title="Great self-control!"
                                    description={`You've resisted ${skippedCount} impulse purchase${skippedCount > 1 ? 's' : ''}, saving $${Math.round(totalSkippedValue)}.`}
                                    positive
                                />
                            )}

                            {lateNightPercentage > 30 && totalChecks >= 5 && (
                                <InsightCard
                                    icon={<Clock className="h-5 w-5 text-warning" />}
                                    title="Late-night spending pattern"
                                    description={`${lateNightPercentage}% of your checks happen after 10 PM. Consider waiting until morning before making decisions.`}
                                />
                            )}

                            {recentChecks > 5 && (
                                <InsightCard
                                    icon={<Calendar className="h-5 w-5 text-accent" />}
                                    title="Busy spending week"
                                    description={`You've checked ${recentChecks} purchases in the last 7 days. Stay mindful!`}
                                />
                            )}
                        </div>

                        {/* Purchase History */}
                        <div>
                            <h2 className="mb-4 font-display text-xl font-bold text-foreground">Recent Activity</h2>
                            <div className="space-y-3">
                                {history.slice(0, 20).map((purchase) => (
                                    <PurchaseCard
                                        key={purchase.id}
                                        purchase={purchase}
                                        onDecisionUpdate={() => setRefreshTrigger(prev => prev + 1)}
                                        onProductClick={() => onProductClick(purchase)}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

function MetricCard({ icon, label, value, color }: {
    icon: React.ReactNode
    label: string
    value: string
    color: string
}) {
    return (
        <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <div className={`mb-2 inline-flex rounded-lg p-2 ${color}`}>
                {icon}
            </div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
        </div>
    )
}

function InsightCard({ icon, title, description, positive }: {
    icon: React.ReactNode
    title: string
    description: string
    positive?: boolean
}) {
    return (
        <div className={`rounded-xl border p-4 ${positive
            ? "border-primary/30 bg-primary/5"
            : "border-border/50 bg-card/50"
            }`}>
            <div className="flex gap-3">
                <div className="mt-0.5">{icon}</div>
                <div>
                    <h3 className="font-semibold text-foreground">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
        </div>
    )
}
const CATEGORY_ICONS: Record<string, string> = {
    food: "🍔",
    tech: "📱",
    clothes: "👕",
    fun: "🎉",
    transport: "🚗",
    subscription: "📺",
    other: "📦",
}

function PurchaseCard({ purchase, onDecisionUpdate, onProductClick }: {
    purchase: PurchaseHistory
    onDecisionUpdate: () => void
    onProductClick: () => void
}) {
    const { user, isGuest } = useAuth()
    const [localDecision, setLocalDecision] = useState(purchase.decision)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setLocalDecision(purchase.decision)
    }, [purchase.decision])

    const date = new Date(purchase.timestamp)
    const timeAgo = getTimeAgo(date)

    async function handleDecision(decision: "bought" | "skipped") {
        if (!purchase.id) return

        // If clicking the current state, toggle to the other one (or allow reset?)
        // Currently we just set it. If it's already set, maybe we want to un-set it?
        // Let's stick to simple toggle for now as requested.

        setSaving(true)
        try {
            if (user) {
                await updatePurchaseDecision(user.uid, purchase.id, decision)
                console.log("✅ Decision saved:", decision)
            } else if (isGuest) {
                // For guests, update localStorage
                const stored = localStorage.getItem("mindspend_purchase_history")
                if (stored) {
                    const history = JSON.parse(stored) as PurchaseHistory[]
                    const index = history.findIndex((p) => p.id === purchase.id)
                    if (index !== -1) {
                        history[index].decision = decision
                        localStorage.setItem("mindspend_purchase_history", JSON.stringify(history))
                        console.log("✅ Guest decision saved:", decision)
                    }
                }
            }
            setLocalDecision(decision)
            // Trigger refresh of insights
            onDecisionUpdate()
        } catch (error) {
            console.error("Failed to save decision:", error)
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        if (!purchase.id || !confirm("Are you sure you want to remove this entry?")) return

        setSaving(true)
        try {
            if (user) {
                await deletePurchase(user.uid, purchase.id)
            } else if (isGuest) {
                deleteGuestPurchase(purchase.id)
            }
            onDecisionUpdate()
        } catch (error) {
            console.error("Failed to delete purchase:", error)
        } finally {
            setSaving(false)
        }
    }

    const icon = CATEGORY_ICONS[purchase.category || "other"] || "📦"

    return (
        <div
            onClick={onProductClick}
            className="group relative rounded-xl border border-border/50 bg-card/50 p-4 transition-colors hover:bg-card cursor-pointer"
        >
            {/* Delete button - shows on hover */}
            <button
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="absolute top-2 right-2 rounded-lg p-1.5 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                title="Delete entry"
            >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </button>

            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg" title={purchase.category}>{icon}</span>
                        <p className="font-semibold text-foreground">{purchase.label}</p>
                        {localDecision === "skipped" && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDecision("bought"); }}
                                disabled={saving}
                                title="Click to change to Bought"
                                className="group/btn relative min-w-[80px] rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                            >
                                <span className="block group-hover/btn:hidden">Pass ✓</span>
                                <span className="hidden group-hover/btn:block font-bold">Mark Bought</span>
                            </button>
                        )}
                        {localDecision === "bought" && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDecision("skipped"); }}
                                disabled={saving}
                                title="Click to change to Skipped"
                                className="group/btn relative min-w-[80px] rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                            >
                                <span className="block group-hover/btn:hidden">Bought</span>
                                <span className="hidden group-hover/btn:block font-bold">Mark Pass</span>
                            </button>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{timeAgo}</p>

                    {/* Decision buttons - only show if undecided */}
                    {localDecision === "undecided" && (
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDecision("skipped"); }}
                                disabled={saving}
                                className="rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                            >
                                {saving ? "..." : "Pass"}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDecision("bought"); }}
                                disabled={saving}
                                className="rounded-lg border border-muted-foreground/30 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
                            >
                                {saving ? "..." : "Bought"}
                            </button>
                        </div>
                    )}
                </div>
                <div className="text-right mr-6">
                    <p className="font-display text-lg font-bold text-foreground">
                        ${purchase.price}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {purchase.calculations.timeInMinutes} min
                    </p>
                </div>
            </div>
        </div>
    )
}

function getTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
}
