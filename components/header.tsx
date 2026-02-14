"use client"

import { Settings, Moon, Sun, LogOut, User as UserIcon, ChevronDown, UserCircle, BarChart3, Target } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface HeaderProps {
    onSettingsClick: () => void
    onGoalsClick: () => void
    onProfileClick: () => void
    onInsightsClick: () => void
    onLogoClick: () => void
}

export function Header({ onSettingsClick, onGoalsClick, onProfileClick, onInsightsClick, onLogoClick }: HeaderProps) {
    const { theme, setTheme } = useTheme()
    const { user, isGuest, signOut } = useAuth()
    const [showUserMenu, setShowUserMenu] = useState(false)

    async function handleSignOut() {
        await signOut()
        setShowUserMenu(false)
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <button
                    onClick={onLogoClick}
                    className="flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <span className="text-xl">💭</span>
                    </div>
                    <span className="font-display text-xl font-bold text-foreground">
                        MindSpend
                    </span>
                </button>

                {/* Tagline - hidden on mobile */}
                <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
                    <p className="text-sm text-muted-foreground whitespace-nowrap">
                        Private. Honest. No judgment.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Dark mode toggle */}
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition-all hover:bg-secondary"
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? (
                            <Sun className="h-4 w-4 text-foreground" />
                        ) : (
                            <Moon className="h-4 w-4 text-foreground" />
                        )}
                    </button>

                    {/* Insights button */}
                    <button
                        onClick={onInsightsClick}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary"
                    >
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Insights</span>
                    </button>

                    {/* Goals button */}
                    <button
                        onClick={onGoalsClick}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary"
                    >
                        <Target className="h-4 w-4" />
                        <span className="hidden sm:inline">Goals</span>
                    </button>





                    {/* User Menu */}
                    {(user || isGuest) && (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary"
                            >
                                {user?.photoURL ? (
                                    <div
                                        aria-label="Profile"
                                        className="h-5 w-5 rounded-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${user.photoURL})` }}
                                    />
                                ) : (
                                    <UserIcon className="h-4 w-4" />
                                )}
                                <span className="hidden sm:inline">
                                    {isGuest ? "Guest" : user?.displayName || user?.email?.split("@")[0] || "User"}
                                </span>
                                <ChevronDown className="h-3 w-3" />
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg z-50">
                                        <div className="p-3 border-b border-border">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {isGuest ? "Guest Mode" : (user?.displayName || user?.email?.split("@")[0] || "User")}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {isGuest ? "Data stored locally only" : "Synced to cloud"}
                                            </p>
                                        </div>
                                        <div className="p-2">
                                            {!isGuest && (
                                                <button
                                                    onClick={() => {
                                                        setShowUserMenu(false)
                                                        onProfileClick()
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                                                >
                                                    <UserCircle className="h-4 w-4" />
                                                    Profile
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false)
                                                    onSettingsClick()
                                                }}
                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                                            >
                                                <Settings className="h-4 w-4" />
                                                Settings
                                            </button>
                                            {!isGuest && (
                                                <button
                                                    onClick={handleSignOut}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Sign Out
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
