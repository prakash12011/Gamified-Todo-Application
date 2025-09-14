# Copilot MCP Prompts for Overnight Development

## Phase 1: Project Setup & Foundation (Hour 1)

### Initial Setup
```
@supabase Create a new Supabase project with the following tables:
- profiles (id, username, level, total_xp, coins, streak_days, avatar_url, created_at)  
- todos (id, user_id, title, description, difficulty, xp_reward, coin_reward, category, due_date, completed, completed_at, created_at)
- achievements (id, user_id, badge_name, badge_description, earned_at, xp_earned)
- vision_plans (id, user_id, title, description, timeline_years, target_date, category, progress_percentage, milestones, created_at)
- badge_definitions (id, name, description, icon, requirement_type, requirement_value, xp_reward)

Set up Row Level Security policies for all tables to restrict access to authenticated users' own data only.
```

```
@shadcn Initialize shadcn/ui in this NextJS 15 project and install these components:
button, card, input, form, dialog, dropdown-menu, progress, badge, calendar, checkbox, select, tabs, avatar, alert, separator, sheet, popover, table

Configure with default theme and add dark mode support.
```

### Environment Setup
```
Create a complete NextJS 15 project structure with:
- TypeScript configuration
- Tailwind CSS with custom gamification colors
- Supabase client configuration (browser and server)
- Authentication middleware for protected routes
- Global styles with gamification design tokens
- Error boundary components
- Loading state components
```

## Phase 2: Authentication System (Hour 2)

### Auth Components & Pages
```
@supabase @shadcn Create a complete authentication system with:

1. AuthProvider component with React context for user state management
2. Login page with email/password and social login (Google, GitHub)  
3. Signup page with username, email, password
4. Password reset functionality
5. Profile creation in Supabase profiles table on first login
6. Automatic redirect to dashboard after authentication
7. Logout functionality with session cleanup
8. Protected route middleware
9. Loading states and error handling for all auth operations
10. Form validation using react-hook-form with zod schemas

Use shadcn/ui forms, inputs, buttons, and cards for consistent styling.
```

### User Profile Setup
```
@supabase Create automatic profile initialization that:
- Creates profile record when user signs up
- Sets default values: level=1, total_xp=0, coins=100, streak_days=0
- Handles username uniqueness validation
- Updates last_login timestamp
- Includes avatar upload functionality with Supabase storage
```

## Phase 3: Dashboard & Core UI (Hour 3)

### Dashboard Layout
```
@shadcn Create a responsive dashboard layout with:
- Sidebar navigation with icons for todos, calendar, vision, profile, analytics
- Top navigation bar with user avatar, level display, coin balance
- Mobile-friendly hamburger menu using Sheet component
- Breadcrumb navigation
- Notification center with achievement alerts
- Quick action floating button for adding todos
- Dark mode toggle
- Real-time user stats display (XP, level, coins, streak)
```

### Dashboard Home Page
```
@supabase @shadcn Create dashboard home page with:

1. Welcome message with user's name and current level
2. Today's Stats Cards:
   - Todos completed today / total todos today
   - Current XP / XP needed for next level (with progress bar)
   - Current streak with fire emoji animation  
   - Available coins balance
3. Quick Actions section:
   - Add new todo button
   - View calendar button
   - Check achievements button
4. Recent Activity feed showing:
   - Recently completed todos with XP gained
   - New achievements earned
   - Streak milestones reached
5. Weekly Progress Chart using recharts showing daily completion rates
6. Upcoming due todos (next 3 days)

All data should be fetched from Supabase with real-time subscriptions for live updates.
Use shadcn/ui cards, progress bars, badges, and buttons for styling.
```

## Phase 4: Todo System with Gamification (Hour 4)

