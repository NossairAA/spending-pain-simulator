"use client"

import { ArrowRight, Shield, Zap, Eye } from "lucide-react"
import Image from "next/image"

interface WelcomeScreenProps {
    onGetStarted: () => void
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
    return (
        <div className="flex flex-col items-center gap-10 px-4 py-16">
            {/* Hero */}
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 p-2">
                    <Image
                        src="/mindspend-logo.png"
                        alt="MindSpend logo"
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain"
                        priority
                    />
                </div>

                <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-medium tracking-wider uppercase text-primary">
                        Private & Honest
                    </span>
                </div>

                <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance max-w-2xl">
                    See what your money
                    <span className="block text-primary">really costs.</span>
                </h1>

                <p className="max-w-md text-lg text-muted-foreground leading-relaxed">
                    Before you spend, understand the true impact on your time, future, and financial freedom.
                </p>
            </div>

            {/* Features */}
            <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
                <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">100% Private</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        All data stays on your device. Nothing is tracked or shared.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <Eye className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground">Brutally Honest</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        See the real cost in time, opportunity, and future value.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--chart-3))]/10">
                        <Zap className="h-5 w-5 text-[hsl(var(--chart-3))]" />
                    </div>
                    <h3 className="font-semibold text-foreground">No Judgment</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Just facts. Make informed decisions, not guilty ones.
                    </p>
                </div>
            </div>

            {/* CTA */}
            <button
                onClick={onGetStarted}
                className="group flex items-center gap-3 rounded-2xl bg-primary px-8 py-4 font-display text-lg font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
            >
                Get Started
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Footer note */}
            <p className="text-xs text-muted-foreground/60 text-center max-w-md">
                Takes less than 30 seconds to set up. No account needed.
            </p>
        </div>
    )
}
