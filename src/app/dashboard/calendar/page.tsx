'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Eye, BarChart3 } from 'lucide-react';
import { addDays, format, isToday, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { fetchTodos } from '@/lib/supabase/todos';
import { Todo } from '@/types/todo';

interface TodosByDate {
  [key: string]: Todo[];
}

export default function CalendarPage() {
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
      setLoading(true);
      const todosData = await fetchTodos(user!.id);
      setTodos(todosData);
      
      // Group todos by date
      const grouped: TodosByDate = {};
      todosData.forEach((todo) => {
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

  const getDateModifiers = (date: Date) => {
    const todosForDate = getTodosForDate(date);
    if (todosForDate.length === 0) return undefined;
    
    const completed = todosForDate.filter(todo => todo.completed).length;
    const total = todosForDate.length;
    
    if (completed === total) return 'completed';
    if (completed > 0) return 'partial';
    return 'pending';
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              View and manage your todos by date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                completed: (date) => getDateModifiers(date) === 'completed',
                partial: (date) => getDateModifiers(date) === 'partial',
                pending: (date) => getDateModifiers(date) === 'pending',
              }}
              modifiersStyles={{
                completed: { backgroundColor: 'rgb(34 197 94)', color: 'white' },
                partial: { backgroundColor: 'rgb(234 179 8)', color: 'white' },
                pending: { backgroundColor: 'rgb(239 68 68)', color: 'white' },
              }}
              onDayClick={(day) => setSelectedDate(day)}
            />
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {format(selectedDate, 'MMMM d, yyyy')}
                </CardTitle>
                <CardDescription>
                  {isToday(selectedDate) ? "Today's todos" : "Todos for this date"}
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Todo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {getTodosForDate(selectedDate).map((todo) => (
                  <div
                    key={todo.id}
                    className={`p-3 border rounded-lg ${
                      todo.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                        {todo.title}
                      </h4>
                      <Badge variant={todo.completed ? 'secondary' : 'default'}>
                        {todo.xp_reward} XP
                      </Badge>
                    </div>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {todo.category}
                      </Badge>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => {
                          const difficultyValue = todo.difficulty === 'easy' ? 1 : 
                                                  todo.difficulty === 'medium' ? 2 : 
                                                  todo.difficulty === 'hard' ? 3 : 4;
                          return (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < difficultyValue ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ⭐
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {getTodosForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No todos for this date</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderYearView = () => {
    const currentYear = selectedDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(currentYear, i, 1));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map((month) => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
          
          const monthTodos = daysInMonth.reduce((count, day) => {
            return count + getTodosForDate(day).length;
          }, 0);

          const completedTodos = daysInMonth.reduce((count, day) => {
            return count + getTodosForDate(day).filter(todo => todo.completed).length;
          }, 0);

          const completionRate = monthTodos > 0 ? (completedTodos / monthTodos) * 100 : 0;

          return (
            <Card 
              key={month.getMonth()} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setSelectedDate(month);
                setView('month');
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{format(month, 'MMMM')}</CardTitle>
                <CardDescription className="text-sm">
                  {monthTodos} todos • {completionRate.toFixed(0)}% complete
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {daysInMonth.slice(0, 21).map((day, i) => {
                      const todosCount = getTodosForDate(day).length;
                      const modifier = getDateModifiers(day);
                      
                      return (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-sm ${
                            modifier === 'completed' ? 'bg-green-500' :
                            modifier === 'partial' ? 'bg-yellow-500' :
                            modifier === 'pending' ? 'bg-red-500' :
                            'bg-gray-200'
                          }`}
                          title={`${format(day, 'MMM d')}: ${todosCount} todos`}
                        />
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-gray-600">Visualize your productivity and plan your tasks</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Month
          </Button>
          <Button
            variant={view === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('year')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Year
          </Button>
        </div>
      </div>

      <Tabs value={view} onValueChange={(value) => setView(value as 'month' | 'year')}>
        <TabsList className="hidden">
          <TabsTrigger value="month">Month View</TabsTrigger>
          <TabsTrigger value="year">Year View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="month" className="space-y-6">
          {renderMonthView()}
        </TabsContent>
        
        <TabsContent value="year" className="space-y-6">
          {renderYearView()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
