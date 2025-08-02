"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Linkedin, Users, MessageSquare, User, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user, loading, signIn, signUp } = useAuth()

  // Redirect if already authenticated
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

  if (user) {
    router.push("/dashboard")
    return null
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      } else if (data.user) {
        toast({ title: "Success", description: "Logged in successfully!" })
        router.push("/dashboard")
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const bio = formData.get("bio") as string

    try {
      const { data, error } = await signUp(email, password, name, bio)

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      } else if (data.user) {
        toast({
          title: "Success",
          description: "Account created successfully!",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  // Rest of the component remains the same...
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
          </div>
        </div>
      </motion.header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold text-gray-900 mb-2"
            >
              Welcome to ConnectHub
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 mb-8"
            >
              Connect with professionals and share your thoughts
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-4 mb-8"
            >
              {[
                { icon: Users, label: "Connect" },
                { icon: MessageSquare, label: "Share" },
                { icon: User, label: "Profile" },
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  className="text-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <feature.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{feature.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Get Started</CardTitle>
                <CardDescription className="text-center">Sign in to your account or create a new one</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="transition-all">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="register" className="transition-all">
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <motion.div
                        className="space-y-2"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          className="transition-all focus:scale-[1.02]"
                        />
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          required
                          className="transition-all focus:scale-[1.02]"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </motion.div>
                    </form>

                    <motion.div
                      className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="text-sm text-gray-700 mb-2 font-medium">Demo Account:</p>
                      <p className="text-xs text-gray-600">Create a new account to test the app</p>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <motion.div
                        className="space-y-2"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          required
                          className="transition-all focus:scale-[1.02]"
                        />
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          required
                          className="transition-all focus:scale-[1.02]"
                        />
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          required
                          minLength={6}
                          className="transition-all focus:scale-[1.02]"
                        />
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Label htmlFor="bio">Bio (Optional)</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          placeholder="Tell us about yourself..."
                          rows={3}
                          className="transition-all focus:scale-[1.02] resize-none"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
