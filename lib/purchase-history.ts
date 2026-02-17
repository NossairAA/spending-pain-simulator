import { doc, setDoc, collection, addDoc, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export function isClientBlockedError(error: unknown): boolean {
    if (!error) return false

    const text = typeof error === "string"
        ? error
        : error instanceof Error
            ? `${error.name} ${error.message}`
            : JSON.stringify(error)

    return (
        text.includes("ERR_BLOCKED_BY_CLIENT") ||
        text.includes("net::ERR_BLOCKED_BY_CLIENT") ||
        text.includes("blocked by client")
    )
}

export interface PurchaseHistory {
    id?: string
    price: number
    label: string
    timestamp: Date
    profile: {
        hourlyWage: number
        workingDaysPerYear: number
        monthlyExpenses: number
        investmentReturn?: number
        emergencyFundGoal?: number
        freedomGoal?: number
    }
    calculations: {
        timeInMinutes: number
        futureValue10Years?: number
        groceryWeeks: number
        emergencyDays: number
    }
    decision?: "bought" | "skipped" | "undecided"
    regret?: boolean // Did they regret the decision?
    regretCheckedAt?: Date // When they answered the regret question
    category?: string // Optional category tag (food, tech, clothes, etc.)
    timeOfDay?: number // Hour of day (0-23) for pattern detection
}

/**
 * Save a purchase check to Firestore
 */
export async function savePurchaseHistory(
    userId: string,
    purchase: Omit<PurchaseHistory, "id" | "timestamp">
): Promise<string> {
    try {
        const purchasesRef = collection(db, "users", userId, "purchases")
        const docRef = await addDoc(purchasesRef, {
            ...purchase,
            timestamp: Timestamp.now(),
        })
        return docRef.id
    } catch (error) {
        console.error("Error saving purchase history:", error)
        throw error
    }
}

/**
 * Get purchase history for a user
 */
export async function getPurchaseHistory(
    userId: string,
    limitCount: number = 50
): Promise<PurchaseHistory[]> {
    try {
        const purchasesRef = collection(db, "users", userId, "purchases")
        const q = query(purchasesRef, orderBy("timestamp", "desc"), limit(limitCount))
        const querySnapshot = await getDocs(q)

        return querySnapshot.docs.map((doc) => {
            const data = doc.data()
            const rawTimestamp = data.timestamp

            let timestamp: Date
            if (rawTimestamp && typeof rawTimestamp.toDate === "function") {
                timestamp = rawTimestamp.toDate()
            } else if (typeof rawTimestamp === "number" || typeof rawTimestamp === "string") {
                timestamp = new Date(rawTimestamp)
            } else if (rawTimestamp instanceof Date) {
                timestamp = rawTimestamp
            } else {
                timestamp = new Date(0)
            }

            return {
                id: doc.id,
                ...data,
                timestamp,
            }
        }) as PurchaseHistory[]
    } catch (error) {
        console.error("Error getting purchase history:", error)
        throw error
    }
}

/**
 * Update purchase decision (bought/skipped) and regret status
 */
export async function updatePurchaseDecision(
    userId: string,
    purchaseId: string,
    decision: "bought" | "skipped",
    regret?: boolean
): Promise<void> {
    try {
        const purchaseRef = doc(db, "users", userId, "purchases", purchaseId)
        const updateData: {
            decision: "bought" | "skipped"
            regret?: boolean
            regretCheckedAt?: Timestamp
        } = { decision }

        if (regret !== undefined) {
            updateData.regret = regret
            updateData.regretCheckedAt = Timestamp.now()
        }

        await setDoc(purchaseRef, updateData, { merge: true })
    } catch (error) {
        console.error("Error updating purchase decision:", error)
        throw error
    }
}

/**
 * Delete a purchase from history
 */
export async function deletePurchase(userId: string, purchaseId: string): Promise<void> {
    try {
        const purchaseRef = doc(db, "users", userId, "purchases", purchaseId)
        await import("firebase/firestore").then(({ deleteDoc }) => deleteDoc(purchaseRef))
    } catch (error) {
        console.error("Error deleting purchase:", error)
        throw error
    }
}

/**
 * Delete a purchase from guest history
 */
export function deleteGuestPurchase(purchaseId: string) {
    try {
        const stored = localStorage.getItem("mindspend_purchase_history")
        if (stored) {
            const history = JSON.parse(stored) as PurchaseHistory[]
            const updatedHistory = history.filter((p) => p.id !== purchaseId)
            localStorage.setItem("mindspend_purchase_history", JSON.stringify(updatedHistory))
        }
    } catch (error) {
        console.error("Failed to delete guest purchase:", error)
    }
}

/**
 * Save purchase history to localStorage for guest users
 */
export function saveGuestPurchaseHistory(purchase: Omit<PurchaseHistory, "id" | "timestamp">) {
    try {
        const stored = localStorage.getItem("mindspend_purchase_history")
        const history: PurchaseHistory[] = stored ? JSON.parse(stored) : []

        const newPurchase: PurchaseHistory = {
            ...purchase,
            timestamp: new Date(),
            id: Date.now().toString(),
        }

        history.unshift(newPurchase)

        // Keep only last 50 items for guests
        const trimmed = history.slice(0, 50)
        localStorage.setItem("mindspend_purchase_history", JSON.stringify(trimmed))

        return newPurchase.id
    } catch (error) {
        console.error("Error saving guest purchase history:", error)
        throw error
    }
}

/**
 * Get purchase history from localStorage for guest users
 */
export function getGuestPurchaseHistory(): PurchaseHistory[] {
    try {
        const stored = localStorage.getItem("mindspend_purchase_history")
        if (!stored) return []

        const history = JSON.parse(stored) as PurchaseHistory[]
        return history.map((item) => ({
            ...item,
            timestamp: new Date(item.timestamp),
        }))
    } catch (error) {
        console.error("Error getting guest purchase history:", error)
        return []
    }
}
