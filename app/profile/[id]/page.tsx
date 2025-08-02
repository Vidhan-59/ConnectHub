"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Linkedin, ArrowLeft, Calendar, MessageSquare, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow, format } from "date-fns"

interface Profile {
  id: string
  name: string
  email: string
  bio?: string
  avatar_url?: string
  created_at: string
}

interface Post {
  id: string
  content: string
  created_at: string
  profiles: Profile
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchUserProfile()
    fetchUserPosts()
  }, [params.id])

  const checkAuth = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Session error:", error)
        router.push("/")
        return
      }

      if (!session?.user) {
        router.push("/")
        return
      }

      // Get current user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (profileError) {
        console.error("Profile error:", profileError)
        router.push("/")
        return
      }

      if (profile) {
        setCurrentUser(profile)
      }
    } catch (error) {
      console.error("Auth error:", error)
      router.push("/")
    }
  }

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", params.id).single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (
            id,
            name,
            email,
            bio,
            avatar_url,
            created_at
          )
        `)
        .eq("user_id", params.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error("Error fetching user posts:", error)
    } finally {
      setIsLoadingPosts(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="bg-white rounded-full p-6 mb-6 shadow-lg">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600 mb-6">The profile you're looking for doesn't exist.</p>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </motion.div>
              </Link>
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Linkedin className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ConnectHub
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
            <CardContent className="pt-0">
              <div className="flex items-start space-x-6 -mt-16 relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="flex-1 pt-20">
                  <motion.h1
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-gray-900 mb-2"
                  >
                    {user.name}
                  </motion.h1>
                  {user.bio && (
                    <motion.p
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-600 mb-4 text-lg"
                    >
                      {user.bio}
                    </motion.p>
                  )}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6"
                  >
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Joined {format(new Date(user.created_at), "MMMM yyyy")}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {posts.length} posts
                    </div>
                  </motion.div>
                  {currentUser?.id !== user.id && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="flex space-x-3"
                    >
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        Connect
                      </Button>
                      <Button variant="outline">Message</Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Posts Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <MessageSquare className="h-6 w-6 mr-2 text-blue-600" />
            {currentUser?.id === user.id ? "Your Posts" : `${user.name.split(" ")[0]}'s Posts`}
          </h2>

          {isLoadingPosts ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="py-16 text-center">
                  <MessageSquare className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">
                    {currentUser?.id === user.id
                      ? "You haven't shared anything yet. Start by creating your first post!"
                      : `${user.name.split(" ")[0]} hasn't shared anything yet.`}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={post.profiles.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{post.profiles.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{post.profiles.name}</h3>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          {post.profiles.bio && <p className="text-sm text-gray-600 mt-1">{post.profiles.bio}</p>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  )
}
