"use client"

import { useState, useEffect } from "react"
import { ShieldCheck } from "lucide-react"

export function EthicalCheckModal() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Check if we should show the ethical check
        const lastCheck = localStorage.getItem("mindspend_last_ethical_check")
        const now = Date.now()
        const oneWeek = 7 * 24 * 60 * 60 * 1000

        if (!lastCheck || now - parseInt(lastCheck) > oneWeek) {
            // Delay it slightly so it doesn't pop up INSTANTLY on load
            const timer = setTimeout(() => {
                setIsOpen(true)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [])

    function handleResponse(response: "yes" | "no") {
        // Save that we checked
        localStorage.setItem("mindspend_last_ethical_check", Date.now().toString())

        if (response === "yes") {
            // Show reassurance (MVP: alert)
            alert("Thank you for your honesty. We'll try to do better.")
        }

        setIsOpen(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h3 className="font-display text-lg font-bold text-foreground">
                            Honest Check-in
                        </h3>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                        We want to empower you, not deprive you.
                    </p>

                    <p className="font-medium text-foreground text-lg">
                        Did this app stop you from a purchase you later wish you made?
                    </p>

                    <div className="mt-2 grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleResponse("no")}
                            className="rounded-xl border border-border bg-card px-4 py-3 font-medium transition-colors hover:bg-secondary hover:text-foreground"
                        >
                            No, it helped
                        </button>
                        <button
                            onClick={() => handleResponse("yes")}
                            className="rounded-xl bg-primary px-4 py-3 font-bold text-primary-foreground transition-all hover:bg-primary/90"
                        >
                            Yes, I regret not buying
                        </button>
                    </div>

                    <p className="text-xs text-muted-foreground/50 text-center mt-2">
                        Asking once a week to keep us honest.
                    </p>
                </div>
            </div>
        </div>
    )
}
