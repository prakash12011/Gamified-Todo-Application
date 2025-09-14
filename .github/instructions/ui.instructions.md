---
applyTo: '**'
---

# UI Framework Recommendations for Gamified Todo App

## Primary Framework: shadcn/ui + Tailwind CSS

**Why shadcn/ui is Perfect for Your Project**:
- ✅ **MCP Server Available**: Direct integration with VS Code Copilot
- ✅ **NextJS Optimized**: Built specifically for React/NextJS projects
- ✅ **Highly Customizable**: Copy-paste components you can modify
- ✅ **Modern Design**: Clean, professional aesthetic perfect for productivity apps
- ✅ **TypeScript Native**: Full type safety out of the box
- ✅ **Accessibility Built-in**: WCAG compliant components

## Component Mapping for Each Page

### 1. Landing Page Components
**shadcn/ui Components to Use**:
- `Button` - CTA buttons, navigation
- `Card` - Feature highlights, testimonials  
- `Badge` - Feature tags, pricing tiers
- `Separator` - Section dividers

**Additional Styling**:
- Hero gradients with Tailwind CSS
- Animation with `framer-motion`

### 2. Authentication Pages
**shadcn/ui Components**:
- `Form` - Login/signup forms with validation
- `Input` - Email, password fields
- `Button` - Submit, social login buttons
- `Card` - Form container
- `Alert` - Error/success messages

### 3. Dashboard Home
**shadcn/ui Components**:
- `Card` - Stat cards, quick actions
- `Progress` - XP progress bars, level progression
- `Badge` - Level indicators, streak counters
- `Sheet` - Slide-out panels for quick todo creation
- `Avatar` - User profile display

**Preline UI Components to Integrate**:
- Dashboard stat blocks
- Activity timeline components
- Progress ring charts

### 4. Todo Management
**shadcn/ui Components**:
- `DataTable` - Todo list with sorting/filtering
- `Dialog` - Todo creation/editing modals
- `DropdownMenu` - Bulk actions, settings
- `Checkbox` - Todo completion status
- `Select` - Category, difficulty selection
- `Calendar` - Due date picker

**Gamification UI Elements**:
- `Progress` rings for difficulty levels
- `Badge` components for categories
- Custom star ratings for difficulty
- Animated counters for XP/coins

### 5. Calendar Views
**shadcn/ui Components**:
- `Calendar` - Base calendar functionality
- `Popover` - Todo preview on date hover
- `Tabs` - Switch between month/year views
- `Card` - Event cards, milestone cards

**Custom Extensions Needed**:
- Multi-month year view
- Heat map overlay for productivity
- Timeline components for long-term goals

### 6. Vision Board
**shadcn/ui Components**:
- `Card` - Goal cards with images
- `Tabs` - Timeline switching (1/3/5/10 years)
- `Progress` - Goal completion percentages  
- `Dialog` - Goal creation/editing
- `Input` - Goal titles, descriptions

**Additional Libraries**:
- `react-beautiful-dnd` for drag-and-drop
- `recharts` for progress visualization
- File upload components

### 7. Profile & Gamification
**shadcn/ui Components**:
- `Avatar` - Profile picture with level badge
- `Card` - Stats display, achievement showcase
- `Progress` - Level progression, streak tracking
- `Badge` - Achievement badges, level indicators
- `Separator` - Section dividers

**Gamification-Specific Elements**:
- Badge gallery grid
- Achievement unlock animations
- Level progression bars
- XP counter animations

### 8. Analytics Dashboard
**shadcn/ui Components**:
- `Card` - Chart containers
- `Tabs` - Time period selection
- `Select` - Data filtering options
- `Table` - Raw data tables

**Chart Library**: `recharts` for all data visualization
- Line charts for trend analysis
- Bar charts for category comparison
- Pie charts for time distribution
- Heat maps for habit tracking

## Gamification UI Patterns

### Progress Indicators
```jsx
// Level Progress Bar
<Progress 
  value={(currentXP % 100)} 
  className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"
/>

// Circular Progress for Goals
<div className="relative w-24 h-24">
  <Progress value={goalProgress} className="circular" />
  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
    {goalProgress}%
  </span>
</div>
```

### Achievement Badges
```jsx
// Unlocked Badge
<Badge variant="default" className="bg-gradient-to-r from-gold-400 to-yellow-500">
  🏆 Week Warrior
</Badge>

// Locked Badge  
<Badge variant="outline" className="opacity-50">
  🔒 Task Master
</Badge>
```

### XP Gain Animation
```jsx
// Animated XP Counter
<motion.div
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: 20, opacity: 0 }}
  className="text-green-500 font-bold text-lg"
>
  +{xpGained} XP
</motion.div>
```

## Color Scheme for Gamification

### XP & Level Colors
- **Level 1-10**: `blue-500` to `blue-700`
- **Level 11-25**: `purple-500` to `purple-700`  
- **Level 26-50**: `orange-500` to `red-500`
- **Level 51+**: `gradient-to-r from-pink-500 to-violet-500`

### Category Colors
- **Work**: `blue-500`
- **Personal**: `green-500`
- **Health**: `red-500`
- **Learning**: `purple-500`
- **Finance**: `yellow-500`

### Difficulty Colors
- **1 Star**: `gray-400`
- **2 Stars**: `green-500`
- **3 Stars**: `yellow-500`
- **4 Stars**: `orange-500`
- **5 Stars**: `red-500`

## Responsive Design Strategy

### Mobile-First Approach
```jsx
// Responsive Dashboard Cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card className="p-4">
    <CardContent>
      {/* Stat content */}
    </CardContent>
  </Card>
</div>

// Mobile Navigation
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline" size="icon" className="md:hidden">
      <Menu className="h-4 w-4" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left">
    {/* Navigation items */}
  </SheetContent>
</Sheet>
```

## Animation Guidelines

### Micro-Interactions
- **Todo Completion**: Scale + color change + confetti
- **XP Gain**: Slide up with bounce
- **Badge Unlock**: Pulse + scale with glow effect
- **Level Up**: Full-screen celebration modal

### Page Transitions
```jsx
// Smooth page transitions with framer-motion
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2 }}
>
  {children}
</motion.div>
```

## Development Speed Optimizations

### Pre-built Component Combinations
Create compound components for common patterns:

```jsx
// StatCard Component
const StatCard = ({ title, value, icon, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{trend}</p>
    </CardContent>
  </Card>
);

// TodoItem Component
const TodoItem = ({ todo, onComplete, onEdit, onDelete }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="flex items-center space-x-4 p-4">
      <Checkbox 
        checked={todo.completed}
        onCheckedChange={() => onComplete(todo.id)}
      />
      <div className="flex-1">
        <h4 className="font-medium">{todo.title}</h4>
        <div className="flex items-center space-x-2 mt-1">
          <Badge>{todo.category}</Badge>
          <span className="text-sm text-muted-foreground">
            {todo.xp_reward} XP
          </span>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(todo)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(todo.id)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </CardContent>
  </Card>
);
```

This framework selection and component strategy will allow Copilot MCP to rapidly generate high-quality, consistent UI components while maintaining the gamification elements that make your app engaging and motivating.