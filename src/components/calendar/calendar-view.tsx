'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveCard } from '@/components/ui/interactive-card';
import { InteractiveButton } from '@/components/ui/interactive-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, BarChart3 } from 'lucide-react';
import { addDays, format, isToday, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { fetchTodos } from '@/lib/supabase/todos';
import { Todo } from '@/types/todo';

interface TodosByDate {
  [key: string]: Todo[];
}

export default function CalendarView() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosByDate, setTodosByDate] = useState<TodosByDate>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'year'>('month');

  useEffect(() => {
    if (user?.id) {
      loadTodos();
    }
  }, [user?.id]);

  const loadTodos = async () => {
    try {
      if (!user?.id) return;
      const fetchedTodos = await fetchTodos(user.id);
      setTodos(fetchedTodos);
      
      // Group todos by date
      const grouped: TodosByDate = {};
      fetchedTodos.forEach(todo => {
        if (todo.due_date) {
          const dateKey = format(new Date(todo.due_date), 'yyyy-MM-dd');
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          grouped[dateKey].push(todo);
        }
      });
      setTodosByDate(grouped);
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodosForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return todosByDate[dateKey] || [];
  };

  const getUpcomingTodos = () => {
    const upcoming: { date: Date; todos: Todo[] }[] = [];
    const today = new Date();
    
    for (let i = 0; i <= 30; i++) {
      const checkDate = addDays(today, i);
      const dateTodos = getTodosForDate(checkDate);
      if (dateTodos.length > 0) {
        upcoming.push({ date: checkDate, todos: dateTodos });
      }
    }
    
    return upcoming.slice(0, 5); // Show next 5 days with todos
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'epic': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCompletionStats = () => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const overdue = todos.filter(t => 
      !t.completed && 
      t.due_date && 
      new Date(t.due_date) < new Date()
    ).length;
    
    return { total, completed, overdue, pending: total - completed };
  };

  const stats = getCompletionStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <InteractiveCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </InteractiveCard>

        <InteractiveCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </InteractiveCard>

        <InteractiveCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Tasks remaining</p>
          </CardContent>
        </InteractiveCard>

        <InteractiveCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <div className="h-4 w-4 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </InteractiveCard>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar" className="hover:bg-muted/80 transition-colors cursor-pointer">Calendar View</TabsTrigger>
          <TabsTrigger value="upcoming" className="hover:bg-muted/80 transition-colors cursor-pointer">Upcoming Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Calendar */}
            <InteractiveCard className="md:col-span-2">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>View your tasks by date</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    if (newDate) setSelectedDate(newDate);
                  }}
                  className="rounded-md border"
                  modifiers={{
                    hasTask: (date) => {
                      const dateKey = format(date, 'yyyy-MM-dd');
                      return todosByDate[dateKey]?.length > 0;
                    },
                    today: isToday
                  }}
                  modifiersStyles={{
                    hasTask: { backgroundColor: '#fef3c7', fontWeight: 'bold' },
                    today: { backgroundColor: '#dbeafe', color: '#1e40af' }
                  }}
                />
              </CardContent>
            </InteractiveCard>

            {/* Selected Date Tasks */}
            <InteractiveCard>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
                  </span>
                  <InteractiveButton size="sm" variant="outline" hoverScale={true}>
                    <Plus className="h-4 w-4" />
                  </InteractiveButton>
                </CardTitle>
                <CardDescription>
                  {getTodosForDate(selectedDate).length} task(s) scheduled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {getTodosForDate(selectedDate).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks scheduled for this date
                  </p>
                ) : (
                  getTodosForDate(selectedDate).map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-3 rounded-lg border transition-all hover:shadow-md hover:scale-[1.02] cursor-default ${
                        todo.completed 
                          ? 'bg-green-50 border-green-200 opacity-75' 
                          : 'bg-background hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {todo.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getDifficultyColor(todo.difficulty)} hover:scale-105 transition-transform cursor-default`}
                        >
                          {todo.difficulty}
                        </Badge>
                      </div>
                      {todo.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {todo.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>XP: {todo.xp_reward} | Coins: {todo.coin_reward}</span>
                        {todo.completed && <span className="text-green-600">✓ Completed</span>}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </InteractiveCard>
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <InteractiveCard>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Your next tasks in chronological order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getUpcomingTodos().length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming tasks scheduled</p>
                  <InteractiveButton className="mt-4" variant="outline" hoverScale={true} hoverGlow={true}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add a task
                  </InteractiveButton>
                </div>
              ) : (
                getUpcomingTodos().map(({ date, todos }) => (
                  <div key={date.toISOString()} className="space-y-2">
                    <h3 className="font-semibold text-lg flex items-center">
                      {isToday(date) ? (
                        <span className="text-blue-600">Today</span>
                      ) : (
                        format(date, 'EEEE, MMM d')
                      )}
                      <Badge variant="secondary" className="ml-2 hover:scale-105 transition-transform cursor-default">
                        {todos.length} task{todos.length !== 1 ? 's' : ''}
                      </Badge>
                    </h3>
                    <div className="space-y-2 pl-4">
                      {todos.map((todo) => (
                        <div
                          key={todo.id}
                          className={`p-3 rounded-lg border transition-all hover:shadow-md hover:scale-[1.01] cursor-default ${
                            todo.completed 
                              ? 'bg-green-50 border-green-200 opacity-75' 
                              : 'bg-background hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {todo.title}
                              </h4>
                              {todo.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {todo.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getDifficultyColor(todo.difficulty)} hover:scale-105 transition-transform cursor-default`}
                              >
                                {todo.difficulty}
                              </Badge>
                              {todo.completed && (
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600 transition-colors cursor-default">
                                  ✓
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </InteractiveCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
