import { createServerSupabaseClient } from './server';
import { Todo } from '@/types/todo';

export async function fetchTodosServer(userId: string): Promise<Todo[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
  
  return data as Todo[];
}

export async function updateTodoServer(id: string, updates: Partial<Todo>): Promise<Todo> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
  
  return data as Todo;
}

export async function deleteTodosServer(ids: string[]): Promise<void> {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('todos')
    .delete()
    .in('id', ids);
    
  if (error) {
    console.error('Error deleting todos:', error);
    throw error;
  }
}

export async function addTodoServer(todo: Partial<Todo>): Promise<Todo> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('todos')
    .insert([todo])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
  
  return data as Todo;
}
