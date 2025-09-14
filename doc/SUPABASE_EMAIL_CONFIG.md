/**
 * Instructions for Supabase Configuration
 * 
 * The PKCE email verification flow can be complex. Here are the recommended 
 * Supabase settings to resolve the verification issues:
 */

## Option 1: Disable Email Confirmation (Simplest)

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Settings
3. Find "Enable email confirmations"
4. **Turn OFF** email confirmations
5. Save changes

This allows users to sign up without email verification, which is simpler for development.

## Option 2: Configure Proper Email Settings

If you want to keep email confirmations:

1. **Site URL**: `https://gamified-todo-application.vercel.app`

2. **Redirect URLs**:
   - `https://gamified-todo-application.vercel.app/auth/callback`
   - `https://gamified-todo-application-*.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`

3. **Email Templates** (Authentication > Email Templates):
   - Make sure the "Confirm signup" template uses: `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup&next={{ .RedirectTo }}`

4. **SMTP Settings** (optional but recommended):
   - Configure custom SMTP instead of using Supabase's default

## Option 3: Use Magic Links Instead

Consider switching to magic link authentication instead of password-based signup:
- More secure
- No email confirmation needed
- Better user experience

## Current Issue Analysis

The error `otp_expired` suggests:
1. Email verification links expire too quickly
2. PKCE code verifiers don't persist properly across page loads
3. URL parameters get malformed during redirect

**Recommended immediate fix**: Disable email confirmations temporarily while testing other features.
