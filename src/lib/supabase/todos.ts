import { createClient } from './client';
import { Todo } from '@/types/todo';

const supabase = createClient();

// Enhanced session check with error handling
async function ensureValidSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session check error:', error);
      
      // Handle refresh token errors
      if (error.message.includes('refresh_token_not_found') || 
          error.message.includes('Invalid Refresh Token')) {
        console.log('Invalid session detected, signing out');
        await supabase.auth.signOut();
        throw new Error('Session expired. Please log in again.');
      }
      throw error;
    }
    
    if (!session?.user) {
      throw new Error('No active session. Please log in.');
    }
    
    return session.user.id;
  } catch (error) {
    console.error('Session validation failed:', error);
    throw error;
  }
}

export async function fetchTodos(userId?: string): Promise<Todo[]> {
  try {
    const currentUserId = userId || await ensureValidSession();
    
    console.log('Fetching todos for user:', currentUserId);

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', currentUserId)
      .order('due_date', { ascending: true });

    console.log("fetchTodos - data:", data, "error:", error, "userId:", currentUserId);
    
    if (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
    return data as Todo[];
  } catch (error) {
    console.error('fetchTodos failed:', error);
    throw error;
  }
}

export async function addTodo(todo: Partial<Todo>): Promise<Todo> {
  try {
    const userId = await ensureValidSession();
    
    console.log('Adding todo for user:', userId, 'Data:', todo);

    const { data, error } = await supabase
      .from('todos')
      .insert([{ ...todo, user_id: userId }])
      .select()
      .single();
      
    console.log("addTodo - data:", data, "error:", error);
    
    if (error) {
      console.error('Error adding todo:', error);
      throw error;
    }
    return data as Todo;
  } catch (error) {
    console.error('addTodo failed:', error);
    throw error;
  }
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
  try {
    const userId = await ensureValidSession();

    console.log('updateTodo - attempting to update:', { id, updates, userId });

    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
      
    console.log("updateTodo - data:", data, "error:", error);
    
    if (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from update operation');
    }
    
    return data as Todo;
  } catch (error) {
    console.error('updateTodo failed:', error);
    throw error;
  }
}

export async function deleteTodos(ids: string[]): Promise<void> {
  try {
    const userId = await ensureValidSession();

    console.log('deleteTodos - attempting to delete:', ids, 'for user:', userId);

    const { error } = await supabase
      .from('todos')
      .delete()
      .in('id', ids)
      .eq('user_id', userId);
      
    console.log("deleteTodos - error:", error);
    
    if (error) {
      console.error('Error deleting todos:', error);
      throw error;
    }
  } catch (error) {
    console.error('deleteTodos failed:', error);
    throw error;
  }
}

// Test function for debugging auth and todo operations
export async function testTodoOperations() {
  try {
    console.log('Starting todo operations test...');
    
    // Test session
    const userId = await ensureValidSession();
    console.log('✓ Session valid for user:', userId);
    
    // Test fetch
    const todos = await fetchTodos();
    console.log('✓ Fetch todos successful:', todos.length, 'todos');
    
    if (todos.length > 0) {
      // Test update on first todo
      const firstTodo = todos[0];
      const updated = await updateTodo(firstTodo.id, { 
        title: firstTodo.title + ' (tested)' 
      });
      console.log('✓ Update todo successful:', updated.title);
    }
    
    return {
      success: true,
      userId,
      todoCount: todos.length,
      message: 'All todo operations working'
    };
  } catch (error) {
    console.error('Todo operations test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Todo operations test failed'
    };
  }
}