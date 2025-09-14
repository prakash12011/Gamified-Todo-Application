"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmailVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailVerification = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (!token || !type) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        console.log('Handling email verification:', { token: token.substring(0, 20) + '...', type });
        
        // For signup verification, we'll handle it differently
        if (type === 'signup') {
          // Try to verify the email using the token
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (error) {
            console.error('Email verification error:', error);
            setStatus('error');
            setMessage(`Verification failed: ${error.message}. Please try signing up again.`);
            return;
          }

          if (data.user) {
            console.log('Email verification successful:', data.user.id);
            
            // Create profile after successful verification
            try {
              const profileResponse = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: data.user.id,
                  username: data.user.user_metadata?.username || data.user.email?.split('@')[0],
                }),
              });

              if (!profileResponse.ok) {
                console.error('Profile creation failed during verification');
              }
            } catch (profileError) {
              console.error('Profile creation error:', profileError);
            }

            setStatus('success');
            setMessage('Email verified successfully! Redirecting to dashboard...');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
            return;
          }
        }

        setStatus('error');
        setMessage('Verification failed. Please try signing up again.');
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
      }
    };

    handleEmailVerification();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <h2 className="text-xl font-semibold">Verifying your email...</h2>
              <p className="text-gray-600">Please wait while we confirm your account.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
              <h2 className="text-xl font-semibold text-green-700">Email Verified!</h2>
              <Alert variant="default" className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700">{message}</span>
              </Alert>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
              <h2 className="text-xl font-semibold text-red-700">Verification Failed</h2>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{message}</span>
              </Alert>
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/signup')} 
                  className="w-full"
                >
                  Try Signing Up Again
                </Button>
                <Button 
                  onClick={() => router.push('/login')} 
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
