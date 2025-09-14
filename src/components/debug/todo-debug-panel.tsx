"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase, checkAuthStatus } from "@/lib/supabase/client";
import { updateTodo, fetchTodos } from "@/lib/supabase/todos";
import { useAuth } from "@/hooks/use-auth";

export function TodoDebugPanel() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAuthStatus = async () => {
    try {
      const { session, error } = await checkAuthStatus();
      setDebugInfo({ session, error, user });
      addTestResult(`Auth check - Session: ${session ? 'Valid' : 'None'}, Error: ${error || 'None'}`);
    } catch (error) {
      addTestResult(`Auth check failed: ${error}`);
    }
  };

  const testFetchTodos = async () => {
    if (!user) {
      addTestResult('No user - cannot fetch todos');
      return;
    }
    
    try {
      const todos = await fetchTodos(user.id);
      addTestResult(`Fetch todos success: ${todos.length} todos found`);
    } catch (error) {
      addTestResult(`Fetch todos failed: ${error}`);
    }
  };

  const testDirectSupabaseCall = async () => {
    if (!user) {
      addTestResult('No user - cannot test direct call');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);
        
      addTestResult(`Direct Supabase call - Data: ${data?.length || 0} rows, Error: ${error || 'None'}`);
    } catch (error) {
      addTestResult(`Direct Supabase call failed: ${error}`);
    }
  };

  const testUpdateTodo = async () => {
    if (!user) {
      addTestResult('No user - cannot test update');
      return;
    }

    try {
      // First fetch a todo to update
      const todos = await fetchTodos(user.id);
      if (todos.length === 0) {
        addTestResult('No todos to update - create one first');
        return;
      }

      const todoToUpdate = todos[0];
      const result = await updateTodo(todoToUpdate.id, { 
        title: `Updated at ${new Date().toISOString()}` 
      });
      
      addTestResult(`Update todo success: ${result.id}`);
    } catch (error) {
      addTestResult(`Update todo failed: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setDebugInfo(null);
  };

  return (
    <Card className="p-6 m-4">
      <h2 className="text-xl font-bold mb-4">Todo Debug Panel</h2>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={testAuthStatus} size="sm">Test Auth Status</Button>
          <Button onClick={testFetchTodos} size="sm">Test Fetch Todos</Button>
          <Button onClick={testDirectSupabaseCall} size="sm">Test Direct Supabase</Button>
          <Button onClick={testUpdateTodo} size="sm">Test Update Todo</Button>
          <Button onClick={clearResults} variant="outline" size="sm">Clear Results</Button>
        </div>

        {debugInfo && (
          <div className="bg-gray-100 p-4 rounded text-xs">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="bg-gray-50 p-4 rounded max-h-60 overflow-y-auto">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            {testResults.map((result, index) => (
              <div key={index} className="text-sm mb-1 font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
