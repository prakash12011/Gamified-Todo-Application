"use client";
import TodoList from "@/components/todos/todo-list";
import { useAuth } from "@/hooks/use-auth";

export default function TodosPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view your todos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Todo List</h1>
        <p className="text-muted-foreground">
          Manage your tasks and earn XP by completing them!
        </p>
      </div>
      
      <TodoList />
    </div>
  );
}
