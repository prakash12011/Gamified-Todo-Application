import { requireAuth } from "@/lib/auth/server";
import TodoList from "@/components/todos/todo-list";
import { fetchTodosServer } from "@/lib/supabase/todos-server";
import { Suspense } from "react";

function TodoListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-muted rounded animate-pulse" />
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default async function TodosPage() {
  try {
    // Use the helper function to get authenticated user
    const { user } = await requireAuth();
    const todos = await fetchTodosServer(user.id);

    console.log("Server-side fetched todos:", todos, user.id);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Todo List</h1>
          <p className="text-muted-foreground">
            Manage your tasks and earn XP by completing them!
          </p>
        </div>

        <Suspense fallback={<TodoListSkeleton />}>
          <TodoList todos={todos} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error loading todos:", error);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Todo List</h1>
          <p className="text-muted-foreground">
            Manage your tasks and earn XP by completing them!
          </p>
        </div>
        
        <div className="text-center py-8">
          <p className="text-destructive">Failed to load todos. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }
}
