"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageSquare, Share2, Send, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"

interface Profile {
  id: string
  name: string
  email: string
  bio?: string
  avatar_url?: string
}

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: Profile
}

interface PostInteractionsProps {
  postId: string
  currentUser: Profile
  initialLikeCount?: number
  initialCommentCount?: number
  initialIsLiked?: boolean
}

export function PostInteractions({
  postId,
  currentUser,
  initialLikeCount = 0,
  initialCommentCount = 0,
  initialIsLiked = false,
}: PostInteractionsProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [commentCount, setCommentCount] = useState(initialCommentCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoadingLike, setIsLoadingLike] = useState(false)
  const [isLoadingComment, setIsLoadingComment] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (currentUser) {
      checkIfLiked()
    }
  }, [postId, currentUser])

  const checkIfLiked = async () => {
    try {
      const { data, error } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", currentUser.id)
        .maybeSingle() // Use maybeSingle instead of single to avoid errors when no record exists

      if (error) {
        console.error("Error checking like status:", error)
        return
      }

      setIsLiked(!!data)
    } catch (error) {
      console.error("Error checking like status:", error)
    }
  }

  const handleLike = async () => {
    if (isLoadingLike) return

    setIsLoadingLike(true)
    console.log("Toggling like for post:", postId, "user:", currentUser.id, "current state:", isLiked)

    try {
      if (isLiked) {
        // Unlike
        console.log("Attempting to unlike...")
        const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", currentUser.id)

        if (error) {
          console.error("Unlike error:", error)
          throw error
        }

        console.log("Successfully unliked")
        setIsLiked(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
        toast({
          title: "Success",
          description: "Post unliked!",
        })
      } else {
        // Like
        console.log("Attempting to like...")
        const { error } = await supabase.from("likes").insert([
          {
            post_id: postId,
            user_id: currentUser.id,
          },
        ])

        if (error) {
          console.error("Like error:", error)
          throw error
        }

        console.log("Successfully liked")
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
        toast({
          title: "Success",
          description: "Post liked!",
        })
      }
    } catch (error: any) {
      console.error("Error toggling like:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update like. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingLike(false)
    }
  }

  const fetchComments = async () => {
    if (isLoadingComments) return

    setIsLoadingComments(true)
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          profiles!comments_user_id_fkey (
            id,
            name,
            email,
            bio,
            avatar_url
          )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

      if (error) throw error

      setComments(data || [])
    } catch (error: any) {
      console.error("Error fetching comments:", error)
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isLoadingComment) return

    setIsLoadingComment(true)
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            content: newComment.trim(),
            post_id: postId,
            user_id: currentUser.id,
          },
        ])
        .select(`
          id,
          content,
          created_at,
          profiles!comments_user_id_fkey (
            id,
            name,
            email,
            bio,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      setComments((prev) => [...prev, data])
      setCommentCount((prev) => prev + 1)
      setNewComment("")
      toast({
        title: "Success",
        description: "Comment added successfully!",
      })
    } catch (error: any) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingComment(false)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Check out this post on ConnectHub",
          text: "Interesting post from ConnectHub",
          url: window.location.href,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Success",
          description: "Post link copied to clipboard!",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast({
        title: "Error",
        description: "Failed to share post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCommentsClick = () => {
    setShowComments(true)
    if (comments.length === 0) {
      fetchComments()
    }
  }

  return (
    <div className="flex items-center space-x-6 pt-4 border-t border-gray-100">
      {/* Like Button */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLoadingLike}
          className={`transition-colors ${
            isLiked ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-red-500"
          }`}
        >
          {isLoadingLike ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
          )}
          {likeCount > 0 ? `${likeCount} Like${likeCount !== 1 ? "s" : ""}` : "Like"}
        </Button>
      </motion.div>

      {/* Comment Button */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogTrigger asChild>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCommentsClick}
              className="text-gray-600 hover:text-blue-500 transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {commentCount > 0 ? `${commentCount} Comment${commentCount !== 1 ? "s" : ""}` : "Comment"}
            </Button>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading comments...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No comments yet. Be the first to comment!</div>
            ) : (
              <AnimatePresence>
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex space-x-3 p-3 rounded-lg bg-gray-50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.profiles.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {comment.profiles.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-900">{comment.profiles.name}</h4>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleComment} className="border-t pt-4 space-y-3">
            <div className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="resize-none border-gray-200 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim() || isLoadingComment}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoadingComment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Comment
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Share Button */}
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="text-gray-600 hover:text-green-500 transition-colors"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </motion.div>
    </div>
  )
}
