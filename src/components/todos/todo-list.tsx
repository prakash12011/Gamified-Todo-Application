"use client";
import { useState, useTransition } from "react";
import { Todo } from "@/types/todo";
import { InteractiveButton } from "@/components/ui/interactive-button";
import TodoModal from "./todo-modal";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Edit, Trash2, Calendar, Coins, Zap, MoreVertical } from "lucide-react";
import { completeTodoAction, deleteTodosAction } from "@/app/dashboard/todos/actions";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TodoListProps {
  todos: Todo[];
}

export default function TodoList({ todos: initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos || []);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleBulkDelete = async () => {
    startTransition(async () => {
      try {
        await deleteTodosAction(selected);
        setSelected([]);
        // Optimistically update UI
        setTodos((prev) => prev.filter((t) => !selected.includes(t.id)));
      } catch (error) {
        console.error('Error deleting todos:', error);
        // TODO: Show error toast
      }
    });
  };

  const handleSingleDelete = async (todoId: string) => {
    startTransition(async () => {
      try {
        await deleteTodosAction([todoId]);
        // Optimistically update UI
        setTodos((prev) => prev.filter((t) => t.id !== todoId));
      } catch (error) {
        console.error('Error deleting todo:', error);
        // TODO: Show error toast
      }
    });
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleEditComplete = () => {
    setEditingTodo(null);
    // The modal will trigger a revalidation via server action
  };

  const handleComplete = async (id: string) => {
    startTransition(async () => {
      try {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;
        
        await completeTodoAction(id);
        
        // Optimistically update UI
        setTodos((prev) => prev.map((t) => 
          t.id === id 
            ? { ...t, completed: true, completed_at: new Date().toISOString() }
            : t
        ));
        
        // TODO: Show XP/coin gain animation, confetti, streak/achievement notification
      } catch (error) {
        console.error('Error completing todo:', error);
        // TODO: Show error toast
      }
    });
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Updating todos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <TodoModal onAdded={() => {
          // The modal will trigger a revalidation via server action
          // No need to do anything here
        }} />
        {selected.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <InteractiveButton 
                variant="destructive" 
                disabled={!selected.length || isPending} 
                hoverScale={true}
                className="w-full sm:w-auto"
              >
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
        <>
          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-3">
            {todos.map((todo) => (
              <Card key={todo.id} className={`transition-all duration-200 hover:shadow-md py-0 ${todo.completed ? "opacity-60" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={selected.includes(todo.id)} 
                      onCheckedChange={(v) => setSelected(v ? [...selected, todo.id] : selected.filter(id => id !== todo.id))}
                      className="cursor-pointer mt-1 h-5 w-5" 
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium text-base leading-tight ${todo.completed ? "line-through" : ""}`}>
                          {todo.title}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <InteractiveButton 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </InteractiveButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!todo.completed && (
                              <>
                                <DropdownMenuItem onClick={() => handleComplete(todo.id)} disabled={isPending}>
                                  <Zap className="h-4 w-4 mr-2" />
                                  Complete
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(todo)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleSingleDelete(todo.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge 
                          variant={
                            todo.difficulty === 'easy' ? 'secondary' :
                            todo.difficulty === 'medium' ? 'default' :
                            todo.difficulty === 'hard' ? 'destructive' : 'outline'
                          }
                          className="text-xs"
                        >
                          {todo.difficulty.toUpperCase()}
                        </Badge>
                        
                        {todo.due_date && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">{format(new Date(todo.due_date), "MMM d")}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            <span className="text-xs">{todo.xp_reward} XP</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Coins className="h-3 w-3" />
                            <span className="text-xs">{todo.coin_reward}</span>
                          </div>
                        </div>
                        
                        {todo.completed && (
                          <span className="text-green-600 text-xs font-medium">✅ Completed</span>
                        )}
                      </div>
                      
                      {!todo.completed && (
                        <div className="pt-2">
                          <InteractiveButton 
                            size="sm" 
                            onClick={() => handleComplete(todo.id)} 
                            hoverScale={true} 
                            hoverGlow={true}
                            disabled={isPending}
                            className="w-full"
                          >
                            Complete Task
                          </InteractiveButton>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="p-3">
                    <Checkbox 
                      checked={selected.length === todos.length} 
                      onCheckedChange={(v) => setSelected(v ? todos.map(t => t.id) : [])}
                      className="cursor-pointer" 
                    />
                  </th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Difficulty</th>
                  <th className="p-3 text-left hidden lg:table-cell">Due Date</th>
                  <th className="p-3 text-left">XP</th>
                  <th className="p-3 text-left">Coins</th>
                  <th className="p-3 text-left hidden lg:table-cell">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {todos.map((todo) => (
                  <tr key={todo.id} className={`transition-colors hover:bg-muted/50 cursor-default ${todo.completed ? "opacity-60" : ""}`}>
                    <td className="p-3">
                      <Checkbox 
                        checked={selected.includes(todo.id)} 
                        onCheckedChange={(v) => setSelected(v ? [...selected, todo.id] : selected.filter(id => id !== todo.id))}
                        className="cursor-pointer" 
                      />
                    </td>
                    <td className="p-3 font-medium max-w-xs truncate">{todo.title}</td>
                    <td className="p-3">
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
                    <td className="p-3 hidden lg:table-cell">{todo.due_date ? format(new Date(todo.due_date), "MMM d, yyyy") : 'No due date'}</td>
                    <td className="p-3">{todo.xp_reward}</td>
                    <td className="p-3">{todo.coin_reward}</td>
                    <td className="p-3 hidden lg:table-cell">{todo.completed ? "✅ Completed" : "Pending"}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {!todo.completed && (
                          <>
                            <InteractiveButton 
                              size="sm" 
                              onClick={() => handleComplete(todo.id)} 
                              hoverScale={true} 
                              hoverGlow={true}
                              disabled={isPending}
                              className="hidden lg:inline-flex"
                            >
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
