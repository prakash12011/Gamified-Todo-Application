"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/server";
import { addTodoServer, updateTodoServer, deleteTodosServer } from "@/lib/supabase/todos-server";
import { applyTodoCompletionRewards } from "@/lib/supabase/gamification";
import { checkAndAwardAchievements } from "@/lib/supabase/achievements";
import { Todo, TodoDifficulty } from "@/types/todo";

export async function createTodoAction(formData: FormData) {
  const { user } = await requireAuth();
  
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const difficulty = formData.get("difficulty") as TodoDifficulty;
  const dueDate = formData.get("due_date") as string;
  const isRecurring = formData.get("is_recurring") === "true";
  const recurringType = formData.get("recurring_type") as "daily" | "weekly" | "monthly" | null;

  if (!title?.trim()) {
    throw new Error("Title is required");
  }

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

  try {
    await addTodoServer({
      title: title.trim(),
      description: description?.trim() || undefined,
      difficulty,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      is_recurring: isRecurring,
      recurring_type: recurringType,
      user_id: user.id,
      xp_reward: difficultyXPMap[difficulty],
      coin_reward: difficultyCoinMap[difficulty],
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    revalidatePath("/dashboard/todos");
  } catch (error) {
    console.error("Error creating todo:", error);
    throw new Error("Failed to create todo");
  }
}

export async function updateTodoAction(todoId: string, formData: FormData) {
  const { user } = await requireAuth();
  
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const difficulty = formData.get("difficulty") as TodoDifficulty;
  const dueDate = formData.get("due_date") as string;
  const isRecurring = formData.get("is_recurring") === "true";
  const recurringType = formData.get("recurring_type") as "daily" | "weekly" | "monthly" | null;

  if (!title?.trim()) {
    throw new Error("Title is required");
  }

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

  try {
    await updateTodoServer(todoId, {
      title: title.trim(),
      description: description?.trim() || undefined,
      difficulty,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      is_recurring: isRecurring,
      recurring_type: recurringType,
      xp_reward: difficultyXPMap[difficulty],
      coin_reward: difficultyCoinMap[difficulty],
      updated_at: new Date().toISOString(),
    });

    revalidatePath("/dashboard/todos");
  } catch (error) {
    console.error("Error updating todo:", error);
    throw new Error("Failed to update todo");
  }
}

export async function completeTodoAction(todoId: string) {
  const { user } = await requireAuth();

  try {
    // First get the current todo to check details
    const updatedTodo = await updateTodoServer(todoId, {
      completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Apply gamification rewards
    const now = new Date();
    const onTime = updatedTodo.due_date ? now <= new Date(updatedTodo.due_date) : true;
    
    await applyTodoCompletionRewards({
      userId: user.id,
      todoId: todoId,
      difficulty: updatedTodo.difficulty,
      onTime,
    });

    await checkAndAwardAchievements(user.id);

    revalidatePath("/dashboard/todos");
    revalidatePath("/dashboard"); // Also revalidate dashboard for stats update
  } catch (error) {
    console.error("Error completing todo:", error);
    throw new Error("Failed to complete todo");
  }
}

export async function deleteTodosAction(todoIds: string[]) {
  await requireAuth();

  try {
    await deleteTodosServer(todoIds);
    revalidatePath("/dashboard/todos");
  } catch (error) {
    console.error("Error deleting todos:", error);
    throw new Error("Failed to delete todos");
  }
}