### Todo CRUD Operations
```
@supabase @shadcn Create comprehensive todo management system:

1. Todo List Component:
   - Data table with sorting, filtering, searching
   - Columns: title, category, difficulty (stars), due date, XP reward, actions
   - Bulk selection and actions (complete multiple, delete multiple)
   - Real-time updates when todos change
   - Drag and drop reordering

2. Add/Edit Todo Modal:
   - Title and description fields
   - Category selector (work, personal, health, learning, finance)
   - Difficulty level (1-5 stars) with XP preview calculation
   - Due date picker with calendar
   - Recurring todo option (daily, weekly, monthly)
   - Custom reward description field

3. Todo Completion:
   - Animated completion with confetti effect
   - XP gain animation (+15 XP)
   - Coin reward animation (+5 coins)
   - Streak increment if daily goal met
   - Achievement check and notification
   - Update user's total_xp and coins in profiles table

4. Gamification Logic:
   - XP calculation: difficulty * 10 (with 20% bonus for on-time completion)
   - Coin calculation: difficulty * 5  
   - Daily streak tracking
   - Achievement triggers (7-day streak, 50 todos completed, etc.)

Use shadcn/ui components throughout with smooth animations using framer-motion.
```

### Achievement System
```
@supabase Create automated achievement system:

1. Badge Definitions (pre-populate these):
   - "First Steps" (1st todo completed) - 10 XP
   - "Getting Started" (5 todos completed) - 25 XP  
   - "Task Master" (50 todos completed) - 100 XP
   - "Week Warrior" (7-day streak) - 150 XP
   - "Month Champion" (30-day streak) - 500 XP
   - "Level Up" (reach level 5) - 200 XP
   - "Perfectionist" (complete all daily todos) - 100 XP

2. Achievement Checking Function:
   - Automatically check for achievement unlocks on todo completion
   - Add achievement to user's achievements table
   - Award XP bonus for achievement
   - Trigger celebration notification
   - Update achievement progress tracking

3. Achievement Display:
   - Badge gallery showing earned vs available badges
   - Progress bars for in-progress achievements
   - Achievement notification popups with animations
   - Achievement history with timestamps
```

## Phase 5: Calendar & Vision Board (Hour 5)

### Calendar System
```
@shadcn @supabase Create multi-view calendar system:

1. Monthly Calendar View:
   - shadcn/ui calendar as base component
   - Color-coded dots on dates with todos (green=completed, red=overdue, blue=upcoming)
   - Click date to see todo list for that day
   - Add todo directly from calendar
   - Drag and drop todos between dates

2. Yearly Eagle View:
   - 12-month grid layout showing each month
   - Heat map overlay showing productivity levels
   - Vision plan milestones marked on timeline
   - Goal progress indicators by month
   - Clickable months to zoom into monthly view

3. Integration with Vision Plans:
   - Show long-term goal milestones on appropriate dates
   - Break down yearly goals into monthly/weekly tasks
   - Progress tracking towards annual targets
   - Visual timeline for 1/3/5/10 year plans

Use responsive design with Tailwind CSS and smooth transitions.
```

### Vision Board System  
```
@supabase @shadcn Create vision board interface:

1. Goal Cards Layout:
   - Masonry grid layout for goal cards
   - Drag and drop reordering
   - Image upload for goal visualization (use Supabase storage)
   - Category tags and timeline badges
   - Progress percentage with circular progress bar

2. Timeline Management:
   - Tab system for 1-year, 3-year, 5-year, 10-year views
   - Goal creation form with target dates
   - Milestone breakdown (yearly goals → quarterly → monthly → weekly → daily)
   - Automatic task creation from goal milestones
   - Progress calculation based on completed milestones

3. Goal Analytics:
   - Progress charts showing completion rates over time
   - Category breakdown of goals
   - Success rate analysis
   - Time to completion tracking
   - Vision board export as PDF

4. Integration with Todo System:
   - Link daily todos to long-term goals
   - XP bonus for goal-aligned task completion
   - Achievement triggers for goal milestones
   - Visual connection between daily actions and long-term vision
```

## Phase 6: Analytics & Gamification Features (Hour 6)

### Analytics Dashboard
```
@supabase Create comprehensive analytics dashboard using recharts:

1. Productivity Charts:
   - Weekly completion trend (line chart)
   - Category breakdown (pie chart)  
   - Difficulty distribution (bar chart)
   - XP earned over time (area chart)
   - Daily/weekly/monthly view toggles

2. Habit Analysis:
   - Streak tracking with calendar heat map
   - Most productive days of week
   - Peak productivity hours
   - Completion rate trends
   - Goal achievement velocity

3. Gamification Stats:
   - Level progression history
   - XP sources breakdown
   - Achievement unlock timeline
   - Coins earned vs spent
   - Leaderboard (if social features added)

4. Export Functionality:
   - PDF reports generation
   - CSV data export
   - Share achievements on social media
   - Progress screenshots for motivation

All charts responsive with dark mode support and smooth animations.
```

