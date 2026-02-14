"use client"

import { useState } from "react"
import { User, Mail, Trash2, LogOut, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { deleteUser, sendEmailVerification } from "firebase/auth"
import { doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { FirebaseError } from "firebase/app"

interface ProfilePageProps {
    onClose: () => void
}

export function ProfilePage({ onClose }: ProfilePageProps) {
    const { user, signOut } = useAuth()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteInput, setDeleteInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [verificationSent, setVerificationSent] = useState(false)

    if (!user) return null
    const currentUser = user

    const isGoogleUser = currentUser.providerData.some(p => p.providerId === "google.com")
    const isEmailVerified = currentUser.emailVerified

    async function handleResendVerification() {
        setLoading(true)
        setError("")
        try {
            await sendEmailVerification(currentUser)
            setVerificationSent(true)
            setTimeout(() => setVerificationSent(false), 5000)
        } catch (err) {
            const firebaseError = err as FirebaseError
            setError(firebaseError.message || "Failed to send verification email")
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteAccount() {
        if (deleteInput !== "DELETE") {
            setError("Please type DELETE to confirm")
            return
        }

        setLoading(true)
        setError("")

        try {
            // Delete user data from Firestore
            const userDocRef = doc(db, "users", currentUser.uid)
            await deleteDoc(userDocRef)

            // Delete Firebase Auth user
            await deleteUser(currentUser)

            // Sign out will happen automatically
            onClose()
        } catch (err) {
            const firebaseError = err as FirebaseError
            if (firebaseError.code === "auth/requires-recent-login") {
                setError("For security, please sign out and sign in again before deleting your account.")
            } else {
                setError(firebaseError.message || "Failed to delete account")
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleSignOut() {
        await signOut()
        onClose()
    }

    return (
        <div className="flex flex-col gap-6 px-4 py-8 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="font-display text-3xl font-bold text-foreground">
                    Profile
                </h1>
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary"
                >
                    Back to App
                </button>
            </div>

            {/* Profile Card */}
            <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                    {/* Profile Picture */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                        {user.photoURL ? (
                            <div
                                aria-label="Profile"
                                className="h-full w-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${currentUser.photoURL})` }}
                            />
                        ) : (
                            <User className="h-10 w-10 text-primary" />
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <h2 className="font-display text-xl font-bold text-foreground">
                            {currentUser.displayName || "User"}
                        </h2>
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {currentUser.email}
                        </div>

                        {/* Verification Status */}
                        <div className="mt-3 flex items-center gap-2">
                            {isGoogleUser ? (
                                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Verified via Google
                                </div>
                            ) : isEmailVerified ? (
                                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Email Verified
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning">
                                    <XCircle className="h-3.5 w-3.5" />
                                    Email Not Verified
                                </div>
                            )}
                        </div>

                        {/* Resend Verification */}
                        {!isGoogleUser && !isEmailVerified && (
                            <div className="mt-3">
                                {verificationSent ? (
                                    <p className="text-xs text-primary">✓ Verification email sent! Check your inbox.</p>
                                ) : (
                                    <button
                                        onClick={handleResendVerification}
                                        disabled={loading}
                                        className="text-xs text-primary hover:underline disabled:opacity-50"
                                    >
                                        Resend verification email
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Info */}
                <div className="mt-6 grid gap-3 border-t border-border pt-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Account Type</span>
                        <span className="text-sm font-medium text-foreground">
                            {isGoogleUser ? "Google Account" : "Email Account"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">User ID</span>
                            <span className="text-xs font-mono text-foreground">{currentUser.uid.slice(0, 12)}...</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Account Created</span>
                        <span className="text-sm font-medium text-foreground">
                            {currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : "Unknown"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Privacy Info */}
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-foreground text-sm">Your Data is Private</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            Your profile and purchase history are stored securely in Firebase. Only you can access your data.
                            We never track, analyze, or share your information with third parties.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>

                {/* Delete Account */}
                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-3 text-sm font-medium text-destructive transition-all hover:bg-destructive/20"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                    </button>
                ) : (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                        <div className="flex items-start gap-3 mb-4">
                            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-destructive text-sm">Delete Account Permanently</h3>
                                <p className="text-xs text-destructive/80 mt-1">
                                    This will permanently delete your account, profile, and all purchase history. This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-destructive font-medium mb-2 block">
                                    Type <strong>DELETE</strong> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteInput}
                                    onChange={(e) => setDeleteInput(e.target.value)}
                                    placeholder="DELETE"
                                    className="w-full rounded-lg border border-destructive/30 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-destructive focus:outline-none focus:ring-2 focus:ring-destructive/20"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false)
                                        setDeleteInput("")
                                        setError("")
                                    }}
                                    className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={loading || deleteInput !== "DELETE"}
                                    className="flex-1 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-all hover:opacity-90 disabled:opacity-40"
                                >
                                    {loading ? "Deleting..." : "Delete Forever"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
