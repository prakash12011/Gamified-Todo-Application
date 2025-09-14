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
      // First check if there are error parameters in the URL
      const error = searchParams.get('error');
      const errorCode = searchParams.get('error_code');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        console.error('Email verification error from URL:', { error, errorCode, errorDescription });
        setStatus('error');
        
        if (errorCode === 'otp_expired') {
          setMessage('Your verification link has expired. Please sign up again to receive a new verification email.');
        } else if (error === 'access_denied') {
          setMessage('Email verification was denied or the link is invalid. Please try signing up again.');
        } else {
          setMessage(`Verification failed: ${errorDescription || error}. Please try signing up again.`);
        }
        return;
      }

      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (!token || !type) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        console.log('Handling email verification:', { token: token.substring(0, 20) + '...', type });
        
        // For PKCE flow, we need to exchange the code for a session
        if (token.startsWith('pkce_')) {
          console.log('Handling PKCE verification flow');
          
          // Try to handle session from URL using built-in Supabase method
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('PKCE session error:', error);
            setStatus('error');
            setMessage(`Verification failed: ${error.message}. The verification link may have expired. Please try signing up again.`);
            return;
          }

          // If we have a session, the verification was successful
          if (data.session?.user) {
            console.log('PKCE verification successful:', data.session.user.id);
            
            // Create profile
            try {
              const profileResponse = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: data.session.user.id,
                  username: data.session.user.user_metadata?.username || data.session.user.email?.split('@')[0],
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
            
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
            return;
          }
          
          // If no session, try to trigger the auth flow
          console.log('No session found, checking for auth state change');
          setStatus('error');
          setMessage('Unable to complete verification. Please try signing up again.');
          return;
        }
        
        // For non-PKCE tokens (legacy OTP flow)
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          console.error('OTP verification error:', error);
          setStatus('error');
          setMessage(`Verification failed: ${error.message}. Please try signing up again.`);
          return;
        }

        if (data.user) {
          console.log('OTP verification successful:', data.user.id);
          
          // Create profile
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
          
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
          return;
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
