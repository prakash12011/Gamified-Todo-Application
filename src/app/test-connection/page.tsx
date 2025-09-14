"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { redirect } from 'next/navigation';

// Only available in development or when debug pages are enabled
if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_ENABLE_DEBUG_PAGES !== 'true') {
  redirect('/dashboard');
}

export default function TestConnectionPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults: any = {};

    // Test 1: Environment variables
    testResults.envVars = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
    };

    // Test 2: Basic connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      testResults.connection = {
        success: !error,
        error: error?.message,
        data: data,
      };
    } catch (err: any) {
      testResults.connection = {
        success: false,
        error: err.message,
      };
    }

    // Test 3: Auth status
    try {
      const { data: session, error } = await supabase.auth.getSession();
      testResults.authStatus = {
        hasSession: !!session.session,
        user: session.session?.user?.email,
        error: error?.message,
      };
    } catch (err: any) {
      testResults.authStatus = {
        error: err.message,
      };
    }

    // Test 4: Storage test
    testResults.storage = {
      localStorage: typeof window !== 'undefined' && !!window.localStorage,
      authToken: typeof window !== 'undefined' ? localStorage.getItem('sb-hqsfhnmpknusoffnjcnv-auth-token') : null,
      oldToken: typeof window !== 'undefined' ? localStorage.getItem('supabase.auth.token') : null,
    };

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <Alert className="mb-4">
        <span>⚠️ Development Tool - This page is only available in development mode</span>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTests} disabled={loading}>
            {loading ? 'Running Tests...' : 'Run Connection Tests'}
          </Button>
          
          {Object.keys(results).length > 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Environment Variables</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(results.envVars, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold">Database Connection</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(results.connection, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold">Auth Status</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(results.authStatus, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold">Storage</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(results.storage, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
