"use client"

import { useState, useEffect } from "react"

interface CoolOffCountdownProps {
  duration?: number
  onComplete: () => void
}

export function CoolOffCountdown({ duration = 10, onComplete }: CoolOffCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(duration)
  const progress = ((duration - secondsLeft) / duration) * 100

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete()
      return
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, onComplete])

  const circumference = 2 * Math.PI * 54

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Pause.
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Give yourself a moment before you see the numbers.
        </p>
      </div>

      <div className="relative flex items-center justify-center">
        <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="4"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (progress / 100) * circumference}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <span className="absolute font-display text-4xl font-bold text-primary tabular-nums">
          {secondsLeft}
        </span>
      </div>

      <p className="max-w-xs text-center text-sm text-muted-foreground/70 leading-relaxed">
        Impulse spending relies on speed. This tiny delay alone reduces regretful purchases.
      </p>
    </div>
  )
}
