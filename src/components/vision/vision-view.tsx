'use client';

import { useState } from 'react';
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
import { addYears, format } from 'date-fns';
import { VisionPlan } from '@/types/vision';
import { createVisionPlan, updateVisionPlan, deleteVisionPlan } from '@/lib/supabase/vision-client';
import { User } from '@supabase/supabase-js';

interface VisionViewProps {
  initialVisionPlans: VisionPlan[];
  user: User;
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

export function VisionView({ initialVisionPlans, user }: VisionViewProps) {
  const [visionPlans, setVisionPlans] = useState<VisionPlan[]>(initialVisionPlans);
  const [selectedTimeline, setSelectedTimeline] = useState<1 | 3 | 5 | 10>(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<VisionPlan | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleDeletePlan = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this vision plan?')) {
      setLoading(true);
      const success = await deleteVisionPlan(planId);
      if (success) {
        setVisionPlans(visionPlans.filter(plan => plan.id !== planId));
      }
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (updatedPlan: VisionPlan) => {
    setLoading(true);
    const result = await updateVisionPlan(updatedPlan.id, updatedPlan);
    if (result) {
      setVisionPlans(visionPlans.map(plan => 
        plan.id === updatedPlan.id ? result : plan
      ));
      setIsEditDialogOpen(false);
      setEditingPlan(null);
    }
    setLoading(false);
  };

  const CreateVisionPlanDialog = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      timeline_years: 1 as 1 | 3 | 5 | 10,
      category: 'personal',
      milestones: [''],
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      
      const newPlanData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        timeline_years: formData.timeline_years,
        category: formData.category,
        target_date: format(addYears(new Date(), formData.timeline_years), 'yyyy-MM-dd'),
        progress_percentage: 0,
        milestones: formData.milestones.filter(m => m.trim() !== ''),
      };

      const result = await createVisionPlan(newPlanData);
      if (result) {
        setVisionPlans([result, ...visionPlans]);
        setIsCreateDialogOpen(false);
        setFormData({
          title: '',
          description: '',
          timeline_years: 1,
          category: 'personal',
          milestones: [''],
        });
      }
      setLoading(false);
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
            <Plus className="mr-2 h-4 w-4" />
            Add Vision Plan
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Vision Plan</DialogTitle>
            <DialogDescription>
              Define your long-term goals and track your progress towards achieving them.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter your vision title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your vision in detail"
                required
              />
            </div>

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
              <Label>Milestones</Label>
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
                      size="icon"
                      onClick={() => removeMilestone(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addMilestone}>
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Vision Plan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const EditVisionPlanDialog = () => {
    if (!editingPlan) return null;

    const [formData, setFormData] = useState({
      title: editingPlan.title,
      description: editingPlan.description,
      timeline_years: editingPlan.timeline_years,
      category: editingPlan.category,
      milestones: editingPlan.milestones.length > 0 ? editingPlan.milestones : [''],
      progress_percentage: editingPlan.progress_percentage,
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const updatedPlan: VisionPlan = {
        ...editingPlan,
        title: formData.title,
        description: formData.description,
        timeline_years: formData.timeline_years,
        category: formData.category,
        milestones: formData.milestones.filter(m => m.trim() !== ''),
        progress_percentage: formData.progress_percentage,
        target_date: format(addYears(new Date(editingPlan.created_at), formData.timeline_years), 'yyyy-MM-dd'),
      };
      
      await handleUpdatePlan(updatedPlan);
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vision Plan</DialogTitle>
            <DialogDescription>
              Update your vision plan details and track your progress.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
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
                <Label htmlFor="edit-progress">Progress (%)</Label>
                <Input
                  id="edit-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress_percentage}
                  onChange={(e) => setFormData({ ...formData, progress_percentage: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Milestones</Label>
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
                      size="icon"
                      onClick={() => removeMilestone(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addMilestone}>
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Vision Plan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  if (!user) {
    return <div>Please log in to view your vision plans.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vision Board</h1>
          <p className="text-muted-foreground">Plan and track your long-term goals</p>
        </div>
        <CreateVisionPlanDialog />
      </div>

      <Tabs value={selectedTimeline.toString()} onValueChange={(value) => setSelectedTimeline(parseInt(value) as 1 | 3 | 5 | 10)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="1">1 Year</TabsTrigger>
          <TabsTrigger value="3">3 Years</TabsTrigger>
          <TabsTrigger value="5">5 Years</TabsTrigger>
          <TabsTrigger value="10">10 Years</TabsTrigger>
        </TabsList>

        {[1, 3, 5, 10].map((timeline) => (
          <TabsContent key={timeline} value={timeline.toString()} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{timeline} Year Vision</h2>
              <Badge variant="outline">
                {getFilteredPlans(timeline).length} plan(s)
              </Badge>
            </div>

            {getFilteredPlans(timeline).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No {timeline}-year plans yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start planning your future by creating your first {timeline}-year vision plan.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Plan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredPlans(timeline).map((plan) => {
                  const categoryInfo = getCategoryInfo(plan.category);
                  return (
                    <Card key={plan.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{categoryInfo.icon}</span>
                            <div>
                              <CardTitle className="text-lg">{plan.title}</CardTitle>
                              <Badge variant="secondary" className="text-xs">
                                {categoryInfo.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEditPlan(plan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeletePlan(plan.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <CardDescription>{plan.description}</CardDescription>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Target: {format(new Date(plan.target_date), 'MMM dd, yyyy')}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-muted-foreground">{plan.progress_percentage}%</span>
                          </div>
                          <Progress value={plan.progress_percentage} className="h-2" />
                        </div>

                        {plan.milestones.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium">Milestones</span>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {plan.milestones.slice(0, 3).map((milestone, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <Target className="h-3 w-3" />
                                  {milestone}
                                </li>
                              ))}
                              {plan.milestones.length > 3 && (
                                <li className="text-xs">+{plan.milestones.length - 3} more...</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <EditVisionPlanDialog />
    </div>
  );
}
