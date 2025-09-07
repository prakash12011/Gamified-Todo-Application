import { requireAuth } from "@/lib/auth/server";
import TodoList from "@/components/todos/todo-list";
import { fetchTodos } from "@/lib/supabase/todos";

export default async function TodosPage() {
  // Use the helper function to get authenticated user
  const { user } = await requireAuth();
  const todos = await fetchTodos(user.id);

  console.log("Fetched todos:", todos, user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Todo List</h1>
        <p className="text-muted-foreground">
          Manage your tasks and earn XP by completing them!
        </p>
      </div>

      <TodoList todos={todos} />
    </div>
  );
}
