import { supabase } from './client';
import { Todo } from '@/types/todo';

export async function fetchTodos(userId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

    console.log("data", data, error, userId);
    
  if (error) throw error;
  return data as Todo[];
}

export async function addTodo(todo: Partial<Todo>): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .insert([todo])
    .select()
    .single();
  if (error) throw error;
  return data as Todo;
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Todo;
}

export async function deleteTodos(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from('todos')
    .delete()
    .in('id', ids);
  if (error) throw error;
}
