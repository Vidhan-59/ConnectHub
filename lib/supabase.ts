import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          content: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
    }
  }
}

// Helper function to check if tables exist and have proper relationships
export const checkDatabaseSetup = async () => {
  try {
    // Test if we can query posts with profiles
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        content,
        created_at,
        profiles!posts_user_id_fkey (
          id,
          name,
          email,
          bio,
          avatar_url
        )
      `)
      .limit(1)

    if (error) {
      console.error("Database setup issue:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Database connection error:", error)
    return false
  }
}

// Add this function to test database setup
export const testDatabaseConnection = async () => {
  try {
    console.log("Testing database connection...")

    // Test basic connection
    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id, name").limit(1)

    if (profilesError) {
      console.error("Profiles table error:", profilesError)
      return { success: false, error: profilesError }
    }

    // Test likes table
    const { data: likes, error: likesError } = await supabase.from("likes").select("id").limit(1)

    if (likesError) {
      console.error("Likes table error:", likesError)
      return { success: false, error: likesError }
    }

    // Test comments table
    const { data: comments, error: commentsError } = await supabase.from("comments").select("id").limit(1)

    if (commentsError) {
      console.error("Comments table error:", commentsError)
      return { success: false, error: commentsError }
    }

    console.log("Database connection test successful!")
    return { success: true }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return { success: false, error }
  }
}
