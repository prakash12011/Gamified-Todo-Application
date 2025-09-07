# Server-Side Authentication Helpers

This file contains examples of how to use the server-side authentication helpers in your pages.

## Helper Functions Available

### 1. `requireAuth()` - For Protected Pages
Use this when the page MUST have an authenticated user. It automatically redirects to login if not authenticated.

```tsx
import { requireAuth } from '@/lib/auth/server';

export default async function ProtectedPage() {
  const { user, supabase } = await requireAuth();
  
  // user is guaranteed to exist here
  // supabase is ready to use with proper cookies
  
  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      {/* Your protected content */}
    </div>
  );
}
```

### 2. `getCurrentUser()` - For Optional Auth Pages
Use this when authentication is optional (like a homepage that shows different content for logged-in users).

```tsx
import { getCurrentUser } from '@/lib/auth/server';

export default async function HomePage() {
  const { user, supabase } = await getCurrentUser();
  
  if (user) {
    // Show logged-in user content
    return <div>Welcome back, {user.email}!</div>;
  } else {
    // Show public content
    return <div>Welcome! Please log in.</div>;
  }
}
```

### 3. `createAuthenticatedSupabaseClient()` - For Custom Logic
Use this when you need the Supabase client but want to handle authentication manually.

```tsx
import { createAuthenticatedSupabaseClient } from '@/lib/auth/server';

export default async function CustomPage() {
  const supabase = await createAuthenticatedSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Your custom authentication logic here
  
  return <div>Custom content</div>;
}
```

## Benefits

✅ **No more boilerplate** - No need to write the same Supabase setup code repeatedly
✅ **Consistent error handling** - All pages handle authentication the same way  
✅ **Better maintainability** - Changes to auth logic only need to be made in one place
✅ **Type safety** - Full TypeScript support with proper types
✅ **Performance** - Server-side rendering with proper cookie handling

## Migration Guide

### Before (Old way):
```tsx
export default async function MyPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // ... 15 lines of boilerplate ...
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  // Your page logic...
}
```

### After (New way):
```tsx
import { requireAuth } from '@/lib/auth/server';

export default async function MyPage() {
  const { user, supabase } = await requireAuth();
  // Your page logic...
}
```

**22 lines reduced to 3 lines!** 🎉
