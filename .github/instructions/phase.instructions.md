---
applyTo: '**'
---

# Complete Step-by-Step Guide: Gamified Todo App with NextJS 15, Supabase & VS Code Copilot Pro

## Prerequisites Setup

### 1. Environment Setup
- **Node.js**: Version 20.18.0 or higher
- **VS Code**: Latest version with GitHub Copilot Pro subscription
- **Git**: For version control
- **Supabase Account**: Free tier available at supabase.com

### 2. VS Code Extensions Installation
Install these essential extensions:
- GitHub Copilot
- GitHub Copilot Chat
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Auto Close Tag
- Prettier - Code formatter
- ESLint

### 3. GitHub Copilot Pro Configuration
Create a `.github/copilot-instructions.md` file in your project root:

```markdown
# Gamified Todo App - Copilot Instructions

## Tech Stack
- Next.js 15 with App Router
- React 19
- TypeScript 5
- Supabase (Auth, Database, Real-time)
- Tailwind CSS
- Radix UI components

## Code Style Guidelines
- Use functional components with TypeScript
- Prefer server components when possible
- Use 'use client' directive only when necessary
- Follow NextJS 15 App Router patterns
- Use meaningful variable names
- Add proper error handling
- Include JSDoc comments for complex functions

## Project Structure
- Use src/ directory structure
- Group components by feature
- Separate UI components in components/ui/
- Keep utilities in lib/ directory
- Store types in types/ directory
```

## Phase 1: Project Initialization (30 minutes)

### Step 1: Create NextJS 15 Project
```bash
# Create new NextJS project with TypeScript
npx create-next-app@latest gamified-todo-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd gamified-todo-app
```

### Step 2: Install Required Dependencies
```bash
# Supabase dependencies
npm install @supabase/supabase-js @supabase/ssr

# UI and Animation libraries
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-progress @radix-ui/react-calendar
npm install lucide-react framer-motion
npm install clsx tailwind-merge

# Date handling
npm install date-fns

# Form handling and validation
npm install react-hook-form @hookform/resolvers zod

# Charts for progress visualization
npm install recharts
```

