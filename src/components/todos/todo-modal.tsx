"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { addTodo } from "@/lib/supabase/todos";
import { useAuth } from "@/hooks/use-auth";
import { TodoDifficulty } from "@/types/todo";

const difficultyXPMap = {
  'easy': 10,
  'medium': 20,
  'hard': 40,
  'epic': 80
};

const difficultyCoinMap = {
  'easy': 5,
  'medium': 10,
  'hard': 20,
  'epic': 40
};

interface TodoFormData {
  title: string;
  description: string;
  difficulty: TodoDifficulty;
  due_date: Date | null;
  is_recurring: boolean;
  recurring_type: 'daily' | 'weekly' | 'monthly' | null;
}

export default function TodoModal({ onAdded }: { onAdded?: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<TodoFormData>({
    title: '',
    description: '',
    difficulty: 'easy',
    due_date: null,
    is_recurring: false,
    recurring_type: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim()) return;

    try {
      await addTodo({
        title: formData.title,
        description: formData.description || undefined,
        difficulty: formData.difficulty,
        due_date: formData.due_date ? formData.due_date.toISOString() : null,
        is_recurring: formData.is_recurring,
        recurring_type: formData.recurring_type,
        user_id: user.id,
        xp_reward: difficultyXPMap[formData.difficulty],
        coin_reward: difficultyCoinMap[formData.difficulty],
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        difficulty: 'easy',
        due_date: null,
        is_recurring: false,
        recurring_type: null,
      });
      onAdded?.();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Todo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add New Todo</DialogTitle>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <Input 
              placeholder="Title" 
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          <Input 
            placeholder="Description" 
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />

          <div>
            <Select 
              value={formData.difficulty}
              onValueChange={(v) => setFormData(prev => ({ ...prev, difficulty: v as TodoDifficulty }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy (+{difficultyXPMap.easy} XP, +{difficultyCoinMap.easy} coins)</SelectItem>
                <SelectItem value="medium">Medium (+{difficultyXPMap.medium} XP, +{difficultyCoinMap.medium} coins)</SelectItem>
                <SelectItem value="hard">Hard (+{difficultyXPMap.hard} XP, +{difficultyCoinMap.hard} coins)</SelectItem>
                <SelectItem value="epic">Epic (+{difficultyXPMap.epic} XP, +{difficultyCoinMap.epic} coins)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Due Date (Optional)</p>
            <Calendar
              mode="single"
              selected={formData.due_date ?? undefined}
              onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date || null }))}
              className="rounded-md border"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: !!checked }))}
            />
            <label htmlFor="recurring" className="text-sm font-medium">Recurring task</label>
          </div>

          {formData.is_recurring && (
            <Select 
              value={formData.recurring_type || ''}
              onValueChange={(v) => setFormData(prev => ({ ...prev, recurring_type: v as 'daily' | 'weekly' | 'monthly' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim()}>
              Add Todo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
