"use client"

import { useState, useCallback, useEffect, useReducer } from "react"
import { Header } from "@/components/header"
import { WelcomeScreen } from "@/components/welcome-screen"
import { GoalsModal } from "@/components/goals-modal"
import { SetupForm } from "@/components/setup-form"
import { PriceInput } from "@/components/price-input"
import { CoolOffCountdown } from "@/components/cool-off-countdown"
import { ResultsView } from "@/components/results-view"
import { SettingsModal } from "@/components/settings-modal"
import { AuthModal } from "@/components/auth-modal"
import { ProfilePage } from "@/components/profile-page"
import { VerifyEmailScreen } from "@/components/verify-email-screen"
import { InsightsPage } from "@/components/insights-page"
import { useAuth } from "@/lib/auth-context"
import { PurchaseHistory } from "@/lib/purchase-history"
import { EthicalCheckModal } from "@/components/ethical-check-modal"


interface UserProfile {
  hourlyWage: number
  workingDaysPerYear: number
  monthlyExpenses: number
  emergencyFundGoal?: number
  freedomGoal?: number
  investmentReturn?: number
}

type Step = "welcome" | "auth" | "setup" | "price" | "cooloff" | "results" | "profile" | "insights"

interface FlowState {
  step: Step
  isViewingHistory: boolean
}

type FlowAction =
  | { type: "SYNC_STEP"; step: Step }
  | { type: "SET_STEP"; step: Step }
  | { type: "VIEW_HISTORY_RESULTS" }
  | { type: "START_NEW_PRICE" }
  | { type: "LOGO_RESET"; hasProfile: boolean; isAuthenticated: boolean }

function flowReducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "SYNC_STEP":
      return {
        step: action.step,
        isViewingHistory: false,
      }
    case "SET_STEP":
      return {
        ...state,
        step: action.step,
      }
    case "VIEW_HISTORY_RESULTS":
      return {
        step: "results",
        isViewingHistory: true,
      }
    case "START_NEW_PRICE":
      return {
        step: "price",
        isViewingHistory: false,
      }
    case "LOGO_RESET":
      if (action.hasProfile) {
        return { step: "price", isViewingHistory: false }
      }
      if (action.isAuthenticated) {
        return { step: "setup", isViewingHistory: false }
      }
      return { step: "welcome", isViewingHistory: false }
    default:
      return state
  }
}

