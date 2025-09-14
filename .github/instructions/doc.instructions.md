---
applyTo: '**'
---

# Overnight MVP: Gamified Todo App with Copilot MCP

## Project Overview: Rapid Prototype Development

**Goal**: Build a functional gamified todo MVP in one night using VS Code Copilot with MCP integration

**Tech Stack**:
- NextJS 15 + TypeScript
- Supabase (Database, Auth, Real-time) - *MCP Connected*
- shadcn/ui (UI Components) - *MCP Connected* 
- Tailwind CSS
- Framer Motion (animations)

## Quick Setup (15 minutes)

### Step 1: Project Initialization
```bash
# Create NextJS project
npx create-next-app@latest gamified-todo --typescript --tailwind --eslint --app --src-dir

cd gamified-todo

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install framer-motion lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-progress
npm install recharts date-fns
```

### Step 2: Configure MCP Servers
Create `.vscode/mcp.json`:
```json
{
  "servers": {
    "shadcn": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-shadcn"]
    },
    "supabase": {
      "command": "npx", 
      "args": ["-y", "@supabase/mcp-server-supabase@latest", "--read-only"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Step 3: Initialize shadcn/ui
**Copilot Prompt**: "@shadcn Initialize shadcn/ui in this NextJS project with all necessary configurations and install button, card, input, dialog, progress, and badge components"

## Page Documentation & Responsibilities

### 1. Landing Page (`/page.tsx`)
**Responsibility**: Marketing page with hero section, features, and CTA
**UI Framework**: Use Preline UI hero sections + shadcn components
**Supabase Integration**: None (static page)

**Copilot Prompt**: 
```
Create a modern landing page for a gamified todo app using shadcn/ui components. Include:
- Hero section with app preview
- Feature cards highlighting gamification (XP, levels, rewards)  
- CTA button leading to signup
- Clean, modern design with animations
Use framer-motion for scroll animations
```

### 2. Authentication Pages (`/auth/login` & `/auth/signup`)
**Responsibility**: User authentication with Supabase Auth
**UI Framework**: shadcn/ui forms + DaisyUI styling
**Supabase Integration**: Auth signup/login, profile creation

**Copilot Prompt**:
```
@supabase Create authentication system with:
- Login/signup forms using shadcn/ui form components
- Supabase Auth integration with email/password
- Social login (Google, GitHub) 
- Automatic profile creation in profiles table
- Error handling and loading states
- Redirect to dashboard after successful auth
```

### 3. Dashboard Home (`/dashboard/page.tsx`)
**Responsibility**: Main dashboard overview with stats and quick actions
**UI Framework**: shadcn/ui cards + Preline dashboard components
**Supabase Integration**: Fetch user stats, recent todos, achievements

**Database Tables Needed**:
```sql
-- @supabase create these tables
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty INTEGER DEFAULT 1, -- 1-5 scale
  xp_reward INTEGER DEFAULT 10,
  coin_reward INTEGER DEFAULT 5,
  category TEXT DEFAULT 'general',
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_earned INTEGER DEFAULT 0
);
```

**Copilot Prompt**:
```
@supabase Create a dashboard homepage with:
- User level progress bar showing XP to next level
- Current streak counter with fire emoji animation
- Coin balance display
- Today's todo summary (completed/total)
- Quick "Add Todo" floating action button
- Recent achievements carousel
- Weekly progress chart using recharts
- All data fetched from Supabase with real-time subscriptions
Use shadcn/ui for layout and Preline dashboard components for stats
```

### 4. Todo Management (`/dashboard/todos`)
**Responsibility**: CRUD operations for todos with gamification
**UI Framework**: shadcn/ui data tables + Flowbite todo components
**Supabase Integration**: Todo CRUD, XP calculations, achievement triggers

**Copilot Prompt**:
```
@supabase @shadcn Create comprehensive todo management with:
- Todo list with shadcn/ui data table
- Difficulty level selector (1-5 stars)
- Category tags (work, personal, health, learning)
- Due date picker with calendar
- Drag-and-drop reordering
- Bulk actions (complete multiple, delete)
- Animated XP gain on completion (+10, +25, etc.)
- Achievement notifications when earned
- Search and filter functionality
- Real-time updates when todos change
Include gamification logic: XP = difficulty * 10, coins = difficulty * 5
```

### 5. Calendar View (`/dashboard/calendar`)
**Responsibility**: Calendar interface showing todos and long-term goals
**UI Framework**: shadcn/ui calendar + custom monthly/yearly views
**Supabase Integration**: Fetch todos by date, vision plan milestones

**Additional Tables**:
```sql
CREATE TABLE vision_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  timeline_years INTEGER, -- 1, 3, 5, 10
  target_date DATE,
  category TEXT,
  progress_percentage INTEGER DEFAULT 0,
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Copilot Prompt**:
```
@supabase @shadcn Create multi-view calendar system:
- Monthly view with todo dots on dates
- Yearly "eagle view" showing goal progress
- Timeline view for 1/3/5/10 year vision plans
- Color-coded categories and difficulty levels
- Click dates to add todos or milestones
- Progress heat map showing completion density
- Milestone celebration animations
- Integration with vision_plans table for long-term goals
Use shadcn/ui calendar component as base, extend with custom views
```

