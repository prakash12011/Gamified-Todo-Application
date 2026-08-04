'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface LoginState {
  error: string | null
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Invalid email or password. Please check your credentials and try again.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Please confirm your email address before logging in. Check your inbox for a confirmation email.' }
    }
    if (error.message.includes('Too many requests')) {
      return { error: 'Too many login attempts. Please wait a few minutes before trying again.' }
    }
    return { error: error.message || 'Login failed. Please try again.' }
  }

  redirect('/dashboard')
}
