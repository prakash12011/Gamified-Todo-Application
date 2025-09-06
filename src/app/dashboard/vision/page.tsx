'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { addYears, format } from 'date-fns';

interface VisionPlan {
  id: string;
  title: string;
  description: string;
  timeline_years: 1 | 3 | 5 | 10;
  target_date: string;
  category: string;
  progress_percentage: number;
  milestones: string[];
  created_at: string;
}

const categories = [
  { value: 'career', label: 'Career', icon: '💼' },
  { value: 'health', label: 'Health & Fitness', icon: '🏃‍♂️' },
  { value: 'relationships', label: 'Relationships', icon: '❤️' },
  { value: 'finance', label: 'Financial', icon: '💰' },
  { value: 'personal', label: 'Personal Growth', icon: '🌱' },
  { value: 'travel', label: 'Travel & Adventure', icon: '✈️' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'other', label: 'Other', icon: '🎯' },
];

export default function VisionPage() {
  const { user } = useAuth();
  const [visionPlans, setVisionPlans] = useState<VisionPlan[]>([]);
  const [selectedTimeline, setSelectedTimeline] = useState<1 | 3 | 5 | 10>(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<VisionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual Supabase calls
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setVisionPlans([
        {
          id: '1',
          title: 'Become a Senior Developer',
          description: 'Advance to a senior developer role with expertise in full-stack development',
          timeline_years: 3,
          target_date: format(addYears(new Date(), 3), 'yyyy-MM-dd'),
          category: 'career',
          progress_percentage: 35,
          milestones: ['Complete React certification', 'Build 5 major projects', 'Lead a team'],
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Run a Marathon',
          description: 'Complete a full 26.2 mile marathon in under 4 hours',
          timeline_years: 1,
          target_date: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
          category: 'health',
          progress_percentage: 60,
          milestones: ['Run 5K consistently', 'Run 10K', 'Run half marathon', 'Complete full marathon'],
          created_at: new Date().toISOString(),
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getFilteredPlans = (timeline: number) => {
    return visionPlans.filter(plan => plan.timeline_years === timeline);
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(cat => cat.value === category) || categories[categories.length - 1];
  };

  const handleEditPlan = (plan: VisionPlan) => {
    setEditingPlan(plan);
    setIsEditDialogOpen(true);
  };

  const handleDeletePlan = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this vision plan?')) {
      setVisionPlans(visionPlans.filter(plan => plan.id !== planId));
    }
  };

  const handleUpdatePlan = (updatedPlan: VisionPlan) => {
    setVisionPlans(visionPlans.map(plan => 
      plan.id === updatedPlan.id ? updatedPlan : plan
    ));
    setIsEditDialogOpen(false);
    setEditingPlan(null);
  };

  const CreateVisionPlanDialog = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      timeline_years: 1 as 1 | 3 | 5 | 10,
      category: 'personal',
      milestones: [''],
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newPlan: VisionPlan = {
        id: Date.now().toString(),
        ...formData,
        target_date: format(addYears(new Date(), formData.timeline_years), 'yyyy-MM-dd'),
        progress_percentage: 0,
        milestones: formData.milestones.filter(m => m.trim() !== ''),
        created_at: new Date().toISOString(),
      };
      setVisionPlans([...visionPlans, newPlan]);
      setIsCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        timeline_years: 1,
        category: 'personal',
        milestones: [''],
      });
    };

    const addMilestone = () => {
      setFormData({
        ...formData,
        milestones: [...formData.milestones, '']
      });
    };

    const updateMilestone = (index: number, value: string) => {
      const newMilestones = [...formData.milestones];
      newMilestones[index] = value;
      setFormData({ ...formData, milestones: newMilestones });
    };

    const removeMilestone = (index: number) => {
      const newMilestones = formData.milestones.filter((_, i) => i !== index);
      setFormData({ ...formData, milestones: newMilestones });
    };

    return (
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Vision Plan
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Vision Plan</DialogTitle>
            <DialogDescription>
              Define your long-term goals and break them down into actionable milestones.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What do you want to achieve?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your vision in detail..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Select 
                  value={formData.timeline_years.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, timeline_years: parseInt(value) as 1 | 3 | 5 | 10 })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="10">10 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Milestones</Label>
                <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Milestone
                </Button>
              </div>
              <div className="space-y-2">
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={milestone}
                      onChange={(e) => updateMilestone(index, e.target.value)}
                      placeholder={`Milestone ${index + 1}`}
                    />
                    {formData.milestones.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Vision Plan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const EditVisionPlanDialog = () => {
    const [formData, setFormData] = useState({
      title: editingPlan?.title || '',
      description: editingPlan?.description || '',
      timeline_years: editingPlan?.timeline_years || 1 as 1 | 3 | 5 | 10,
      category: editingPlan?.category || 'personal',
      milestones: editingPlan?.milestones || [''],
    });

    // Update form data when editing plan changes
    useEffect(() => {
      if (editingPlan) {
        setFormData({
          title: editingPlan.title,
          description: editingPlan.description,
          timeline_years: editingPlan.timeline_years,
          category: editingPlan.category,
          milestones: editingPlan.milestones.length > 0 ? editingPlan.milestones : [''],
        });
      }
    }, [editingPlan]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingPlan) return;

      const updatedPlan: VisionPlan = {
        ...editingPlan,
        ...formData,
        target_date: format(addYears(new Date(), formData.timeline_years), 'yyyy-MM-dd'),
        milestones: formData.milestones.filter(m => m.trim() !== ''),
      };
      handleUpdatePlan(updatedPlan);
    };

    const addMilestone = () => {
      setFormData({
        ...formData,
        milestones: [...formData.milestones, '']
      });
    };

    const updateMilestone = (index: number, value: string) => {
      const newMilestones = [...formData.milestones];
      newMilestones[index] = value;
      setFormData({ ...formData, milestones: newMilestones });
    };

    const removeMilestone = (index: number) => {
      const newMilestones = formData.milestones.filter((_, i) => i !== index);
      setFormData({ ...formData, milestones: newMilestones });
    };

    return (
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vision Plan</DialogTitle>
            <DialogDescription>
              Update your vision plan and milestones.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Goal Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What do you want to achieve?"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your vision in detail..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-timeline">Timeline</Label>
                <Select 
                  value={formData.timeline_years.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, timeline_years: parseInt(value) as 1 | 3 | 5 | 10 })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Year</SelectItem>
                    <SelectItem value="3">3 Years</SelectItem>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="10">10 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Milestones</Label>
                <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Milestone
                </Button>
              </div>
              <div className="space-y-2">
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={milestone}
                      onChange={(e) => updateMilestone(index, e.target.value)}
                      placeholder={`Milestone ${index + 1}`}
                    />
                    {formData.milestones.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Vision Plan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const VisionPlanCard = ({ plan }: { plan: VisionPlan }) => {
    const categoryInfo = getCategoryInfo(plan.category);
    const timeRemaining = new Date(plan.target_date).getTime() - new Date().getTime();
    const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));

    return (
      <Card className="group hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{categoryInfo.icon}</span>
              <div>
                <CardTitle className="text-lg">{plan.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {plan.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" onClick={() => handleEditPlan(plan)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <Badge variant="outline">{categoryInfo.label}</Badge>
            <div className="flex items-center text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              {daysRemaining} days left
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-500">{plan.progress_percentage}%</span>
            </div>
            <Progress value={plan.progress_percentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Milestones</span>
              <span className="text-sm text-gray-500">
                {Math.floor(plan.milestones.length * (plan.progress_percentage / 100))}/{plan.milestones.length}
              </span>
            </div>
            <div className="space-y-1">
              {plan.milestones.slice(0, 3).map((milestone, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    index < (plan.milestones.length * (plan.progress_percentage / 100)) 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                  }`} />
                  <span className={index < (plan.milestones.length * (plan.progress_percentage / 100)) 
                    ? 'line-through text-gray-500' 
                    : ''
                  }>
                    {milestone}
                  </span>
                </div>
              ))}
              {plan.milestones.length > 3 && (
                <div className="text-xs text-gray-500 ml-4">
                  +{plan.milestones.length - 3} more milestones
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTimelineView = (timeline: 1 | 3 | 5 | 10) => {
    const plans = getFilteredPlans(timeline);
    
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-2 bg-gray-200 rounded animate-pulse" />
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (plans.length === 0) {
      return (
        <div className="text-center py-12">
          <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {timeline}-year vision plans yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start planning your {timeline}-year goals and break them down into actionable milestones.
          </p>
          <CreateVisionPlanDialog />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <VisionPlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vision Board</h1>
          <p className="text-gray-600">
            Visualize your long-term goals and track your progress towards achieving them
          </p>
        </div>
        <CreateVisionPlanDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="text-2xl mr-3">🎯</div>
            <div>
              <div className="text-2xl font-bold">{visionPlans.length}</div>
              <div className="text-sm text-gray-500">Active Goals</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="text-2xl mr-3">📈</div>
            <div>
              <div className="text-2xl font-bold">
                {Math.round(visionPlans.reduce((acc, plan) => acc + plan.progress_percentage, 0) / visionPlans.length || 0)}%
              </div>
              <div className="text-sm text-gray-500">Avg Progress</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="text-2xl mr-3">🏆</div>
            <div>
              <div className="text-2xl font-bold">
                {visionPlans.filter(plan => plan.progress_percentage === 100).length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="text-2xl mr-3">⏰</div>
            <div>
              <div className="text-2xl font-bold">
                {visionPlans.filter(plan => {
                  const daysLeft = (new Date(plan.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
                  return daysLeft < 30 && daysLeft > 0;
                }).length}
              </div>
              <div className="text-sm text-gray-500">Due Soon</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTimeline.toString()} onValueChange={(value) => setSelectedTimeline(parseInt(value) as 1 | 3 | 5 | 10)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="1" className="flex items-center space-x-2">
            <span>1 Year</span>
            <Badge variant="secondary" className="ml-2">
              {getFilteredPlans(1).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="3" className="flex items-center space-x-2">
            <span>3 Years</span>
            <Badge variant="secondary" className="ml-2">
              {getFilteredPlans(3).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="5" className="flex items-center space-x-2">
            <span>5 Years</span>
            <Badge variant="secondary" className="ml-2">
              {getFilteredPlans(5).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="10" className="flex items-center space-x-2">
            <span>10 Years</span>
            <Badge variant="secondary" className="ml-2">
              {getFilteredPlans(10).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="1" className="space-y-6">
          {renderTimelineView(1)}
        </TabsContent>
        
        <TabsContent value="3" className="space-y-6">
          {renderTimelineView(3)}
        </TabsContent>
        
        <TabsContent value="5" className="space-y-6">
          {renderTimelineView(5)}
        </TabsContent>
        
        <TabsContent value="10" className="space-y-6">
          {renderTimelineView(10)}
        </TabsContent>
      </Tabs>

      <EditVisionPlanDialog />
    </div>
  );
}
