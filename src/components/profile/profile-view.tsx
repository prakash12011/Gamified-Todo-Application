'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Target, TrendingUp, Upload, Edit2, Save, X } from 'lucide-react';
import { updateUserProfile, uploadAvatar } from '@/lib/supabase/profile-client';

type Profile = {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  level: number;
  xp: number;
  coins: number;
  streak_count: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  category: string;
  xp_reward: number;
  coin_reward: number;
  criteria: string;
  created_at: string;
};

type UserAchievement = {
  id: string;
  user_id: string;
  achievement_type_id: string;
  unlocked_at: string;
  achievement_type: Achievement;
};

type UserStats = {
  completedTasks: number;
  totalTasks: number;
  totalPoints: number;
  streak: number;
};

interface ProfileViewProps {
  initialProfile: Profile;
  userAchievements: UserAchievement[];
  availableAchievements: Achievement[];
  userStats: UserStats;
}

export function ProfileView({ 
  initialProfile, 
  userAchievements, 
  availableAchievements, 
  userStats 
}: ProfileViewProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    username: profile.username || '',
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const updatedProfile = await updateUserProfile(profile.user_id, editForm);
      setProfile(updatedProfile);
      setIsEditing(false);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const avatarUrl = await uploadAvatar(profile.user_id, file);
      setProfile({ ...profile, avatar_url: avatarUrl });
      console.log('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const completionRate = userStats.totalTasks > 0 
    ? Math.round((userStats.completedTasks / userStats.totalTasks) * 100) 
    : 0;

  const unlockedAchievements = userAchievements.map(ua => ua.achievement_type);
  const lockedAchievements = availableAchievements.filter(
    achievement => !userAchievements.some(ua => ua.achievement_type_id === achievement.id)
  );

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>
                  {profile.username?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <Label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 cursor-pointer">
                <div className="bg-primary rounded-full p-2 hover:bg-primary/90">
                  <Upload className="h-4 w-4 text-primary-foreground" />
                </div>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isLoading}
                />
              </Label>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      placeholder="Enter your username"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <CardTitle className="text-2xl">
                    {profile.username || 'Anonymous User'}
                  </CardTitle>
                  <CardDescription>
                    @{profile.username || 'no-username'}
                  </CardDescription>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalPoints}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              out of {userStats.totalTasks} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userAchievements.length}</div>
            <p className="text-xs text-muted-foreground">
              out of {availableAchievements.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>
            Track your progress and unlock new badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="unlocked" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unlocked">
                Unlocked ({userAchievements.length})
              </TabsTrigger>
              <TabsTrigger value="available">
                Available ({lockedAchievements.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="unlocked" className="space-y-4">
              {userAchievements.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No achievements unlocked yet. Start completing tasks to earn your first badge!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userAchievements.map((userAchievement) => (
                    <Card key={userAchievement.id} className="relative">
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{userAchievement.achievement_type.badge_icon}</span>
                          <div>
                            <CardTitle className="text-lg">
                              {userAchievement.achievement_type.name}
                            </CardTitle>
                            <Badge variant="secondary">
                              {userAchievement.achievement_type.xp_reward} XP
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {userAchievement.achievement_type.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Unlocked: {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="available" className="space-y-4">
              {lockedAchievements.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Congratulations! You have unlocked all available achievements.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lockedAchievements.map((achievement) => (
                    <Card key={achievement.id} className="relative opacity-60">
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl grayscale">{achievement.badge_icon}</span>
                          <div>
                            <CardTitle className="text-lg">
                              {achievement.name}
                            </CardTitle>
                            <Badge variant="outline">
                              {achievement.xp_reward} XP
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {achievement.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
