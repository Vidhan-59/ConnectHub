const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")

const app = express()
const PORT = 3001
const JWT_SECRET = "your-secret-key-change-in-production"

// Middleware
app.use(cors())
app.use(express.json())

// In-memory database (replace with real database in production)
const users = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // demo123
    bio: "Full Stack Developer passionate about creating amazing user experiences.",
    createdAt: new Date().toISOString(),
  },
]

const posts = [
  {
    id: "1",
    content:
      "Welcome to ConnectHub! This is a demo post to show how the platform works. Feel free to create your own posts and connect with other professionals.",
    authorId: "1",
    createdAt: new Date().toISOString(),
  },
]

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" })
    }
    req.user = user
    next()
  })
}

// Helper function to get user by id
const getUserById = (id) => {
  return users.find((user) => user.id === id)
}

// Helper function to get posts with author info
const getPostsWithAuthors = (postList = posts) => {
  return postList
    .map((post) => {
      const author = getUserById(post.authorId)
      return {
        ...post,
        author: {
          id: author.id,
          name: author.name,
          email: author.email,
          bio: author.bio,
        },
      }
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// Routes

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, bio } = req.body

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email)
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      bio: bio || "",
      createdAt: new Date().toISOString(),
    }

    users.push(user)

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET)

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    res.status(201).json({ token, user: userWithoutPassword })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = users.find((user) => user.email === email)
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET)

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    res.json({ token, user: userWithoutPassword })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Get all posts
app.get("/api/posts", authenticateToken, (req, res) => {
  try {
    const postsWithAuthors = getPostsWithAuthors()
    res.json(postsWithAuthors)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Create post
app.post("/api/posts", authenticateToken, (req, res) => {
  try {
    const { content } = req.body
    const userId = req.user.userId

    const post = {
      id: uuidv4(),
      content,
      authorId: userId,
      createdAt: new Date().toISOString(),
    }

    posts.push(post)

    // Return post with author info
    const author = getUserById(userId)
    const postWithAuthor = {
      ...post,
      author: {
        id: author.id,
        name: author.name,
        email: author.email,
        bio: author.bio,
      },
    }

    res.status(201).json(postWithAuthor)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Get user profile
app.get("/api/users/:id", authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const { password: _, ...userWithoutPassword } = user
    res.json(userWithoutPassword)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Get user posts
app.get("/api/users/:id/posts", authenticateToken, (req, res) => {
  try {
    const userPosts = posts.filter((post) => post.authorId === req.params.id)
    const postsWithAuthors = getPostsWithAuthors(userPosts)
    res.json(postsWithAuthors)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
