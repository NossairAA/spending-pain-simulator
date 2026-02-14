"use client"

import { useEffect, useState, Suspense, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"
import { CheckCircle2, XCircle, ArrowRight, Mail } from "lucide-react"
import Link from "next/link"
import type { FirebaseError } from "firebase/app"

function AuthActionContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const mode = searchParams.get("mode")
    const actionCode = searchParams.get("oobCode")

    const [status, setStatus] = useState<"loading" | "success" | "error" | "input">("loading")
    const [message, setMessage] = useState("Verifying your request...")
    const [newPassword, setNewPassword] = useState("")
    const invalidMessage = !actionCode
        ? "Invalid link. The code is missing."
        : mode !== "verifyEmail" && mode !== "resetPassword"
            ? "Invalid request mode."
            : null

    const handleVerifyEmail = useCallback(async (code: string) => {
        try {
            await applyActionCode(auth, code)
            setStatus("success")
            setMessage("Your email has been verified successfully. You can now access all features.")
            setTimeout(() => router.push("/"), 3000)
        } catch (error) {
            const firebaseError = error as FirebaseError
            setStatus("error")
            if (firebaseError.code === "auth/expired-action-code") {
                setMessage("This verification link has expired.")
            } else if (firebaseError.code === "auth/invalid-action-code") {
                setMessage("This link is invalid or has already been used.")
            } else {
                setMessage("Failed to verify email. Please try again.")
            }
        }
    }, [router])

    const handleResetPasswordCheck = useCallback(async (code: string) => {
        try {
            await verifyPasswordResetCode(auth, code)
            setStatus("input")
            setMessage("Enter your new password.")
        } catch (error) {
            const firebaseError = error as FirebaseError
            setStatus("error")
            if (firebaseError.code === "auth/expired-action-code") {
                setMessage("This password reset link has expired.")
            } else {
                setMessage("Invalid or expired password reset link.")
            }
        }
    }, [])

    useEffect(() => {
        if (!actionCode || invalidMessage) {
            return
        }

        // Handle different modes
        switch (mode) {
            case "verifyEmail":
                // eslint-disable-next-line react-hooks/set-state-in-effect
                handleVerifyEmail(actionCode)
                break
            case "resetPassword":
                handleResetPasswordCheck(actionCode)
                break
        }
    }, [mode, actionCode, invalidMessage, handleVerifyEmail, handleResetPasswordCheck])

    async function handleSubmitPassword(e: React.FormEvent) {
        e.preventDefault()
        if (!actionCode || !newPassword) return

        setStatus("loading")
        try {
            await confirmPasswordReset(auth, actionCode, newPassword)
            setStatus("success")
            setMessage("Password changed successfully! You can now sign in.")
        } catch {
            setStatus("error")
            setMessage("Failed to reset password. Please try again.")
        }
    }

    const displayStatus = invalidMessage ? "error" : status
    const displayMessage = invalidMessage || message

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-border/50 bg-card p-8 shadow-2xl backdrop-blur-xl">
                {/* Status Icon */}
                <div className="flex justify-center">
                    {displayStatus === "loading" && (
                        <div className="relative">
                            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
                        </div>
                    )}
                    {displayStatus === "success" && (
                        <div className="rounded-full bg-green-500/10 p-4">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                        </div>
                    )}
                    {displayStatus === "error" && (
                        <div className="rounded-full bg-destructive/10 p-4">
                            <XCircle className="h-12 w-12 text-destructive" />
                        </div>
                    )}
                    {displayStatus === "input" && (
                        <div className="rounded-full bg-primary/10 p-4">
                            <Mail className="h-12 w-12 text-primary" />
                        </div>
                    )}
                </div>

                {/* Title & Message */}
                <div className="space-y-2">
                    <h1 className="font-display text-2xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                        {displayStatus === "loading" && "Verifying..."}
                        {displayStatus === "success" && "Success!"}
                        {displayStatus === "error" && "Something went wrong"}
                        {displayStatus === "input" && "Reset Password"}
                    </h1>
                    <p className="text-muted-foreground">{displayMessage}</p>
                </div>

                {/* Password Reset Form */}
                {displayStatus === "input" && mode === "resetPassword" && (
                    <form onSubmit={handleSubmitPassword} className="space-y-4">
                        <div className="space-y-2 text-left">
                            <label className="text-sm font-medium">New Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                        >
                            Update Password
                        </button>
                    </form>
                )}

                {/* Actions */}
                <div className="pt-4">
                    {displayStatus === "success" ? (
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                        >
                            Go to Dashboard <ArrowRight className="h-4 w-4" />
                        </Link>
                    ) : (
                        <Link
                            href="/"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Back to Home
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function AuthActionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <AuthActionContent />
        </Suspense>
    )
}