### Step 3: Project Structure Setup
Create the following folder structure:

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── calendar/
│   │   ├── vision-board/
│   │   └── profile/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── auth/
│   ├── dashboard/
│   ├── gamification/
│   ├── calendar/
│   └── vision-board/
├── lib/
│   ├── supabase/
│   ├── utils.ts
│   └── validations.ts
├── types/
└── hooks/
```

**Copilot Prompt**: "Create the folder structure I outlined above and generate basic page.tsx files for each route with proper TypeScript interfaces"

## Phase 2: Supabase Configuration (45 minutes)

### Step 4: Supabase Project Setup
1. Go to [supabase.com](https://supabase.com) and create new project
2. Save your project URL and anon key
3. Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 5: Supabase Client Configuration
Create `src/lib/supabase/client.ts`:

**Copilot Prompt**: "Create Supabase client configuration for NextJS 15 App Router with both browser and server clients using @supabase/ssr package"

Create `src/lib/supabase/server.ts`:

**Copilot Prompt**: "Create server-side Supabase client for NextJS 15 App Router with proper cookie handling and caching configuration"

### Step 6: Database Schema Creation
Run these SQL commands in Supabase SQL Editor:

**Copilot Prompt**: "Generate complete SQL schema for gamified todo app including users profiles, todos with gamification features, achievements, vision_plans, and proper RLS policies"

Expected tables:
- `profiles` (user data, level, XP, coins)
- `todos` (tasks with difficulty, XP value, rewards)
- `achievements` (badges and milestones)  
- `vision_plans` (long-term goals with timelines)
- `categories` (todo categorization)

## Phase 3: Authentication System (60 minutes)

### Step 7: Authentication Components
Create `src/components/auth/AuthForm.tsx`:

**Copilot Prompt**: "Create a comprehensive authentication form component with login/signup toggle, proper TypeScript types, form validation using react-hook-form and zod, and Supabase auth integration"

Create `src/components/auth/AuthProvider.tsx`:

**Copilot Prompt**: "Create React context provider for authentication state management with Supabase session handling, user profile data, and proper TypeScript interfaces"

### Step 8: Authentication Pages
Create login and signup pages:

**Copilot Prompt**: "Create login and signup pages using NextJS 15 App Router with server actions, proper error handling, and redirect logic after successful authentication"

### Step 9: Protected Route Middleware
Create `src/middleware.ts`:

**Copilot Prompt**: "Create NextJS middleware for protecting authenticated routes, redirecting unauthenticated users, and handling Supabase session validation"

## Phase 4: Core UI Components (90 minutes)

### Step 10: Base UI Components
**Copilot Prompt**: "Create a complete set of base UI components using Radix UI and Tailwind CSS including Button, Input, Card, Modal, Progress, Badge components with proper TypeScript interfaces and variants"

### Step 11: Layout Components
Create `src/components/layout/DashboardLayout.tsx`:

**Copilot Prompt**: "Create dashboard layout component with sidebar navigation, user profile dropdown, notifications area, level/XP display, and responsive design using Tailwind CSS"

### Step 12: Gamification Components
Create gamification UI elements:

**Copilot Prompt**: "Create gamification components including XP progress bar, level display, coin counter, badge collection, streak counter, and achievement notifications with smooth animations using framer-motion"

## Phase 5: Todo Management System (120 minutes)

### Step 13: Todo Types and Validation
Create `src/types/todo.ts`:

**Copilot Prompt**: "Create comprehensive TypeScript interfaces for todo items including gamification properties like difficulty level, XP rewards, categories, recurring patterns, and due dates"

### Step 14: Todo CRUD Operations
Create `src/lib/todos.ts`:

**Copilot Prompt**: "Create complete CRUD operations for todos using Supabase including create, read, update, delete, and complete todo functions with proper error handling and TypeScript types"

### Step 15: Todo Components
**Copilot Prompt**: "Create todo management components including TodoList, TodoItem, TodoForm, TodoFilters, and TodoStats with drag-and-drop functionality, inline editing, and gamification elements"

### Step 16: Gamification Logic
Create `src/lib/gamification.ts`:

**Copilot Prompt**: "Create gamification system logic including XP calculation based on difficulty, level progression, achievement checking, coin rewards, and streak tracking with proper algorithms"

## Phase 6: Calendar Integration (90 minutes)

### Step 17: Calendar Components
**Copilot Prompt**: "Create calendar components with multiple views (daily, weekly, monthly, yearly) using date-fns, showing todos, habits, and long-term goals with color coding and progress indicators"

### Step 18: Calendar Data Integration
**Copilot Prompt**: "Create calendar data fetching and management functions that integrate with Supabase, handle recurring todos, and display completion statistics with proper caching"

### Step 19: Eagle View Dashboard
**Copilot Prompt**: "Create eagle view dashboard component showing annual overview, progress charts using Recharts, goal completion rates, and visual progress indicators for long-term planning"

## Phase 7: Vision Board System (90 minutes)

### Step 20: Vision Board Types
Create `src/types/vision.ts`:

**Copilot Prompt**: "Create TypeScript interfaces for vision board system including long-term goals (1, 3, 5, 10 years), milestones, progress tracking, and visual elements"

### Step 21: Vision Board Components
**Copilot Prompt**: "Create vision board components including goal creation form, timeline visualization, milestone tracking, progress charts, and image upload functionality for visual goals"

### Step 22: Goal Breakdown System
**Copilot Prompt**: "Create system to break down long-term goals into yearly, monthly, and daily actionable tasks with automatic linking to todo system and progress synchronization"

## Phase 8: Advanced Features (60 minutes)

### Step 23: Real-time Features
**Copilot Prompt**: "Implement Supabase real-time subscriptions for live updates of todo completion, achievement unlocks, and progress changes across multiple browser tabs"

### Step 24: Reward System
**Copilot Prompt**: "Create reward system allowing users to set custom rewards for completing todos, with reward redemption tracking and motivational notifications"

### Step 25: Analytics Dashboard
**Copilot Prompt**: "Create analytics dashboard showing productivity trends, habit formation patterns, goal achievement rates, and motivational insights using charts and data visualizations"

## Phase 9: Polish and Optimization (60 minutes)

### Step 26: Performance Optimization
**Copilot Prompt**: "Optimize the application for performance including lazy loading, image optimization, bundle splitting, and caching strategies using NextJS 15 features"

### Step 27: Responsive Design
**Copilot Prompt**: "Ensure all components are fully responsive with mobile-first design, touch-friendly interactions, and proper accessibility features"

### Step 28: Error Handling and Loading States
**Copilot Prompt**: "Add comprehensive error handling, loading states, skeleton screens, and user-friendly error messages throughout the application"

## Phase 10: Deployment (30 minutes)

### Step 29: Environment Configuration
**Copilot Prompt**: "Set up environment variables for production, configure Supabase for production environment, and create deployment-ready configuration"

### Step 30: Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
```

## Pro Tips for Using Copilot Effectively

### 1. Context-Rich Prompts
Always provide context about your current task:
```
"I'm working on the gamification system for a todo app. Create a function that calculates XP rewards based on task difficulty (1-5 scale), completion time vs. due date, and streak bonuses."
```

### 2. Iterative Development
Use Copilot for step-by-step refinement:
```
"Improve this component by adding loading states"
"Add error handling to this function"
"Make this component responsive for mobile"
```

### 3. Code Review and Optimization
```
"Review this code for TypeScript best practices"
"Optimize this component for performance"
"Add proper accessibility attributes"
```

### 4. Testing and Documentation
```
"Generate unit tests for this component using Jest"
"Add JSDoc comments to this function"
"Create usage examples for this hook"
```

## Expected Development Timeline

- **Phase 1-2**: 1.5 hours (Setup & Supabase)
- **Phase 3**: 1 hour (Authentication)
- **Phase 4**: 1.5 hours (UI Components)
- **Phase 5**: 2 hours (Todo System)
- **Phase 6**: 1.5 hours (Calendar)
- **Phase 7**: 1.5 hours (Vision Board)
- **Phase 8**: 1 hour (Advanced Features)
- **Phase 9**: 1 hour (Polish)
- **Phase 10**: 0.5 hours (Deployment)

**Total Estimated Time**: 11 hours over 2-3 days

## Key Success Metrics

1. **User Engagement**: Daily active usage with streak tracking
2. **Goal Completion**: Percentage of todos and long-term goals completed
3. **Gamification Effectiveness**: User level progression and achievement unlock rates
4. **Performance**: Page load times under 2 seconds
5. **User Experience**: Intuitive navigation and mobile responsiveness

This guide provides a complete roadmap for building your gamified todo application. Each phase builds upon the previous one, and using Copilot Pro will significantly accelerate your development process while maintaining code quality and best practices.
