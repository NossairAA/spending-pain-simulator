"use client"

import { useState } from "react"
import { X, Mail, Lock, Chrome, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { FirebaseError } from "firebase/app"

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail, continueAsGuest } = useAuth()
    const [mode, setMode] = useState<"signin" | "signup">("signin")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [verificationSent, setVerificationSent] = useState(false)

    if (!isOpen) return null

    async function handleGoogleSignIn() {
        setLoading(true)
        setError("")
        try {
            await signInWithGoogle()
            onSuccess()
            onClose()
        } catch (err) {
            const firebaseError = err as FirebaseError
            setError(firebaseError.message || "Failed to sign in with Google")
        } finally {
            setLoading(false)
        }
    }

    async function handleEmailAuth() {
        if (!email || !password) {
            setError("Please enter email and password")
            return
        }

        setLoading(true)
        setError("")
        setVerificationSent(false)

        try {
            if (mode === "signin") {
                await signInWithEmail(email, password)
                onSuccess()
                onClose()
            } else {
                // Sign up - sends verification email
                await signUpWithEmail(email, password)
                setVerificationSent(true)
                setError("")
            }
        } catch (err) {
            const firebaseError = err as FirebaseError
            if (firebaseError.code === "auth/email-already-in-use") {
                setError("This email is already registered. Try signing in instead.")
            } else if (firebaseError.code === "auth/weak-password") {
                setError("Password should be at least 6 characters")
            } else if (firebaseError.code === "auth/invalid-email") {
                setError("Invalid email address")
            } else if (firebaseError.code === "auth/user-not-found") {
                setError("No account found with this email")
            } else if (firebaseError.code === "auth/wrong-password") {
                setError("Incorrect password")
            } else {
                setError(firebaseError.message || `Failed to ${mode === "signin" ? "sign in" : "sign up"}`)
            }
        } finally {
            setLoading(false)
        }
    }

    function handleGuestMode() {
        continueAsGuest()
        onSuccess()
        onClose()
    }

    function handleClose() {
        setVerificationSent(false)
        setError("")
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl mx-4">
                {/* Verification Success Message */}
                {verificationSent ? (
                    <>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="font-display text-2xl font-bold text-foreground">
                                Check Your Email
                            </h2>
                            <button
                                onClick={handleClose}
                                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-secondary"
                            >
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <CheckCircle className="h-8 w-8 text-primary" />
                            </div>

                            <div className="text-center">
                                <p className="text-foreground font-medium mb-2">
                                    Verification email sent!
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    We&apos;ve sent a verification link to <strong>{email}</strong>
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Please check your email and click the link to verify your account, then sign in.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setVerificationSent(false)
                                    setMode("signin")
                                    setPassword("")
                                }}
                                className="mt-4 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90"
                            >
                                Go to Sign In
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="font-display text-2xl font-bold text-foreground">
                                    {mode === "signin" ? "Welcome Back" : "Create Account"}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {mode === "signin" ? "Sign in to sync your data" : "Sign up to save your profile"}
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-secondary"
                            >
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 rounded-xl border-2 border-border bg-card px-6 py-3 font-semibold text-foreground transition-all hover:bg-secondary disabled:opacity-50"
                        >
                            <Chrome className="h-5 w-5" />
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-xs text-muted-foreground">OR</span>
                            <div className="h-px flex-1 bg-border" />
                        </div>

                        {/* Email/Password Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                                    <Mail className="h-4 w-4 text-primary" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-border bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                                    <Lock className="h-4 w-4 text-primary" />
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-border bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                {mode === "signup" && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Minimum 6 characters
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleEmailAuth}
                                disabled={loading}
                                className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                            >
                                {mode === "signin" ? "Sign In" : "Create Account"}
                            </button>
                        </div>

                        {/* Toggle Mode */}
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => {
                                    setMode(mode === "signin" ? "signup" : "signin")
                                    setError("")
                                }}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {mode === "signin" ? "Do not have an account? " : "Already have an account? "}
                                <span className="font-semibold text-primary">
                                    {mode === "signin" ? "Sign up" : "Sign in"}
                                </span>
                            </button>
                        </div>

                        {/* Guest Mode */}
                        <div className="mt-6 border-t border-border pt-6">
                            <button
                                onClick={handleGuestMode}
                                className="w-full rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                            >
                                Continue as Guest
                                <span className="block text-xs mt-1 text-muted-foreground/70">
                                    Data stays on this device only
                                </span>
                            </button>
                        </div>

                        {/* Privacy Note */}
                        <p className="mt-4 text-center text-xs text-muted-foreground/60">
                            Your data is private and secure. We never track or share your information.
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
