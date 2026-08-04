"use client";
import { useState, useEffect, useActionState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/login/actions";

export default function SimpleAuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();

  // ── Login (server action) ──────────────────────────────────────────────────
  const [loginState, loginFormAction, isPending] = useActionState(loginAction, { error: null });

  // ── Signup (client-side, kept as-is) ──────────────────────────────────────
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [signupData, setSignupData] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      if (countdown === 0) autoLoginAndRedirect();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const autoLoginAndRedirect = async () => {
    try {
      if (signupData) {
        const { error, data: sessionData } = await supabase.auth.signInWithPassword(signupData);
        if (error) {
          if (error.message.includes('Email not confirmed') || error.message.includes('confirm')) {
            setSignupError('Account created but email confirmation is required. Please check your Supabase settings to disable email confirmation for immediate access.');
            return;
          }
          router.push('/login');
          return;
        }
        if (sessionData.user) {
          try {
            await supabase.from('profiles').upsert({
              user_id: sessionData.user.id,
              username: sessionData.user.user_metadata?.username || sessionData.user.email?.split('@')[0],
              level: 1,
              xp: 0,
              coins: 100,
              streak_count: 0,
              last_activity_date: new Date().toISOString(),
            }, { onConflict: 'user_id' });
          } catch {
            // profile creation failure is non-fatal
          }
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      } else {
        const { data } = await supabase.auth.getSession();
        router.push(data.session?.user ? '/dashboard' : '/login');
      }
    } catch {
      router.push('/login');
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const username = (form.elements.namedItem('username') as HTMLInputElement)?.value;

    setSignupLoading(true);
    setSignupError(null);
    setSuccess(null);

    try {
      const { error, data: signUpData } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        }
        throw new Error(error.message || 'Signup failed. Please try again.');
      }

      setSignupData({ email, password });
      setSuccess("Account created successfully! Welcome to your gamified todo app!");
      setCountdown(5);
    } catch (e: unknown) {
      setSignupError(e instanceof Error ? e.message : 'Signup failed.');
    } finally {
      setSignupLoading(false);
    }
  };

  // ── Login UI ───────────────────────────────────────────────────────────────
  if (mode === "login") {
    return (
      <Card className="max-w-md mx-auto mt-12 p-6">
        <form action={loginFormAction} className="space-y-4">
          <Input name="email" placeholder="Email" type="email" required autoComplete="email" />
          <Input name="password" placeholder="Password" type="password" required autoComplete="current-password" />
          {loginState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{loginState.error}</span>
            </Alert>
          )}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Signing in..." : "Login"}
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
              <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing'}</div>
              <div>Auth Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}</div>
            </div>
          )}
        </form>
      </Card>
    );
  }

  // ── Signup UI ──────────────────────────────────────────────────────────────
  return (
    <Card className="max-w-md mx-auto mt-12 p-6">
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <Input name="username" placeholder="Username" minLength={3} required />
        </div>
        <div>
          <Input name="email" placeholder="Email" type="email" required />
        </div>
        <div>
          <Input name="password" placeholder="Password" type="password" minLength={6} required />
        </div>
        {signupError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{signupError}</span>
          </Alert>
        )}
        {success && (
          <Alert variant="default" className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="text-green-700">
              <span>{success}</span>
              {countdown !== null && (
                <div className="mt-2 text-sm">Redirecting to dashboard in {countdown} seconds...</div>
              )}
            </div>
          </Alert>
        )}
        <Button type="submit" disabled={signupLoading || countdown !== null} className="w-full">
          {signupLoading ? "Loading..." : countdown !== null ? `Redirecting in ${countdown}s...` : "Sign Up"}
        </Button>
      </form>
    </Card>
  );
}
