"use client";
import { useEffect, useState } from "react";
import { fetchTodos, deleteTodos, updateTodo } from "@/lib/supabase/todos";
import { applyTodoCompletionRewards } from "@/lib/supabase/gamification";
import { checkAndAwardAchievements } from "@/lib/supabase/achievements";
import { Todo } from "@/types/todo";
import { InteractiveButton } from "@/components/ui/interactive-button";
import TodoModal from "./todo-modal";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TodoList(todosProp: { todos: Todo[] }) {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>(todosProp.todos || []);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const loadTodos = () => {
    if (!user) return;
    setLoading(true);
    fetchTodos(user.id)
      .then(setTodos)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTodos();
    (async () => {
      console.log("Use Effect Fetched todos:", await fetchTodos(user?.id ?? ""));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      console.log('Deleting todos:', selected);
      await deleteTodos(selected);
      setTodos((prev) => prev.filter((t) => !selected.includes(t.id)));
      setSelected([]);
      console.log('Bulk delete successful');
    } catch (error) {
      console.error('Error deleting todos:', error);
      alert(`Failed to delete todos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleDelete = async (todoId: string) => {
    try {
      setLoading(true);
      console.log('Deleting single todo:', todoId);
      await deleteTodos([todoId]);
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
      console.log('Single delete successful');
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert(`Failed to delete todo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleEditComplete = () => {
    setEditingTodo(null);
    loadTodos(); // Refresh the list
  };

  const handleComplete = async (id: string) => {
    try {
      setLoading(true);
      const todo = todos.find(t => t.id === id);
      if (!todo) {
        console.error('Todo not found:', id);
        setLoading(false);
        return;
      }

      console.log('Completing todo:', id, todo);
      
      const now = new Date();
      const onTime = todo.due_date ? now <= new Date(todo.due_date) : true;
      
      const updated = await updateTodo(id, { 
        completed: true, 
        completed_at: now.toISOString() 
      });
      
      console.log('Todo updated successfully:', updated);
      
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      
      // Gamification logic
      const rewards = await applyTodoCompletionRewards({
        userId: todo.user_id,
        todoId: todo.id,
        difficulty: todo.difficulty,
        onTime,
      });
      
      console.log('Rewards applied:', rewards);
      
      await checkAndAwardAchievements(todo.user_id);
      
      // TODO: Show XP/coin gain animation, confetti, streak/achievement notification
    } catch (error) {
      console.error('Error completing todo:', error);
      // Show user-friendly error message
      alert(`Failed to complete todo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="overflow-x-auto">
      <div className="mb-2 flex gap-2 items-center">
        <TodoModal onAdded={loadTodos} />
        {selected.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <InteractiveButton variant="destructive" disabled={!selected.length} hoverScale={true}>
                Delete Selected ({selected.length})
              </InteractiveButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete {selected.length} todo{selected.length > 1 ? 's' : ''}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      {/* Edit Modal */}
      {editingTodo && (
        <TodoModal 
          todo={editingTodo} 
          onAdded={handleEditComplete} 
          onClose={() => setEditingTodo(null)} 
        />
      )}
      
      {!todos.length ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No todos yet. Create your first todo above!</p>
        </div>
      ) : (
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-muted">
            <th className="p-2">
              <Checkbox 
                checked={selected.length === todos.length} 
                onCheckedChange={(v) => setSelected(v ? todos.map(t => t.id) : [])}
                className="cursor-pointer" 
              />
            </th>
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Difficulty</th>
            <th className="p-2 text-left">Due Date</th>
            <th className="p-2 text-left">XP</th>
            <th className="p-2 text-left">Coins</th>
            <th className="p-2 text-left">Completed</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((todo) => (
            <tr key={todo.id} className={`transition-colors hover:bg-muted/50 cursor-default ${todo.completed ? "opacity-60" : ""}`}>
              <td className="p-2">
                <Checkbox 
                  checked={selected.includes(todo.id)} 
                  onCheckedChange={(v) => setSelected(v ? [...selected, todo.id] : selected.filter(id => id !== todo.id))}
                  className="cursor-pointer" 
                />
              </td>
              <td className="p-2 font-medium">{todo.title}</td>
              <td className="p-2">
                <Badge 
                  variant={
                    todo.difficulty === 'easy' ? 'secondary' :
                    todo.difficulty === 'medium' ? 'default' :
                    todo.difficulty === 'hard' ? 'destructive' : 'outline'
                  }
                  className="hover:scale-105 transition-transform cursor-default"
                >
                  {todo.difficulty.toUpperCase()}
                </Badge>
              </td>
              <td className="p-2">{todo.due_date ? format(new Date(todo.due_date), "MMM d, yyyy") : 'No due date'}</td>
              <td className="p-2">{todo.xp_reward}</td>
              <td className="p-2">{todo.coin_reward}</td>
              <td className="p-2">{todo.completed ? "✅" : ""}</td>
              <td className="p-2 flex gap-2">
                {!todo.completed && (
                  <>
                    <InteractiveButton size="sm" onClick={() => handleComplete(todo.id)} hoverScale={true} hoverGlow={true}>
                      Complete
                    </InteractiveButton>
                    <InteractiveButton 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEdit(todo)} 
                      hoverScale={true}
                    >
                      <Edit className="h-4 w-4" />
                    </InteractiveButton>
                  </>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <InteractiveButton 
                      size="sm" 
                      variant="destructive" 
                      hoverScale={true}
                    >
                      <Trash2 className="h-4 w-4" />
                    </InteractiveButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Todo</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{todo.title}&quot;? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleSingleDelete(todo.id)} 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
}