export default function Page() {
  const { user, profile, loading, isGuest, saveProfile } = useAuth()
  const [flowState, dispatch] = useReducer(flowReducer, {
    step: "welcome",
    isViewingHistory: false,
  })
  const [price, setPrice] = useState(0)
  const [label, setLabel] = useState("")
  const [category, setCategory] = useState("other")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isGoalsOpen, setIsGoalsOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)


  // Handle authentication state changes
  useEffect(() => {
    if (loading) return

    // Check if user needs to verify email
    if (user && !isGuest) {
      const isGoogleUser = user.providerData.some(p => p.providerId === "google.com")
      if (!isGoogleUser && !user.emailVerified) {
        // Show verify email screen
        return
      }
    }

    if (user || isGuest) {
      // User is authenticated or in guest mode
      if (profile) {
        // Profile exists, go to price input
        dispatch({ type: "SYNC_STEP", step: "price" })
      } else {
        // No profile, show setup
        dispatch({ type: "SYNC_STEP", step: "setup" })
      }
    } else {
      // Not authenticated, show welcome
      dispatch({ type: "SYNC_STEP", step: "welcome" })
    }
  }, [user, isGuest, profile, loading])

  function handleGetStarted() {
    setIsAuthOpen(true)
  }

  function handleAuthSuccess() {
    // After auth, check if profile exists
    if (profile) {
      dispatch({ type: "SET_STEP", step: "price" })
    } else {
      dispatch({ type: "SET_STEP", step: "setup" })
    }
  }

  function handlePriceSubmit(p: number, l: string, c: string) {
    setPrice(p)
    setLabel(l)
    setCategory(c)
    dispatch({ type: "SET_STEP", step: "cooloff" })
  }

  async function handleSetupComplete(p: UserProfile) {
    await saveProfile(p)
    dispatch({ type: "SET_STEP", step: "price" })
  }

  const handleCoolOffComplete = useCallback(() => {
    dispatch({ type: "SET_STEP", step: "results" })
  }, [])

  function handleNewPrice() {
    setPrice(0)
    setLabel("")
    dispatch({ type: "START_NEW_PRICE" })
  }

  function handleProductClick(purchase: PurchaseHistory) {
    setPrice(purchase.price)
    setLabel(purchase.label)
    setCategory(purchase.category || "other")
    dispatch({ type: "VIEW_HISTORY_RESULTS" })
  }


  async function handleSettingsSave(newProfile: UserProfile) {
    await saveProfile(newProfile)
  }

  function handleResetData() {
    // This is handled by the auth context signOut
    dispatch({ type: "SET_STEP", step: "welcome" })
  }

  function handleProfileClick() {
    dispatch({ type: "SET_STEP", step: "profile" })
  }

  function handleInsightsClick() {
    dispatch({ type: "SET_STEP", step: "insights" })
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Show verify email screen if needed
  if (user && !isGuest) {
    const isGoogleUser = user.providerData.some(p => p.providerId === "google.com")
    if (!isGoogleUser && !user.emailVerified) {
      return <VerifyEmailScreen />
    }
  }

  return (
    <>
      <main className="relative min-h-screen overflow-hidden">
        {/* Ambient glow effects */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -right-40 bottom-20 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[hsl(var(--chart-4))]/3 blur-3xl" />
        </div>

        {/* Header - show after welcome screen */}
        {flowState.step !== "welcome" && flowState.step !== "profile" && flowState.step !== "insights" && (
          <Header
            onSettingsClick={() => setIsSettingsOpen(true)}
            onGoalsClick={() => setIsGoalsOpen(true)}
            onProfileClick={handleProfileClick}
            onInsightsClick={handleInsightsClick}
            onLogoClick={() => {
              if (profile) {
                setPrice(0)
                setLabel("")
                setCategory("other")
              }
              dispatch({ type: "LOGO_RESET", hasProfile: !!profile, isAuthenticated: !!(user || isGuest) })
            }}
          />
        )}

        <div className="relative mx-auto max-w-2xl">
          {/* Content */}
          <div className="transition-all duration-300">
            {flowState.step === "welcome" && <WelcomeScreen onGetStarted={handleGetStarted} />}
            {flowState.step === "setup" && <SetupForm onComplete={handleSetupComplete} />}
            {flowState.step === "price" && <PriceInput onSubmit={handlePriceSubmit} />}
            {flowState.step === "cooloff" && <CoolOffCountdown onComplete={handleCoolOffComplete} />}
            {flowState.step === "results" && profile && (
              <ResultsView
                price={price}
                label={label}
                category={category}
                profile={profile}
                onNewPrice={handleNewPrice}
                preventSave={flowState.isViewingHistory}
              />
            )}
            {flowState.step === "profile" && <ProfilePage onClose={() => dispatch({ type: "SET_STEP", step: "price" })} />}
            {flowState.step === "insights" && <InsightsPage onClose={() => dispatch({ type: "SET_STEP", step: "price" })} onProductClick={handleProductClick} />}

          </div>

          {/* Footer - only show on welcome and price input */}
          {(flowState.step === "welcome" || flowState.step === "price") && (
            <footer className="flex items-center justify-center px-4 pb-8 pt-4">
              <p className="text-xs text-muted-foreground/40">
                MindSpend — Private. Honest. No judgment.
              </p>
            </footer>
          )}
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          profile={profile}
          onSave={handleSettingsSave}
          onReset={handleResetData}
        />
      )}

      {/* Goals Modal */}
      {isGoalsOpen && (
        <GoalsModal
          isOpen={isGoalsOpen}
          onClose={() => setIsGoalsOpen(false)}
          profile={profile}
          onSave={handleSettingsSave}
        />
      )}



      {/* Weekly Ethical Check */}
      <EthicalCheckModal />
    </>
  )
}
