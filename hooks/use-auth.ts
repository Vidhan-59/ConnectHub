"use client"

import { useState, useEffect } from "react"
import { supabase, checkDatabaseSetup, testDatabaseConnection } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Profile {
  id: string
  name: string
  email: string
  bio?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [dbSetup, setDbSetup] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check database setup first
    checkDatabaseSetup().then(setDbSetup)

    // Get initial session
    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await handleUserSession(session.user)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        router.push("/")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // Test database connection when component mounts
    if (user) {
      testDatabaseConnection().then((result) => {
        if (!result.success) {
          console.error("Database test failed:", result.error)
          toast({
            title: "Database Error",
            description: "There might be an issue with the database setup. Check the console for details.",
            variant: "destructive",
          })
        }
      })
    }
  }, [user])

  const getInitialSession = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Session error:", error)
        setLoading(false)
        return
      }

      if (session?.user) {
        await handleUserSession(session.user)
      }
    } catch (error) {
      console.error("Initial session error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserSession = async (authUser: any) => {
    try {
      // Get or create profile
      let { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (profileError && profileError.code === "PGRST116") {
        // Profile doesn't exist, create it
        const newProfile = {
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
          email: authUser.email || "",
          bio: authUser.user_metadata?.bio || "",
        }

        const { data: createdProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([newProfile])
          .select()
          .single()

        if (insertError) {
          console.error("Error creating profile:", insertError)
          toast({
            title: "Error",
            description: "Failed to create profile. Please try again.",
            variant: "destructive",
          })
          return
        }

        profile = createdProfile
      } else if (profileError) {
        console.error("Profile fetch error:", profileError)
        toast({
          title: "Error",
          description: "Failed to load profile. Please refresh the page.",
          variant: "destructive",
        })
        return
      }

      if (profile) {
        setUser(profile)
      }
    } catch (error) {
      console.error("Handle user session error:", error)
      toast({
        title: "Error",
        description: "Authentication error. Please try logging in again.",
        variant: "destructive",
      })
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string, name: string, bio?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            bio: bio || "",
          },
        },
      })

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return {
    user,
    loading,
    dbSetup,
    signIn,
    signUp,
    signOut,
  }
}
