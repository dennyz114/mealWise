# MW-001 — Login with Google — Technical Plan

## Context

The project is a fresh React 19 + TypeScript SPA with Vite, TanStack Router (file-based), TanStack Query, Supabase client, and Tailwind CSS v4. No components, hooks, types, or utilities exist yet. The Supabase client is initialized in `src/lib/supabase.ts` with env vars configured. The root route wraps everything in `QueryClientProvider`. The home page at `src/routes/index.tsx` currently shows a "Coming soon" placeholder.

This plan implements Google OAuth login via Supabase Auth, the login page UI (responsive), and post-login redirect with logout.

---

## Technical Details

### Backend / Supabase

#### Auth Configuration (manual — not in code)
- Enable Google OAuth provider in the Supabase dashboard under **Authentication → Providers → Google**
- Configure the Google Cloud Console OAuth client with the correct redirect URIs for the Supabase project

#### Profile Auto-Creation (Supabase Database Trigger)
The database schema defines a `profiles` table that extends `auth.users`. A trigger is needed to auto-create a profile row when a new user signs up:

```sql
-- Migration: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

#### Auth Helper Functions — `src/lib/auth.ts`
New file. Encapsulates all Supabase auth calls:

| Function | Signature | Description |
|---|---|---|
| `signInWithGoogle` | `() => Promise<{ error: AuthError \| null }>` | Calls `supabase.auth.signInWithOAuth({ provider: 'google' })`. Redirects to Google. |
| `signOut` | `() => Promise<{ error: AuthError \| null }>` | Calls `supabase.auth.signOut()`. |
| `getSession` | `() => Promise<Session \| null>` | Returns current session (for checking auth state). |

#### Auth State Hook — `src/hooks/useAuth.ts`
New file. Wraps Supabase auth state listener for React:

```ts
export function useAuth() {
  // Uses supabase.auth.onAuthStateChange to track session
  // Returns: { session, user, isLoading, isAuthenticated }
  // Stores session in TanStack Query cache for consistency
}
```

Uses `useQuery` with queryKey `['auth', 'session']` and a `staleTime` of 5 minutes to avoid excessive re-fetches. The `onAuthStateChange` listener invalidates this query on changes.

---

### Frontend

#### Route Structure

| Route | File | Description |
|---|---|---|
| `/login` | `src/routes/login.tsx` | Login page (public) |
| `/` | `src/routes/index.tsx` | Home page (protected — shows coming soon + logout) |

#### Root Route Changes — `src/routes/__root.tsx`
- Add a `<ThemeProvider>` wrapper (context for dark mode, but that's MW-002 — for now, just ensure the root renders cleanly)
- Auth redirect logic lives in individual routes via `beforeLoad`, not in root

#### Login Route — `src/routes/login.tsx`
- Uses `createFileRoute('/login')` 
- `beforeLoad`: If user is already authenticated, redirect to `/` (prevent seeing login page when logged in)
- Component renders the responsive login page

#### Login Page Component — `src/components/login/LoginPage.tsx`
Mobile-first responsive layout:

**Mobile (default):**
- Centered column layout
- App icon (Calendar icon from lucide-react)
- Title: "MealWise"
- Tagline: "From recipes to shopping list in minutes."
- "Continue with Google" button
- "what you get" section with 3 feature items (icon + short text)
- "Secured by Google OAuth 2.0" with Lock icon
- Terms / Privacy links

**Desktop (`md:` breakpoint):**
- Split layout: left panel (branding + features) / right panel (login form)
- Left panel: app icon, title, tagline, 3 feature items with longer descriptions
- Right panel: "Welcome back", "Sign in to your account", Google button, OAuth text, divider, Terms/Privacy

#### Google Button Component — `src/components/login/GoogleButton.tsx`
- Reusable button with Google "G" logo + "Continue with Google" text
- Accepts `onClick` handler and `isLoading` state
- Styled per mockup: dark border in light mode, lighter border in dark mode

#### Feature Highlight Component — `src/components/login/FeatureHighlight.tsx`
- Reusable row: icon + title + optional description
- Props: `icon: LucideIcon`, `title: string`, `description?: string`
- Used in both mobile (no description) and desktop (with description) layouts

#### Home Page Updates — `src/routes/index.tsx`
- Add `beforeLoad` guard: if no session, redirect to `/login`
- Add logout button that calls `signOut()` and redirects to `/login`
- Keep the "Coming soon" placeholder content

#### Footer Component — `src/components/Footer.tsx`
- Shared footer: "© 2026 MealWise"
- Used on login page

#### Types — `src/types/auth.ts`
```ts
export type AuthUser = {
  id: string
  email: string
  displayName: string
  avatarUrl: string
}
```

---

## File Plan

```
src/
├── lib/
│   ├── supabase.ts          (existing — no changes)
│   ├── auth.ts               (NEW — auth helper functions)
│   └── queryKeys.ts          (existing — add auth key)
├── hooks/
│   └── useAuth.ts            (NEW — auth state hook)
├── types/
│   └── auth.ts               (NEW — auth types)
├── components/
│   ├── login/
│   │   ├── LoginPage.tsx     (NEW — main login page layout)
│   │   ├── GoogleButton.tsx  (NEW — Google sign-in button)
│   │   └── FeatureHighlight.tsx (NEW — feature row component)
│   └── Footer.tsx            (NEW — shared footer)
├── routes/
│   ├── __root.tsx            (existing — minor: no changes needed yet)
│   ├── login.tsx             (NEW — login route)
│   └── index.tsx             (existing — add auth guard + logout)
```

---

## API Contracts

### Supabase Auth Calls (via `src/lib/auth.ts`)

```ts
// Sign in with Google OAuth — redirects browser to Google
signInWithGoogle(): Promise<{ error: AuthError | null }>

// Sign out — clears session
signOut(): Promise<{ error: AuthError | null }>

// Get current session
getSession(): Promise<Session | null>
```

### TanStack Query Keys (addition to `src/lib/queryKeys.ts`)

```ts
auth: {
  session: ['auth', 'session'] as const,
}
```

### Supabase Auth Listener

```ts
supabase.auth.onAuthStateChange((event, session) => {
  // event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | ...
  // Invalidate auth query on changes
})
```

---

## Essential Tests

### Frontend

| Test | File | Description |
|---|---|---|
| Login page renders | `LoginPage.test.tsx` | Renders title "MealWise", Google button, feature highlights |
| Login page mobile layout | `LoginPage.test.tsx` | At mobile viewport, shows short feature text, no descriptions |
| Login page desktop layout | `LoginPage.test.tsx` | At desktop viewport, shows split layout with full descriptions |
| Google button renders | `GoogleButton.test.tsx` | Shows Google icon and "Continue with Google" text |
| Google button click | `GoogleButton.test.tsx` | Calls `signInWithGoogle` on click |
| Auth redirect (logged in) | `login.test.tsx` | If session exists, redirects to `/` |
| Auth redirect (logged out) | `index.test.tsx` | If no session, redirects to `/login` |
| Logout button | `index.test.tsx` | Calls signOut and redirects to `/login` |
| Error display | `LoginPage.test.tsx` | Shows error message when auth fails |

### Backend / Integration

| Test | Description |
|---|---|
| Profile auto-creation | On first Google sign-in, a row is inserted into `profiles` with correct `id`, `display_name`, `avatar_url` |
| Session persistence | After sign-in, refreshing the page keeps the user authenticated |
| Sign out | After sign-out, session is cleared and user is redirected to login |
