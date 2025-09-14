/**
 * Simplified Auth Component - Alternative approach without email confirmation
 */

"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

export default function SimpleAuthForm({ mode }: { mode: "login" | "signup" }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [signupData, setSignupData] = useState<any>(null); // Store signup data for auto-login
  const router = useRouter();

  // Dynamic schema based on mode
  const schema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    username: mode === "signup" ? z.string().min(3, "Username must be at least 3 characters") : z.string().optional(),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Countdown effect for redirect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Auto-login the user and redirect to dashboard
      autoLoginAndRedirect();
    }
  }, [countdown, router]);

  const autoLoginAndRedirect = async () => {
    try {
      if (signupData?.email && signupData?.password) {
        const { error, data: sessionData } = await supabase.auth.signInWithPassword({
          email: signupData.email,
          password: signupData.password,
        });
        
        if (error) {
          if (error.message.includes('Email not confirmed') || error.message.includes('confirm')) {
            setError('Account created but email confirmation is required. Please check your Supabase settings to disable email confirmation for immediate access.');
            return;
          }
          
          router.push('/login');
          return;
        }
        
        if (sessionData.user) {
          // Create profile directly using Supabase client (fallback approach)
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                user_id: sessionData.user.id,
                username: sessionData.user.user_metadata?.username || sessionData.user.email?.split('@')[0],
                level: 1,
                xp: 0,
                coins: 100,
                streak_count: 0,
                last_activity_date: new Date().toISOString(),
              }, {
                onConflict: 'user_id'
              });
              
            if (profileError) {
              console.warn('Profile creation warning:', profileError);
            }
          } catch (directProfileError) {
            console.warn('Profile creation failed (continuing anyway):', directProfileError);
          }
          
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } else {
        // Fallback: check if user is already logged in
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session?.user) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      router.push('/login');
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (mode === "login") {
        // Clear any existing sessions first
        await supabase.auth.signOut();
        
        const { error, data: sessionData } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        
        if (error) {
          // Provide more specific error messages
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('Please confirm your email address before logging in. Check your inbox for a confirmation email.');
          } else if (error.message.includes('Too many requests')) {
            throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
          } else {
            throw new Error(error.message || 'Login failed. Please try again.');
          }
        }
        
        // Check if session was created properly
        if (!sessionData.session) {
          throw new Error('Login successful but no session created. Please try again.');
        }
        
        // Verify the session is properly stored
        const { data: verifySession } = await supabase.auth.getSession();
        
        if (!verifySession.session) {
          throw new Error('Session was not properly stored. Please try logging in again.');
        }
        
        setSuccess("Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        const { error, data: signUpData } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              username: data.username,
            }
          }
        });
        
        if (error) {
          // Provide more specific error messages for signup
          if (error.message.includes('User already registered')) {
            throw new Error('An account with this email already exists. Please try logging in instead.');
          } else if (error.message.includes('Password should be at least')) {
            throw new Error('Password must be at least 6 characters long.');
          } else {
            throw new Error(error.message || 'Signup failed. Please try again.');
          }
        }
        
        // Store signup data for auto-login
        setSignupData({ email: data.email, password: data.password });
        
        setSuccess("Account created successfully! Welcome to your gamified todo app!");
        setCountdown(5);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-12 p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mode === "signup" && (
          <div>
            <Input placeholder="Username" {...register("username")} />
            {errors.username && (
              <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>
            )}
          </div>
        )}
        <div>
          <Input placeholder="Email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <Input placeholder="Password" type="password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </Alert>
        )}
        {success && (
          <Alert variant="default" className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="text-green-700">
              <span>{success}</span>
              {countdown !== null && (
                <div className="mt-2 text-sm">
                  Redirecting to dashboard in {countdown} seconds...
                </div>
              )}
            </div>
          </Alert>
        )}
        <Button type="submit" disabled={loading || countdown !== null} className="w-full">
          {loading ? "Loading..." : countdown !== null ? `Redirecting in ${countdown}s...` : mode === "login" ? "Login" : "Sign Up"}
        </Button>
        
        {/* Development debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
            <div>Mode: {mode}</div>
            <div>Form Errors: {Object.keys(errors).length}</div>
            <div>Loading: {loading.toString()}</div>
            <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing'}</div>
            <div>Auth Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}</div>
          </div>
        )}
      </form>
    </Card>
  );
}
