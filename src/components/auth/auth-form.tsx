"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { PWAInstallButton } from "@/components/pwa/pwa-install-button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthCallbackUrl, getBaseUrl } from "@/lib/config";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3).optional(),
});

type FormData = z.infer<typeof schema>;

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Test Supabase connection on component mount
  useEffect(() => {
    console.log("Supabase client:", supabase);
    console.log("Environment variables:", {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "..."
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted with data:", data);
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (mode === "login") {
        console.log("Attempting login...");
        const { error, data: sessionData } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        console.log("Login successful, session:", sessionData);
        
        // Use window.location.href to trigger a server-side request
        // This ensures middleware picks up the new session
        window.location.href = "/dashboard";
      } else {
        console.log("Attempting signup...");
        
        // Get the auth callback URL using our utility
        const redirectUrl = getAuthCallbackUrl();
        
        console.log("Using redirect URL:", redirectUrl);
        console.log("Base URL:", getBaseUrl());
        
        const { error, data: signUpData } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              username: data.username,
            }
          }
        });
        
        if (error) throw error;
        
        console.log("Signup successful:", signUpData);
        
        // Check if email confirmation is required
        if (signUpData.user && !signUpData.user.email_confirmed_at) {
          setSuccess("Account created! Please check your email and click the confirmation link to complete signup.");
          return;
        }
        
        // If user is immediately confirmed (like in dev mode)
        if (signUpData.user?.id) {
          console.log("Creating profile...");
          const profileResponse = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: signUpData.user.id,
              username: data.username,
            }),
          });
          
          const profileResult = await profileResponse.json();
          if (!profileResponse.ok) {
            console.error("Profile creation failed:", profileResult);
            throw new Error(profileResult.error || "Failed to create profile");
          }
          
          console.log("Profile created successfully:", profileResult);
          
          // Redirect to dashboard
          window.location.href = "/dashboard";
        }
      }
    } catch (e: any) {
      console.error("Auth error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-12 p-6">
      <form 
        onSubmit={(e) => {
          console.log("Form onSubmit triggered");
          handleSubmit(onSubmit)(e);
        }} 
        className="space-y-4"
      >
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
            <AlertCircle className="h-6 w-6" />
            <span className="leading-relaxed break-words">{error}</span>
          </Alert>
        )}
        {success && (
          <Alert variant="success">
            <CheckCircle className="h-6 w-6" />
            <span className="leading-relaxed break-words">{success}</span>
          </Alert>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Loading..." : mode === "login" ? "Login" : "Sign Up"}
        </Button>
        {/* DISABLING THE SOCIAL LOGINS FOR NOW AS THESE ARE NOT WORKING */}
        {/* <Button type="button" variant="outline" className="w-full" onClick={async () => {
          setLoading(true);
          setError(null);
          const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
          if (error) setError(error.message);
          setLoading(false);
        }}>
          Continue with Google
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={async () => {
          setLoading(true);
          setError(null);
          const { error } = await supabase.auth.signInWithOAuth({ provider: "github" });
          if (error) setError(error.message);
          setLoading(false);
        }}>
          Continue with GitHub
        </Button> */}
        <PWAInstallButton />
      </form>
    </Card>
  );
}
