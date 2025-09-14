# 🎮 Gamified Todo Application

A modern, feature-rich todo application that gamifies productivity with XP points, achievements, streaks, and comprehensive analytics. Built with Next.js 15, TypeScript, Supabase, and designed as a Progressive Web App (PWA).

![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.57.2-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

## ✨ Features

### 🎯 Core Functionality
- **Task Management**: Create, edit, and organize todos with categories and difficulty levels
- **Gamification System**: Earn XP and coins based on task difficulty and completion timing
- **Achievement System**: Unlock badges and rewards for various milestones
- **Streak Tracking**: Maintain daily completion streaks with bonus rewards
- **Progressive Web App**: Install and use offline with service worker support

### 📊 Advanced Features
- **Analytics Dashboard**: Comprehensive productivity insights with charts and trends
- **Calendar Integration**: Visual task scheduling and due date management
- **Vision Board**: Set and track long-term goals (1, 3, 5, or 10-year plans)
- **Profile System**: Level progression, avatar management, and statistics
- **Offline Support**: Full functionality without internet connection

### 🔧 Technical Features
- **Real-time Sync**: Powered by Supabase for instant updates
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme detection and manual switching
- **Security**: Protected routes with middleware and authentication
- **Performance**: Optimized with Next.js 15 and Turbopack

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/prakash12011/Gamified-Todo-Application.git
   cd Gamified-Todo-Application
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_FRONTEND_URL=your hosted website URL
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### Setting up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Set up the required database tables (see database schema below)
3. Configure authentication providers
4. Add your project URL and API key to `.env.local`

## 🗄️ Database Schema

The application uses the following main tables:

- **profiles**: User profiles with XP, level, coins, and streak data
- **todos**: Tasks with categories, difficulty, and reward information
- **achievements**: User-earned badges and milestones
- **vision_plans**: Long-term goal planning and tracking

## 🎮 Gamification System

### XP & Rewards
- **Easy tasks**: 10 XP, 5 coins
- **Medium tasks**: 20 XP, 10 coins  
- **Hard tasks**: 40 XP, 20 coins
- **Epic tasks**: 80 XP, 40 coins
- **On-time bonus**: +20% XP

### Achievement Categories
- **Streak achievements**: Daily completion streaks
- **Completion milestones**: Total tasks completed
- **XP milestones**: Experience point thresholds
- **Category mastery**: Excellence in specific areas
- **Special events**: Unique accomplishments

## 📱 Progressive Web App

The application is fully PWA-compatible with:
- **Offline functionality**: Continue working without internet
- **Install prompt**: Add to home screen on mobile devices
- **Background sync**: Automatic sync when connection returns
- **Push notifications**: Task reminders and achievement alerts
- **Responsive design**: Optimized for all screen sizes

## 🛠️ Built With

### Core Technologies
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service with PostgreSQL
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework

### UI Components
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible components
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### Data Visualization
- **[Recharts](https://recharts.org/)** - Charts and analytics
- **[date-fns](https://date-fns.org/)** - Date manipulation library

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[React Hook Form](https://react-hook-form.com/)** - Form management
- **[Zod](https://github.com/colinhacks/zod)** - Schema validation

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main application dashboard
│   ├── login/             # Authentication pages
│   ├── signup/            
│   ├── offline/           # PWA offline page
│   └── api/               # API routes
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard-specific components
│   ├── gamification/      # Game elements (achievements, etc.)
│   ├── pwa/               # PWA-related components
│   ├── todos/             # Task management components
│   ├── ui/                # Reusable UI components
│   └── vision/            # Vision board components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
│   ├── auth/              # Authentication utilities
│   └── supabase/          # Supabase client and functions
└── types/                 # TypeScript type definitions
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to [Vercel](https://vercel.com)
2. Add environment variables in the Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- **Netlify**: With Next.js runtime
- **Railway**: Full-stack deployment
- **Docker**: Using the included Dockerfile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/prakash12011/Gamified-Todo-Application/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🙏 Acknowledgments

- [Next.js team](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn](https://ui.shadcn.com/) for the beautiful component library
- All contributors and the open-source community

---

**Made with ❤️ by [Prakash](https://github.com/prakash12011)**
