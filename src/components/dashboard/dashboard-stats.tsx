"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { InteractiveButton } from "@/components/ui/interactive-button";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { Plus, Target, Zap, Coins, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUserProfile } from "@/lib/supabase/profiles";
import { fetchTodos } from "@/lib/supabase/todos";
import { Profile } from "@/types/profile";
import { Todo } from "@/types/todo";

interface DashboardStatsProps {
  userId: string;
}

export default function DashboardStats({ userId }: DashboardStatsProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch user profile and todos in parallel
        const [profileData, todosData] = await Promise.all([
          fetchUserProfile(userId),
          fetchTodos(userId)
        ]);
        
        setProfile(profileData);
        setTodos(todosData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Calculate dynamic stats
  const today = new Date().toDateString();
  const todaysTodos = todos.filter(todo => 
    new Date(todo.created_at).toDateString() === today
  );
  const todaysCompleted = todaysTodos.filter(todo => todo.completed).length;
  const todaysTotal = todaysTodos.length;

  const currentXP = profile?.xp || 0;
  const level = profile?.level || 1;
  const xpToNextLevel = 100 - (currentXP % 100);
  const xpPercentage = (currentXP % 100);

  // Recent achievements (mock for now - will be replaced with real data)
  const recentAchievements = [
    { name: "Welcome!", icon: "🎉", earned: "Today" }
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Level Progress */}
        <InteractiveCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level Progress</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Level {level}</div>
            <Progress value={xpPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {currentXP} XP ({xpToNextLevel} to next level)
            </p>
          </CardContent>
        </InteractiveCard>

        {/* Current Streak */}
        <InteractiveCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {profile?.streak_count || 0} <span className="ml-1 text-orange-500">🔥</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep it going!
            </p>
          </CardContent>
        </InteractiveCard>

        {/* Coins Balance */}
        <InteractiveCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coins</CardTitle>
            <Coins className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.coins || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available to spend
            </p>
          </CardContent>
        </InteractiveCard>

        {/* Today's Progress */}
        <InteractiveCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaysCompleted}/{todaysTotal}
            </div>
            <Progress 
              value={todaysTotal > 0 ? (todaysCompleted / todaysTotal) * 100 : 0} 
              className="mt-2" 
            />
          </CardContent>
        </InteractiveCard>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <InteractiveCard>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump into your productivity workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <InteractiveButton className="w-full justify-start" variant="outline" hoverScale={true} hoverGlow={true} asChild>
              <Link href="/dashboard/todos">
                <Plus className="mr-2 h-4 w-4" />
                Add New Todo
              </Link>
            </InteractiveButton>
            <InteractiveButton className="w-full justify-start" variant="outline" hoverScale={true} hoverGlow={true} asChild>
              <Link href="/dashboard/calendar">
                <Target className="mr-2 h-4 w-4" />
                View Calendar
              </Link>
            </InteractiveButton>
            <InteractiveButton className="w-full justify-start" variant="outline" hoverScale={true} hoverGlow={true} asChild>
              <Link href="/dashboard/vision">
                <Zap className="mr-2 h-4 w-4" />
                Plan Goals
              </Link>
            </InteractiveButton>
          </CardContent>
        </InteractiveCard>

        {/* Recent Achievements */}
        <InteractiveCard>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your latest accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAchievements.map((achievement, index) => (
                <div key={index} className="flex items-center justify-between hover:bg-muted/50 rounded-lg p-2 transition-colors cursor-default">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-sm text-muted-foreground">{achievement.earned}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="hover:scale-105 transition-transform cursor-default">+50 XP</Badge>
                </div>
              ))}
              {recentAchievements.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Complete your first todo to earn achievements!
                </p>
              )}
            </div>
          </CardContent>
        </InteractiveCard>
      </div>
    </>
  );
}