### Advanced Gamification
```
@supabase @shadcn Enhance gamification system with:

1. Reward Shop:
   - Spend coins on custom rewards
   - User-defined reward catalog
   - Purchase history tracking
   - Coin balance management
   - Reward redemption notifications

2. Social Features (optional):
   - Friend system with challenges
   - Public leaderboards
   - Achievement sharing
   - Group goals and competitions
   - Motivational messaging

3. Advanced Progression:
   - Prestige system for high-level users
   - Special badges for exceptional achievements
   - Seasonal challenges and events
   - Skill trees for different categories
   - Multiplier bonuses for consistent performance

4. Habit Formation:
   - Habit strength indicators
   - Scientific habit tracking metrics
   - Personalized motivation tips
   - Habit stacking suggestions
   - Behavioral pattern analysis
```

## Phase 7: Polish & Optimization (Hour 7)

### Performance & UX
```
Optimize the application for production:

1. Performance:
   - Implement React Query for data fetching and caching
   - Add skeleton loading states for all components
   - Optimize Supabase queries with proper indexing
   - Implement virtual scrolling for large todo lists
   - Add error boundaries for graceful error handling
   - Compress images and implement lazy loading

2. Animations & Micro-interactions:
   - Smooth page transitions with framer-motion
   - Hover effects on interactive elements
   - Loading spinners and progress indicators
   - Success animations for completed actions
   - Satisfying todo completion animations
   - Achievement unlock celebrations with confetti

3. Accessibility:
   - Keyboard navigation for all features
   - Screen reader compatible components
   - High contrast mode support
   - Focus management and ARIA labels
   - Alt text for all images
   - Semantic HTML structure

4. Mobile Optimization:
   - Touch-friendly button sizes
   - Swipe gestures for todo completion
   - Mobile-first responsive design
   - PWA capabilities for offline usage
   - Push notifications for reminders
```

### Testing & Deployment
```
@supabase Set up production environment:

1. Environment Configuration:
   - Production Supabase project setup
   - Environment variable configuration
   - Database migration scripts
   - Row Level Security policy verification
   - API rate limiting configuration

2. Deployment Setup:
   - Vercel deployment configuration
   - GitHub Actions for CI/CD
   - Automated testing pipeline
   - Error monitoring with Sentry
   - Performance monitoring
   - Backup strategies for user data

3. Final Testing:
   - User authentication flow testing
   - Todo CRUD operations testing
   - Gamification system verification
   - Responsive design testing
   - Cross-browser compatibility
   - Load testing with sample data
```

## Phase 8: MVP Launch (Hour 8)

### Final Launch Preparation
```
Prepare for MVP launch:

1. User Onboarding:
   - Welcome tour for new users
   - Sample todos and goals for demo
   - Tutorial tooltips and guides  
   - Getting started checklist
   - Help documentation
   - Contact support system

2. Analytics & Monitoring:
   - User behavior tracking (privacy-compliant)
   - Performance metrics monitoring
   - Error logging and alerting
   - Feature usage analytics
   - Conversion funnel analysis
   - User feedback collection

3. Launch Checklist:
   - Domain configuration and SSL
   - SEO optimization (meta tags, sitemap)
   - Social media preview cards
   - Landing page optimization
   - User privacy policy and terms
   - GDPR compliance measures
   - Backup and recovery procedures
   - Customer support channels
```

## Emergency Debugging Prompts

If something breaks during development:

```
@supabase Debug this Supabase connection issue: [paste error message]
Provide step-by-step troubleshooting and fix the configuration.
```

```
@shadcn Fix this component styling issue: [paste component code]
Ensure proper Tailwind classes and responsive design.
```

```
Optimize this slow database query and suggest better indexing:
[paste query]
```

```
Fix this TypeScript error and ensure type safety:
[paste error]
```

These prompts are designed to let Copilot with MCP handle 95% of the development work, allowing you to focus on testing, refinement, and launch preparation. Each prompt is specific enough to generate production-ready code while comprehensive enough to build a complete feature.