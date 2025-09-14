"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmailVerifyPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect away from this problematic verification flow
    const timer = setTimeout(() => {
      router.push('/signup?message=Email verification is temporarily disabled. You can sign up directly without email confirmation.');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="max-w-md w-full p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 mx-auto text-orange-500" />
          <h2 className="text-xl font-semibold text-orange-700">Email Verification Temporarily Disabled</h2>
          <Alert variant="default" className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <div className="text-orange-700">
              <p className="font-medium mb-2">We've simplified the signup process!</p>
              <p className="text-sm">You can now create an account without email verification. You'll be redirected to the signup page automatically.</p>
            </div>
          </Alert>
          <div className="space-y-2">
            <Button 
              onClick={() => router.push('/signup')} 
              className="w-full"
            >
              Go to Signup Now
            </Button>
            <Button 
              onClick={() => router.push('/login')} 
              variant="outline"
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
