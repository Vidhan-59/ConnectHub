# ConnectHub - Professional Social Network

A modern, full-stack LinkedIn-like social platform built with Next.js 14, Supabase, and TypeScript. Features real-time authentication, user profiles, and a dynamic post feed with smooth animations.

## 🚀 Features

### ✅ **Core Features**
- **User Authentication**: Secure signup/login with Supabase Auth
- **User Profiles**: Comprehensive profiles with bio, avatar, and join date
- **Post Feed**: Create, read, and display text posts with timestamps
- **Profile Pages**: Individual user profiles showing their posts
- **Real-time Updates**: Live data synchronization with Supabase
- **Responsive Design**: Mobile-first, works on all devices

### ✨ **Enhanced Features**
- **Smooth Animations**: Framer Motion powered transitions
- **Modern UI**: Glass-morphism design with gradient backgrounds
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Toast notifications for user feedback
- **TypeScript**: Full type safety throughout the application
- **Row Level Security**: Secure data access with Supabase RLS

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Modern icon library
- **date-fns** - Date formatting and manipulation

### **Backend & Database**
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication & authorization
  - Row Level Security (RLS)
  - Auto-generated APIs

## 📁 Project Structure

\`\`\`
connecthub/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Dashboard page
│   ├── profile/[id]/           # Dynamic profile pages
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing/Auth page
├── components/
│   └── ui/                     # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── loading-spinner.tsx
│       └── ...
├── lib/
│   ├── supabase.ts            # Supabase client & types
│   └── utils.ts               # Utility functions
├── hooks/                     # Custom React hooks
│   └── use-toast.ts
├── scripts/
│   └── supabase-setup.sql     # Database schema
└── types/                     # TypeScript type definitions
\`\`\`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier available)

### 1. Clone & Install

\`\`\`bash
git clone <your-repo-url>
cd connecthub
npm install
\`\`\`

### 2. Supabase Setup

1. **Create a new Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and create project

2. **Get your project credentials**:
   - Go to Settings → API
   - Copy your Project URL and anon public key

3. **Set up environment variables**:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`
   
   Update \`.env.local\`:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`

4. **Run the database setup**:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and run the SQL from \`scripts/supabase-setup.sql\`

### 3. Start Development

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 🗄️ Database Schema

### Tables

**profiles**
- \`id\` (UUID, Primary Key) - References auth.users
- \`name\` (TEXT) - User's display name
- \`email\` (TEXT) - User's email address
- \`bio\` (TEXT, Optional) - User biography
- \`avatar_url\` (TEXT, Optional) - Profile picture URL
- \`created_at\` (TIMESTAMP) - Account creation date
- \`updated_at\` (TIMESTAMP) - Last profile update

**posts**
- \`id\` (UUID, Primary Key) - Auto-generated
- \`content\` (TEXT) - Post content
- \`user_id\` (UUID, Foreign Key) - References profiles.id
- \`created_at\` (TIMESTAMP) - Post creation date
- \`updated_at\` (TIMESTAMP) - Last post
- `created_at` (TIMESTAMP) - Post creation date
- `updated_at` (TIMESTAMP) - Last post update

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow public read access to profiles and posts
- Restrict write operations to authenticated users
- Users can only modify their own data

## 🔐 Authentication Flow

1. **Signup**: Creates user in `auth.users` and automatically creates profile
2. **Login**: Authenticates user and provides session
3. **Profile Creation**: Triggered automatically via database function
4. **Session Management**: Handled by Supabase Auth

## 🎨 UI/UX Features

### **Smooth Animations**
- Page transitions with Framer Motion
- Hover effects on interactive elements
- Loading states with skeleton screens
- Staggered animations for lists

### **Modern Design**
- Glass-morphism cards with backdrop blur
- Gradient backgrounds and text
- Consistent spacing and typography
- Mobile-responsive layout

### **User Experience**
- Toast notifications for feedback
- Loading spinners during operations
- Error handling with user-friendly messages
- Optimistic UI updates

## 🚀 Deployment

### **Frontend (Vercel)**

1. **Push to GitHub**:
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**:
   - Connect your GitHub repo to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

### **Database (Supabase)**
- Already hosted and managed by Supabase
- Automatic backups and scaling
- Global CDN for optimal performance

## 🔧 Environment Variables

\`\`\`env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional
NEXT_PUBLIC_APP_URL=https://your-domain.com
\`\`\`

## 📱 Demo Credentials

Create a demo user through Supabase Auth dashboard or use the signup form:

- **Email**: demo@connecthub.com
- **Password**: demo123456
- **Name**: Demo User
- **Bio**: Full Stack Developer passionate about creating amazing user experiences.

## 🔮 Future Enhancements

### **Phase 1**
- [ ] Like and comment functionality
- [ ] Real-time notifications
- [ ] Image upload for posts and avatars
- [ ] Search functionality

### **Phase 2**
- [ ] Connection requests and networking
- [ ] Direct messaging system
- [ ] Post categories and hashtags
- [ ] Advanced user profiles with experience/skills

### **Phase 3**
- [ ] Company pages and job postings
- [ ] Groups and communities
- [ ] Content recommendation algorithm
- [ ] Mobile app with React Native

## 🛠️ Development

### **Available Scripts**

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
\`\`\`

### **Code Quality**
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Framer Motion](https://framer.com/motion) for smooth animations
- [Lucide](https://lucide.dev) for the icon library

---

**Built with ❤️ for the Full Stack Development Challenge at CIAAN Cyber Tech Pvt Ltd**
\`\`\`

Now let me provide you with the complete setup steps for Supabase integration:

## 🔧 **Complete Supabase Setup Guide**

### **Step 1: Create Supabase Project**

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: ConnectHub
   - **Database Password**: (generate a strong password)
   - **Region**: Choose closest to your users
5. Click "Create new project"

### **Step 2: Configure Database**

1. Wait for project to be ready (2-3 minutes)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy the entire content from `scripts/supabase-setup.sql`
4. Paste and run the SQL script
5. Verify tables are created in **Table Editor**

### **Step 3: Set Up Authentication**

1. Go to **Authentication** → **Settings**
2. Configure **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**: 
   - `http://localhost:3000/dashboard`
   - `https://your-domain.com/dashboard` (for production)
4. Enable **Email confirmations** (optional)

### **Step 4: Get API Keys**

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**
   - **anon public key**
3. Add to your `.env.local` file

### **Step 5: Test Connection**

1. Start your development server: `npm run dev`
2. Try creating a new account
3. Check if profile is created in **Table Editor**
4. Test creating posts

## 🎯 **Key Features Implemented**

✅ **Supabase Integration**
- Real-time database with PostgreSQL
- Row Level Security for data protection
- Automatic profile creation on signup
- Secure authentication flow

✅ **Modern UI/UX**
- Framer Motion animations
- Glass-morphism design
- Responsive layout
- Loading states and error handling

✅ **TypeScript & Best Practices**
- Full type safety
- Clean code architecture
- Reusable components
- Performance optimizations

This complete setup gives you a production-ready LinkedIn clone with modern features and smooth user experience! 🚀
