'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Trophy, Star, Flame, Coins, Edit, Camera, Gift, Calendar, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { fetchUserProfile } from '@/lib/supabase/profiles';
import { Profile } from '@/types/profile';

interface Achievement {
  id: string;
  badge_name: string;
  badge_description: string;
  earned_at: string;
  xp_earned: number;
  icon: string;
}

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [availableBadges, setAvailableBadges] = useState<BadgeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProfileData();
    }
  }, [user?.id]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const profileData = await fetchUserProfile(user!.id);
      setProfile(profileData);
      
      // Mock achievements data - replace with actual Supabase calls
      setAchievements([
        {
          id: '1',
          badge_name: 'First Steps',
          badge_description: 'Complete your first todo',
          earned_at: '2024-01-15T10:30:00Z',
          xp_earned: 10,
          icon: '🌟'
        },
        {
          id: '2',
          badge_name: 'Getting Started',
          badge_description: 'Complete 5 todos',
          earned_at: '2024-01-20T14:45:00Z',
          xp_earned: 25,
          icon: '🚀'
        },
        {
          id: '3',
          badge_name: 'Week Warrior',
          badge_description: 'Maintain a 7-day streak',
          earned_at: '2024-02-01T09:15:00Z',
          xp_earned: 150,
          icon: '🔥'
        }
      ]);

      setAvailableBadges([
        {
          id: '4',
          name: 'Task Master',
          description: 'Complete 50 todos',
          icon: '👑',
          requirement_type: 'completion',
          requirement_value: 50,
          xp_reward: 100
        },
        {
          id: '5',
          name: 'Month Champion',
          description: 'Maintain a 30-day streak',
          icon: '👑',
          requirement_type: 'streak',
          requirement_value: 30,
          xp_reward: 500
        },
        {
          id: '6',
          name: 'Rising Star',
          description: 'Reach level 10',
          icon: '⭐',
          requirement_type: 'level',
          requirement_value: 10,
          xp_reward: 200
        }
      ]);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevel = (totalXP: number) => Math.floor(totalXP / 100) + 1;
  const getXPToNextLevel = (totalXP: number) => 100 - (totalXP % 100);
  const getCurrentLevelXP = (totalXP: number) => totalXP % 100;

  const getLevelColor = (level: number) => {
    if (level <= 10) return 'from-blue-500 to-blue-600';
    if (level <= 25) return 'from-purple-500 to-purple-600';
    if (level <= 50) return 'from-orange-500 to-red-500';
    return 'from-pink-500 to-violet-500';
  };

  const EditProfileDialog = () => {
    const [formData, setFormData] = useState({
      username: profile?.username || '',
      avatar_url: profile?.avatar_url || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Update profile logic here
      setIsEditDialogOpen(false);
    };

    return (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information and avatar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="Enter avatar URL"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const currentLevel = getLevel(profile.xp);
  const xpToNext = getXPToNextLevel(profile.xp);
  const currentLevelXP = getCurrentLevelXP(profile.xp);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-gray-600">Manage your profile and view your achievements</p>
        </div>
        <EditProfileDialog />
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-2xl">
                  {profile.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                variant="secondary"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold">{profile.username}</h2>
                <Badge 
                  variant="secondary" 
                  className={`bg-gradient-to-r ${getLevelColor(currentLevel)} text-white`}
                >
                  Level {currentLevel}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-lg font-semibold">{profile.xp}</div>
                    <div className="text-sm text-gray-500">Total XP</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="text-lg font-semibold">{profile.coins}</div>
                    <div className="text-sm text-gray-500">Coins</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="text-lg font-semibold">{profile.streak_count}</div>
                    <div className="text-sm text-gray-500">Day Streak</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="text-lg font-semibold">{achievements.length}</div>
                    <div className="text-sm text-gray-500">Achievements</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress to Level {currentLevel + 1}</span>
                  <span>{currentLevelXP}/100 XP</span>
                </div>
                <Progress value={currentLevelXP} className="h-3" />
                <div className="text-sm text-gray-500">
                  {xpToNext} XP needed for next level
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earned Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Earned Badges</span>
                  <Badge>{achievements.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Achievements you've unlocked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.badge_name}</h4>
                        <p className="text-sm text-gray-600">{achievement.badge_description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            +{achievement.xp_earned} XP
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(achievement.earned_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Available Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Available Badges</span>
                  <Badge variant="outline">{availableBadges.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Achievements you can unlock
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableBadges.map((badge) => (
                    <div key={badge.id} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-60">
                      <div className="text-2xl grayscale">{badge.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{badge.name}</h4>
                        <p className="text-sm text-gray-600">{badge.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            +{badge.xp_reward} XP
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Requires: {badge.requirement_value} {badge.requirement_type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Level Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {currentLevel}
                  </div>
                  <Progress value={currentLevelXP} className="h-4" />
                  <div className="text-sm text-gray-600">
                    {currentLevelXP}/100 XP to Level {currentLevel + 1}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Streak Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-orange-500">
                    {profile.streak_count}
                  </div>
                  <div className="flex justify-center">
                    <Flame className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="text-sm text-gray-600">
                    Current daily streak
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Coins className="h-5 w-5" />
                  <span>Coin Balance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-yellow-600">
                    {profile.coins}
                  </div>
                  <Button variant="outline" className="w-full">
                    <Gift className="h-4 w-4 mr-2" />
                    Redeem Rewards
                  </Button>
                  <div className="text-sm text-gray-600">
                    Available to spend
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reward Shop</CardTitle>
              <CardDescription>
                Spend your coins on custom rewards and bonuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Gift className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Reward Shop Coming Soon
                </h3>
                <p className="text-gray-500 mb-6">
                  Customize your rewards and spend your hard-earned coins on meaningful incentives.
                </p>
                <Button disabled>
                  <Coins className="h-4 w-4 mr-2" />
                  Browse Rewards
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Member since</span>
                  <span className="font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Total XP earned</span>
                  <span className="font-medium">{profile.xp}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Current level</span>
                  <span className="font-medium">Level {currentLevel}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Achievements unlocked</span>
                  <span className="font-medium">{achievements.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Longest streak</span>
                  <span className="font-medium">{profile.streak_count} days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productivity Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Analytics Coming Soon
                  </h3>
                  <p className="text-gray-500">
                    Detailed productivity insights and habit formation analytics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
