'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, BarChart3, PieChart, Download, Filter } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { Todo, TodoCategory } from '@/types/todo';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isWithinInterval, getDay } from 'date-fns';

interface ProductivityData {
  date: string;
  completed: number;
  total: number;
  xp_earned: number;
  completion_rate: number;
}

interface CategoryData {
  category: string;
  count: number;
  xp: number;
  color: string;
  completed_count: number;
  completion_rate: number;
}

interface HeatmapData {
  date: string;
  value: number;
}

interface DayOfWeekData {
  day: string;
  dayIndex: number;
  completed: number;
  total: number;
  completion_rate: number;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_active_days: number;
}

const CATEGORY_COLORS = {
  work: '#3b82f6',
  personal: '#10b981',
  health: '#ef4444',
  learning: '#8b5cf6',
  finance: '#f59e0b',
} as const;

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [productivityData, setProductivityData] = useState<ProductivityData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [dayOfWeekData, setDayOfWeekData] = useState<DayOfWeekData[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({ current_streak: 0, longest_streak: 0, total_active_days: 0 });
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadAnalyticsData();
    }
  }, [user?.id, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        console.error('User not authenticated');
        return;
      }
      
      // Calculate date range
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const startDate = subDays(new Date(), days);
      
      // Fetch all todos for the user within the time range
      const { data: todosData, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching todos:', error);
        return;
      }

      const allTodos = todosData || [];
      setTodos(allTodos);

      // Generate date range for analysis
      const dateRange = eachDayOfInterval({ start: startDate, end: new Date() });

      // Calculate productivity data per day
      const productivity = dateRange.map((date) => {
        const dayStart = format(date, 'yyyy-MM-dd');
        const dayEnd = format(date, 'yyyy-MM-dd');
        
        const dayTodos = allTodos.filter(todo => {
          const todoDate = format(parseISO(todo.created_at), 'yyyy-MM-dd');
          return todoDate === dayStart;
        });

        const completedTodos = dayTodos.filter(todo => todo.completed);
        const totalTodos = dayTodos.length;
        const xpEarned = completedTodos.reduce((sum, todo) => sum + todo.xp_reward, 0);
        
        return {
          date: dayStart,
          completed: completedTodos.length,
          total: totalTodos,
          xp_earned: xpEarned,
          completion_rate: totalTodos > 0 ? Math.round((completedTodos.length / totalTodos) * 100) : 0,
        };
      });

      // Calculate category data
      const categoryStats = Object.keys(CATEGORY_COLORS).map(category => {
        const categoryTodos = allTodos.filter(todo => todo.category === category);
        const completedCategoryTodos = categoryTodos.filter(todo => todo.completed);
        const totalXP = completedCategoryTodos.reduce((sum, todo) => sum + todo.xp_reward, 0);
        
        return {
          category: category,
          count: categoryTodos.length,
          completed_count: completedCategoryTodos.length,
          completion_rate: categoryTodos.length > 0 ? Math.round((completedCategoryTodos.length / categoryTodos.length) * 100) : 0,
          xp: totalXP,
          color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
        };
      }).filter(cat => cat.count > 0); // Only show categories with todos

      // Calculate heatmap data (last 90 days for habit tracking)
      const heatmapRange = eachDayOfInterval({ 
        start: subDays(new Date(), 90), 
        end: new Date() 
      });
      const heatmap = heatmapRange.map(date => {
        const dayStart = format(date, 'yyyy-MM-dd');
        const dayTodos = allTodos.filter(todo => {
          const todoDate = format(parseISO(todo.created_at), 'yyyy-MM-dd');
          return todoDate === dayStart && todo.completed;
        });
        
        return {
          date: dayStart,
          value: dayTodos.length,
        };
      });

      // Calculate day of week performance
      const dayOfWeekStats = DAY_NAMES.map((dayName, index) => {
        const dayTodos = allTodos.filter(todo => {
          const todoDate = parseISO(todo.created_at);
          return getDay(todoDate) === index;
        });
        const completedDayTodos = dayTodos.filter(todo => todo.completed);
        
        return {
          day: dayName,
          dayIndex: index,
          completed: completedDayTodos.length,
          total: dayTodos.length,
          completion_rate: dayTodos.length > 0 ? Math.round((completedDayTodos.length / dayTodos.length) * 100) : 0,
        };
      });

      // Calculate streak data
      const streakStats = calculateStreakData(allTodos);

      setProductivityData(productivity);
      setCategoryData(categoryStats);
      setHeatmapData(heatmap);
      setDayOfWeekData(dayOfWeekStats);
      setStreakData(streakStats);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreakData = (todos: Todo[]): StreakData => {
    // Group todos by date and check if any were completed each day
    const completionByDate = new Map<string, boolean>();
    
    todos.forEach(todo => {
      if (todo.completed && todo.completed_at) {
        const date = format(parseISO(todo.completed_at), 'yyyy-MM-dd');
        completionByDate.set(date, true);
      }
    });

    // Calculate current streak (from today backwards)
    let currentStreak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (completionByDate.has(dateStr)) {
        currentStreak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }

    // Calculate longest streak
    const sortedDates = Array.from(completionByDate.keys()).sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of sortedDates) {
      const currentDate = parseISO(dateStr);
      if (prevDate && Math.abs(currentDate.getTime() - prevDate.getTime()) <= 24 * 60 * 60 * 1000) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
      prevDate = currentDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_active_days: completionByDate.size,
    };
  };

  const getTotalStats = () => {
    const totalCompleted = productivityData.reduce((sum, day) => sum + day.completed, 0);
    const totalTodos = productivityData.reduce((sum, day) => sum + day.total, 0);
    const totalXP = productivityData.reduce((sum, day) => sum + day.xp_earned, 0);
    const avgCompletion = totalTodos > 0 ? Math.round((totalCompleted / totalTodos) * 100) : 0;

    return { totalCompleted, totalTodos, totalXP, avgCompletion };
  };

  const getHeatmapIntensity = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    if (value <= 1) return 'bg-green-200';
    if (value <= 2) return 'bg-green-300';
    if (value <= 3) return 'bg-green-400';
    if (value <= 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  const generateInsights = () => {
    if (categoryData.length === 0) return [];

    const insights = [];
    
    // Find best performing category
    const bestCategory = categoryData.reduce((best, current) => 
      current.completion_rate > best.completion_rate ? current : best
    );
    
    if (bestCategory.completion_rate > 80) {
      insights.push({
        title: `🎯 ${bestCategory.category.charAt(0).toUpperCase() + bestCategory.category.slice(1)} Champion`,
        description: `You have a ${bestCategory.completion_rate}% completion rate in ${bestCategory.category}. Consider adding more goals in this area!`,
        action: `Create ${bestCategory.category.charAt(0).toUpperCase() + bestCategory.category.slice(1)} Goal`
      });
    }

    // Check for consistency
    if (streakData.current_streak >= 3) {
      insights.push({
        title: '🔥 Consistency Master',
        description: `You're on a ${streakData.current_streak}-day streak! Keep the momentum going.`,
        action: 'Add Daily Challenge'
      });
    }

    // Check for low activity categories
    const lowActivityCategory = categoryData.find(cat => cat.completion_rate < 50 && cat.count > 2);
    if (lowActivityCategory) {
      insights.push({
        title: '💪 Room for Growth',
        description: `Your ${lowActivityCategory.category} completion rate is ${lowActivityCategory.completion_rate}%. Consider breaking tasks into smaller steps.`,
        action: 'Simplify Tasks'
      });
    }

    return insights.slice(0, 3); // Show max 3 insights
  };

  const stats = getTotalStats();
  const insights = generateInsights();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600">
            Insights into your productivity patterns and goal achievement
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d' | '1y') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="text-2xl mr-3">✅</div>
            <div>
              <div className="text-2xl font-bold">{stats.totalCompleted}</div>
              <div className="text-sm text-gray-500">Completed Tasks</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="text-2xl mr-3">📈</div>
            <div>
              <div className="text-2xl font-bold">{stats.avgCompletion}%</div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="text-2xl mr-3">⭐</div>
            <div>
              <div className="text-2xl font-bold">{stats.totalXP}</div>
              <div className="text-sm text-gray-500">XP Earned</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="text-2xl mr-3">🎯</div>
            <div>
              <div className="text-2xl font-bold">
                {Math.round(stats.totalCompleted / productivityData.length)}
              </div>
              <div className="text-sm text-gray-500">Daily Average</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate Trend</CardTitle>
                <CardDescription>
                  Your daily task completion percentage over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                      formatter={(value) => [`${value}%`, 'Completion Rate']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completion_rate" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>XP Earned Over Time</CardTitle>
                <CardDescription>
                  Your daily experience points accumulation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                      formatter={(value) => [`${value} XP`, 'XP Earned']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="xp_earned" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily Task Volume</CardTitle>
              <CardDescription>
                Completed vs. total tasks per day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                  />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                  <Bar dataKey="total" stackId="b" fill="#e5e7eb" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tasks by Category</CardTitle>
                <CardDescription>
                  Distribution of your tasks across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>XP by Category</CardTitle>
                <CardDescription>
                  Experience points earned from each category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={80} />
                    <Tooltip formatter={(value) => [`${value} XP`, 'XP Earned']} />
                    <Bar dataKey="xp" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>
                Detailed breakdown of your performance in each category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tasks found for the selected time period.</p>
                    <p className="text-sm mt-2">Create some tasks to see your category performance!</p>
                  </div>
                ) : (
                  categoryData.map((category) => (
                    <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <h4 className="font-medium capitalize">{category.category}</h4>
                          <p className="text-sm text-gray-500">
                            {category.completed_count}/{category.count} tasks completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{category.xp} XP</div>
                        <div className="text-sm text-gray-500">
                          {category.completion_rate}% completion rate
                        </div>
                        <div className="text-xs text-gray-400">
                          {category.count > 0 ? Math.round(category.xp / category.completed_count || 0) : 0} avg XP/completed
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="habits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Heatmap</CardTitle>
              <CardDescription>
                Your daily task completion activity over the last 90 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 max-w-lg">
                {heatmapData.map((day) => (
                  <div
                    key={day.date}
                    className={`w-3 h-3 rounded-sm ${getHeatmapIntensity(day.value)}`}
                    title={`${format(new Date(day.date), 'MMM d')}: ${day.value} completed tasks`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <span>Less</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gray-100 rounded-sm" />
                  <div className="w-3 h-3 bg-green-200 rounded-sm" />
                  <div className="w-3 h-3 bg-green-300 rounded-sm" />
                  <div className="w-3 h-3 bg-green-400 rounded-sm" />
                  <div className="w-3 h-3 bg-green-500 rounded-sm" />
                  <div className="w-3 h-3 bg-green-600 rounded-sm" />
                </div>
                <span>More</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Best Performance Days</CardTitle>
                <CardDescription>
                  Days of the week when you&apos;re most productive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dayOfWeekData.map((dayData) => (
                    <div key={dayData.day} className="flex items-center justify-between">
                      <span className="font-medium">{dayData.day}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${dayData.completion_rate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-12">{dayData.completion_rate}%</span>
                      </div>
                      <div className="text-xs text-gray-400 ml-2">
                        {dayData.completed}/{dayData.total}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Streak Analysis</CardTitle>
                <CardDescription>
                  Your consistency patterns and streak achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Current streak</span>
                    <Badge className={streakData.current_streak > 0 ? "bg-orange-500" : "bg-gray-400"}>
                      {streakData.current_streak} days
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Longest streak</span>
                    <Badge variant="outline">{streakData.longest_streak} days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total active days</span>
                    <Badge variant="outline">{streakData.total_active_days} days</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Consistency rate</span>
                    <Badge variant="outline">
                      {Math.round((streakData.total_active_days / Math.max(todos.length > 0 ? 
                        Math.ceil((new Date().getTime() - new Date(todos[0]?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24)) : 1, 1)) * 100)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Productivity Insights</CardTitle>
                <CardDescription>
                  AI-powered insights about your work patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dayOfWeekData.length > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">🎯 Peak Performance</h4>
                      <p className="text-sm text-blue-700">
                        {(() => {
                          const bestDay = dayOfWeekData.reduce((best, current) => 
                            current.completion_rate > best.completion_rate ? current : best
                          );
                          return `You're most productive on ${bestDay.day}s with a ${bestDay.completion_rate}% completion rate. Consider scheduling important tasks on this day.`;
                        })()}
                      </p>
                    </div>
                  )}
                  
                  {streakData.current_streak > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">🔥 Streak Power</h4>
                      <p className="text-sm text-green-700">
                        Your current {streakData.current_streak}-day streak is {streakData.current_streak >= streakData.longest_streak ? 'your best yet' : 'building up'}! 
                        {streakData.current_streak >= 7 ? ' Keep it up to maintain your Week Warrior status.' : ' Reach 7 days to unlock Week Warrior achievement.'}
                      </p>
                    </div>
                  )}
                  
                  {dayOfWeekData.length > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">⚡ Improvement Opportunity</h4>
                      <p className="text-sm text-yellow-700">
                        {(() => {
                          const worstDay = dayOfWeekData.reduce((worst, current) => 
                            current.completion_rate < worst.completion_rate ? current : worst
                          );
                          return worstDay.completion_rate < 50 
                            ? `${worstDay.day} productivity could be improved (${worstDay.completion_rate}%). Try setting smaller, achievable goals for this day.`
                            : `Great consistency across all days! Your lowest day (${worstDay.day}) still maintains ${worstDay.completion_rate}% completion.`;
                        })()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goal Recommendations</CardTitle>
                <CardDescription>
                  Personalized suggestions based on your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                      <Button size="sm" variant="outline">{insight.action}</Button>
                    </div>
                  ))}
                  
                  {insights.length === 0 && (
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">📊 Getting Started</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Complete more tasks to unlock personalized insights and recommendations.
                      </p>
                      <Button size="sm" variant="outline">Create First Goal</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
