"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';

// Only available in development or when debug pages are enabled
if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_ENABLE_DEBUG_PAGES !== 'true') {
  redirect('/dashboard');
}

export default function ClearAuthPage() {
  const [cleared, setCleared] = useState(false);

  const clearAuthData = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear all possible auth-related local storage keys
      if (typeof window !== 'undefined') {
        const keysToRemove = [
          'sb-hqsfhnmpknusoffnjcnv-auth-token',
          'supabase.auth.token',
          'sb-auth-token',
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Clear all session storage as well
        sessionStorage.clear();
      }
      
      setCleared(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  useEffect(() => {
    // Auto-clear on page load
    clearAuthData();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Development Auth Reset Tool</CardTitle>
        </CardHeader>
        <CardContent>
          {cleared ? (
            <div className="text-green-600">
              ✅ Authentication data cleared successfully! Redirecting to login...
            </div>
          ) : (
            <div>Clearing authentication data...</div>
          )}
          
          <Button 
            onClick={clearAuthData} 
            className="mt-4"
            variant="outline"
          >
            Clear Auth Data Manually
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
