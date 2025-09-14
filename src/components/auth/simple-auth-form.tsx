/**
 * Simplified Auth Component - Alternative approach without email confirmation
 */

"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3).optional(),
});

type FormData = z.infer<typeof schema>;

export default function SimpleAuthForm({ mode }: { mode: "login" | "signup" }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (mode === "login") {
        const { error, data: sessionData } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        
        if (error) throw error;
        
        // Direct redirect on successful login
        window.location.href = "/dashboard";
      } else {
        // Simplified signup without email confirmation
        const { error, data: signUpData } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              username: data.username,
            }
          }
        });
        
        if (error) throw error;
        
        // If email confirmation is disabled in Supabase, user will be immediately confirmed
        if (signUpData.user && signUpData.user.email_confirmed_at) {
          // User is immediately confirmed
          console.log("User immediately confirmed, creating profile...");
          
          const profileResponse = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: signUpData.user.id,
              username: data.username,
            }),
          });
          
          if (profileResponse.ok) {
            setSuccess("Account created successfully! Redirecting to dashboard...");
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 1500);
          } else {
            throw new Error("Failed to create profile");
          }
        } else {
          // Email confirmation required
          setSuccess("Account created! Please check your email and click the confirmation link to complete signup.");
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
            <span className="text-green-700">{success}</span>
          </Alert>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Loading..." : mode === "login" ? "Login" : "Sign Up"}
        </Button>
      </form>
    </Card>
  );
}
