"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import {
    User,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    sendEmailVerification,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { logger } from "@/lib/logger"

interface UserProfile {
    hourlyWage: number
    workingDaysPerYear: number
    monthlyExpenses: number
    emergencyFundGoal?: number
    freedomGoal?: number
    investmentReturn?: number // Deprecated but kept for type safety/migration if needed, though we will ignore it.
}

interface AuthContextType {
    user: User | null
    profile: UserProfile | null
    loading: boolean
    isGuest: boolean
    signInWithGoogle: () => Promise<void>
    signInWithEmail: (email: string, password: string) => Promise<void>
    signUpWithEmail: (email: string, password: string) => Promise<User | void>
    signOut: () => Promise<void>
    continueAsGuest: () => void
    saveProfile: (profile: UserProfile) => Promise<void>
    loadProfile: () => Promise<UserProfile | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [isGuest, setIsGuest] = useState(false)

    async function loadProfileFromFirestore(uid: string): Promise<UserProfile | null> {
        try {
            logger.debug("auth", "Loading profile for user", uid)
            const docRef = doc(db, "users", uid)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()
                logger.debug("auth", "Profile found", data.profile)
                return data.profile as UserProfile
            }
            logger.debug("auth", "No profile document found for user", uid)
            return null
        } catch (error) {
            logger.error("auth", "Error loading profile", error)
            return null
        }
    }

    async function saveProfileToFirestore(uid: string, profile: UserProfile) {
        try {
            logger.debug("auth", "Saving profile for user", uid, profile)
            const docRef = doc(db, "users", uid)
            await setDoc(docRef, {
                email: user?.email,
                displayName: user?.displayName,
                photoURL: user?.photoURL,
                profile,
                updatedAt: new Date(),
            }, { merge: true })
            logger.info("auth", "Profile saved successfully to Firestore")
        } catch (error) {
            logger.error("auth", "Error saving profile", error)
            throw error
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
            setUser(nextUser)

            if (nextUser) {
                const isGoogleUser = nextUser.providerData.some(p => p.providerId === "google.com")

                if (!isGoogleUser && !nextUser.emailVerified) {
                    setProfile(null)
                    setIsGuest(false)
                    setLoading(false)
                    return
                }

                const userProfile = await loadProfileFromFirestore(nextUser.uid)
                setProfile(userProfile)
                setIsGuest(false)
            } else {
                const guestMode = localStorage.getItem("mindspend_guest_mode")
                if (guestMode === "true") {
                    setIsGuest(true)
                    const stored = localStorage.getItem("mindspend_profile")
                    if (stored) {
                        try {
                            setProfile(JSON.parse(stored))
                        } catch (e) {
                            logger.error("auth", "Failed to parse guest profile", e)
                        }
                    }
                }
            }

            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        try {
            await signInWithPopup(auth, provider)
        } catch (error) {
            logger.error("auth", "Error signing in with Google", error)
            throw error
        }
    }

    const signInWithEmail = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password)
        } catch (error) {
            logger.error("auth", "Error signing in with email", error)
            throw error
        }
    }

    const signUpWithEmail = async (email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            // Send verification email
            await sendEmailVerification(userCredential.user)
            return userCredential.user
        } catch (error) {
            logger.error("auth", "Error signing up", error)
            throw error
        }
    }

    const signOut = async () => {
        try {
            await firebaseSignOut(auth)
            setProfile(null)
            setIsGuest(false)
            localStorage.removeItem("mindspend_guest_mode")
            localStorage.removeItem("mindspend_profile")
        } catch (error) {
            logger.error("auth", "Error signing out", error)
            throw error
        }
    }

    const continueAsGuest = () => {
        setIsGuest(true)
        localStorage.setItem("mindspend_guest_mode", "true")
    }

    const saveProfile = async (newProfile: UserProfile) => {
        setProfile(newProfile)

        if (user) {
            // Save to Firestore for authenticated users
            await saveProfileToFirestore(user.uid, newProfile)
        } else if (isGuest) {
            // Save to localStorage for guests
            localStorage.setItem("mindspend_profile", JSON.stringify(newProfile))
        }
    }

    const loadProfile = async (): Promise<UserProfile | null> => {
        if (user) {
            return await loadProfileFromFirestore(user.uid)
        } else if (isGuest) {
            const stored = localStorage.getItem("mindspend_profile")
            if (stored) {
                try {
                    return JSON.parse(stored)
                } catch {
                    return null
                }
            }
        }
        return null
    }

    const value = {
        user,
        profile,
        loading,
        isGuest,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        continueAsGuest,
        saveProfile,
        loadProfile,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
