"use client"

import { Mail, RefreshCw, LogOut } from "lucide-react"
import { useState } from "react"
import { sendEmailVerification } from "firebase/auth"
import { useAuth } from "@/lib/auth-context"
import type { FirebaseError } from "firebase/app"

export function VerifyEmailScreen() {
    const { user, signOut } = useAuth()
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState("")

    async function handleResend() {
        if (!user) return

        setLoading(true)
        setError("")
        try {
            await sendEmailVerification(user)
            setSent(true)
            setTimeout(() => setSent(false), 5000)
        } catch (err) {
            const firebaseError = err as FirebaseError
            setError(firebaseError.message || "Failed to send verification email")
        } finally {
            setLoading(false)
        }
    }

    async function handleSignOut() {
        await signOut()
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
                        <Mail className="h-8 w-8 text-warning" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="mb-2 text-center font-display text-2xl font-bold text-foreground">
                    Verify Your Email
                </h1>
                <p className="mb-6 text-center text-sm text-muted-foreground">
                    We sent a verification link to <strong>{user?.email}</strong>
                </p>

                {/* Instructions */}
                <div className="mb-6 rounded-lg border border-border/50 bg-muted/30 p-4">
                    <p className="text-sm text-foreground leading-relaxed">
                        Please check your email and click the verification link to continue. After verifying, refresh this page or sign in again.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                {/* Success */}
                {sent && (
                    <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 p-3">
                        <p className="text-sm text-primary">✓ Verification email sent! Check your inbox.</p>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={handleResend}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        {loading ? "Sending..." : "Resend Verification Email"}
                    </button>

                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>

                {/* Help Text */}
                <p className="mt-6 text-center text-xs text-muted-foreground">
                    Can&apos;t find the email? Check your spam folder or try a different email address.
                </p>
            </div>
        </div>
    )
}
