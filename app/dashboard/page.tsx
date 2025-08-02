"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Linkedin, LogOut, MessageSquare, Loader2, Plus, TrendingUp, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/hooks/use-auth"
import { PostInteractions } from "@/components/post-interactions"

interface Post {
  id: string
  content: string
  created_at: string
  like_count?: number
  comment_count?: number
  profiles: {
    id: string
    name: string
    email: string
    bio?: string
    avatar_url?: string
  }
}

export default function Dashboard() {
  const { user, loading, dbSetup, signOut } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (user && dbSetup) {
      fetchPosts()
    }
  }, [user, dbSetup])

  // Show database setup error
  if (!dbSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Database Setup Required</h2>
            <p className="text-gray-600 mb-4">
              There seems to be an issue with the database setup. Please run the SQL setup script in your Supabase
              dashboard.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/")
    return null
  }

  const fetchPosts = async () => {
    try {
      // Fetch posts with interaction counts
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
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Fetch posts error:", error)
        throw error
      }

      // Fetch interaction counts for each post
      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
          // Get like count
          const { count: likeCount } = await supabase
            .from("likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id)

          // Get comment count
          const { count: commentCount } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id)

          return {
            ...post,
            like_count: likeCount || 0,
            comment_count: commentCount || 0,
          }
        }),
      )

      setPosts(postsWithCounts)
    } catch (error: any) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load posts",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPosts(false)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim() || !user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert([{ content: newPost, user_id: user.id }])
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
        .single()

      if (error) {
        console.error("Create post error:", error)
        throw error
      }

      // Add the new post with zero counts
      const newPostWithCounts = {
        ...data,
        like_count: 0,
        comment_count: 0,
      }

      setPosts([newPostWithCounts, ...posts])
      setNewPost("")
      setShowCreatePost(false)
      toast({ title: "Success", description: "Post created successfully!" })
    } catch (error: any) {
      console.error("Error creating post:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
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
            <div className="flex items-center space-x-4">
              <Link href={`/profile/${user.id}`}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>Profile</span>
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Welcome back, {user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-600 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Stay connected with your professional network
          </p>
        </motion.div>

        {/* Create Post Section */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    {!showCreatePost ? (
                      <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-gray-500 bg-gray-50 hover:bg-gray-100 border-gray-200 transition-all hover:scale-[1.02]"
                          onClick={() => setShowCreatePost(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          What's on your mind, {user.name.split(" ")[0]}?
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleCreatePost}
                        className="space-y-4"
                      >
                        <Textarea
                          placeholder="Share your thoughts with the community..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          rows={4}
                          className="resize-none border-gray-200 focus:border-blue-500 transition-all"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowCreatePost(false)
                              setNewPost("")
                            }}
                            className="transition-all hover:scale-[1.02]"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isLoading || !newPost.trim()}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.02]"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Posting...
                              </>
                            ) : (
                              "Post"
                            )}
                          </Button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Posts Feed */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <MessageSquare className="h-6 w-6 mr-2 text-blue-600" />
            Recent Posts
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
                  <p className="text-gray-600 mb-6">Be the first to share something with the community!</p>
                  <Button
                    onClick={() => setShowCreatePost(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Create Your First Post
                  </Button>
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
                        <Link href={`/profile/${post.profiles.id}`}>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Avatar className="cursor-pointer h-12 w-12">
                              <AvatarImage src={post.profiles.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>{post.profiles.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          </motion.div>
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Link href={`/profile/${post.profiles.id}`}>
                              <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                                {post.profiles.name}
                              </h3>
                            </Link>
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
                      <p className="text-gray-900 whitespace-pre-wrap mb-6 leading-relaxed">{post.content}</p>

                      {/* Post Interactions */}
                      <PostInteractions
                        postId={post.id}
                        currentUser={user}
                        initialLikeCount={post.like_count || 0}
                        initialCommentCount={post.comment_count || 0}
                      />
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