### 6. Vision Board (`/dashboard/vision`)
**Responsibility**: Long-term goal planning and visualization
**UI Framework**: Custom components with shadcn/ui base + Flowbite cards
**Supabase Integration**: Vision plans CRUD, milestone tracking, image storage

**Copilot Prompt**:
```
@supabase Create vision board interface:
- Drag-and-drop goal cards with images
- Timeline selector (1/3/5/10 years) 
- Category organization (career, health, relationships, financial)
- Progress tracking with percentage completion
- Milestone breakdown (yearly -> monthly -> daily tasks)
- Visual progress charts with recharts
- Image upload for goal visualization
- Auto-link vision goals to daily todos
- Eagle-eye dashboard showing all goals at once
Use Supabase storage for images, real-time for collaborative planning
```

### 7. Profile & Gamification (`/dashboard/profile`)
**Responsibility**: User profile, level system, badges, and achievements
**UI Framework**: shadcn/ui profile cards + DaisyUI badge components
**Supabase Integration**: Profile updates, achievement system, level calculations

**Additional Tables**:
```sql
CREATE TABLE badge_definitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  requirement_type TEXT, -- 'streak', 'completion', 'xp', 'category'
  requirement_value INTEGER,
  xp_reward INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Copilot Prompt**:
```
@supabase Create comprehensive gamification system:
- User profile with avatar, level, total XP, coins
- Level progression system (100 XP per level)
- Badge collection display with earned/available badges
- Achievement history with timestamps
- Streak tracking with visual calendar
- XP breakdown by category (work, personal, etc.)
- Leaderboard (optional social feature)
- Reward redemption system (spend coins)
- Progress animations and celebrations
- Badge unlock notifications with confetti
Auto-calculate levels: Level = floor(total_xp / 100) + 1
```

### 8. Analytics Dashboard (`/dashboard/analytics`)
**Responsibility**: Data visualization and productivity insights
**UI Framework**: Preline dashboard components + shadcn/ui charts
**Supabase Integration**: Aggregate queries, trend analysis

**Copilot Prompt**:
```
@supabase Create analytics dashboard with recharts:
- Weekly/monthly completion trends (line chart)
- Category breakdown (pie chart)
- Difficulty distribution (bar chart)
- XP earned over time (area chart)
- Streak analysis and patterns
- Most productive days/hours heatmap
- Goal achievement rate tracking
- Habit formation insights
- Export data functionality
All charts responsive with dark mode support
```

## Overnight Development Schedule

### Hour 1-2: Foundation (Setup + Auth)
**Copilot Prompts**:
```
1. @supabase Set up complete project structure with all necessary tables and RLS policies
2. @shadcn Create authentication pages with social login
3. Set up middleware for protected routes
```

### Hour 3-4: Core Todo System  
**Copilot Prompts**:
```
1. @supabase @shadcn Create todo CRUD with gamification features
2. Implement XP calculation and level progression logic
3. Add real-time todo updates and animations
```

### Hour 5-6: Dashboard & Calendar
**Copilot Prompts**:
```
1. @shadcn Build dashboard with stats and progress visualization
2. @supabase Create calendar views with todo integration
3. Add achievement system with badge notifications
```

### Hour 7-8: Vision Board & Polish
**Copilot Prompts**:
```
1. @supabase Create vision board with long-term goal tracking
2. Add analytics dashboard with charts
3. Polish UI/UX with animations and responsive design
4. Deploy to Vercel
```

## Key Copilot MCP Commands

### Supabase MCP Commands:
- `@supabase create table [description]` - Creates database tables
- `@supabase generate types` - Generates TypeScript types
- `@supabase create rls policy` - Sets up Row Level Security
- `@supabase create migration` - Creates database migrations

### shadcn/ui MCP Commands:
- `@shadcn install [component]` - Installs specific components
- `@shadcn create form` - Generates form with validation
- `@shadcn create dashboard` - Builds dashboard layout
- `@shadcn add theme` - Sets up dark mode support

## Gamification Logic (Auto-implemented by Copilot)

**XP Calculation**:
```typescript
const calculateXP = (difficulty: number, completed_on_time: boolean) => {
  let baseXP = difficulty * 10;
  if (completed_on_time) baseXP *= 1.2; // 20% bonus
  return Math.floor(baseXP);
};
```

**Level Progression**:
```typescript
const getLevel = (totalXP: number) => Math.floor(totalXP / 100) + 1;
const getXPToNextLevel = (totalXP: number) => 100 - (totalXP % 100);
```

**Achievement Triggers**:
- Complete 7 days streak → "Week Warrior" badge
- Complete 50 todos → "Task Master" badge  
- Reach level 10 → "Rising Star" badge
- Complete all daily todos → "Perfect Day" badge

## Deployment (15 minutes)
**Copilot Prompt**:
```
Set up Vercel deployment with environment variables for Supabase. Configure automatic deployments from GitHub. Add domain and SSL certificate.
```

This structure leverages MCP servers to automatically handle database operations, component installation, and complex logic implementation. By using established UI frameworks instead of custom components, you can build a complete MVP overnight while maintaining professional quality and user experience.