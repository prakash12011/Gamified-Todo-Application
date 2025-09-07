"use client";
import { useState, useEffect } from "react";
import { InteractiveButton } from "@/components/ui/interactive-button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { addTodo, updateTodo } from "@/lib/supabase/todos";
import { useAuth } from "@/hooks/use-auth";
import { TodoDifficulty, Todo } from "@/types/todo";

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

export default function TodoModal({ 
  onAdded, 
  todo,
  onClose 
}: { 
  onAdded?: () => void;
  todo?: Todo | null;
  onClose?: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const isEditing = !!todo;
  
  const [formData, setFormData] = useState<TodoFormData>({
    title: todo?.title || '',
    description: todo?.description || '',
    difficulty: todo?.difficulty || 'easy',
    due_date: todo?.due_date ? new Date(todo.due_date) : null,
    is_recurring: todo?.is_recurring || false,
    recurring_type: todo?.recurring_type || null,
  });

  // Update form when todo prop changes
  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title || '',
        description: todo.description || '',
        difficulty: todo.difficulty || 'easy',
        due_date: todo.due_date ? new Date(todo.due_date) : null,
        is_recurring: todo.is_recurring || false,
        recurring_type: todo.recurring_type || null,
      });
      setOpen(true);
    }
  }, [todo]);

  // Close modal when editing is done
  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim()) return;

    try {
      if (isEditing && todo) {
        // Update existing todo
        await updateTodo(todo.id, {
          title: formData.title,
          description: formData.description || undefined,
          difficulty: formData.difficulty,
          due_date: formData.due_date ? formData.due_date.toISOString() : null,
          is_recurring: formData.is_recurring,
          recurring_type: formData.recurring_type,
          xp_reward: difficultyXPMap[formData.difficulty],
          coin_reward: difficultyCoinMap[formData.difficulty],
          updated_at: new Date().toISOString(),
        });
      } else {
        // Add new todo
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
      }
      
      handleClose();
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
      console.error('Error saving todo:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isEditing ? handleClose : setOpen}>
      {!isEditing && (
        <DialogTrigger asChild>
          <InteractiveButton hoverScale={true} hoverGlow={true}>Add Todo</InteractiveButton>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogTitle>{isEditing ? 'Edit Todo' : 'Add New Todo'}</DialogTitle>
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
              className="cursor-pointer"
            />
            <label htmlFor="recurring" className="text-sm font-medium cursor-pointer hover:text-primary transition-colors">Recurring task</label>
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
            <InteractiveButton type="button" variant="outline" onClick={handleClose} hoverScale={true}>
              Cancel
            </InteractiveButton>
            <InteractiveButton type="submit" disabled={!formData.title.trim()} hoverScale={true} hoverGlow={true}>
              {isEditing ? 'Update Todo' : 'Add Todo'}
            </InteractiveButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
