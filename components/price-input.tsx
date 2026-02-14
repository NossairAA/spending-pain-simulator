"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Search } from "lucide-react"

const CATEGORIES = [
  { id: "food", label: "Food", icon: "🍔" },
  { id: "tech", label: "Tech", icon: "📱" },
  { id: "clothes", label: "Clothes", icon: "👕" },
  { id: "fun", label: "Fun", icon: "🎉" },
  { id: "transport", label: "Travel", icon: "🚗" },
  { id: "subscription", label: "Sub", icon: "📺" },
  { id: "other", label: "Other", icon: "📦" },
]

interface PriceInputProps {
  onSubmit: (price: number, label: string, category: string) => void
}

export function PriceInput({ onSubmit }: PriceInputProps) {
  const [price, setPrice] = useState("")
  const [label, setLabel] = useState("")
  const [category, setCategory] = useState("other")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const val = parseFloat(price)
    if (val > 0) {
      onSubmit(val, label || "this purchase", category)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
          What are you about to spend?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Enter the amount. We will show you what it really costs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-4">
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 font-display text-2xl font-bold text-primary">
            {"€"}
          </span>
          <input
            ref={inputRef}
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            className="w-full rounded-2xl border-2 border-primary/30 bg-card py-5 pl-12 pr-5 font-display text-3xl font-bold text-foreground placeholder:text-muted-foreground/30 transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="What is it? (e.g., new shoes, dinner out)"
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-muted-foreground focus:outline-none focus:ring-2 focus:ring-muted-foreground/10"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${category === cat.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/50 bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={!price || parseFloat(price) <= 0}
          className="group mt-2 flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 font-display text-lg font-semibold text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
        >
          Show me the truth
        </button>
      </form>
    </div>
  )
}
