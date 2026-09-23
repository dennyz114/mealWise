# Auth / Login

## Current behavior
- Primary auth is **email + password** (Supabase Auth). Google OAuth was removed from the login UI.
- **Register**: email, first name, last name, password, confirm password.
- On success: show success message and return to **login** (no auto-enter app). Any auto-session from signup is cleared.
- **Login**: email + password → session → redirect into the app.
- Profile auto-created on signup (`profiles` via DB trigger); `display_name` from first + last name metadata.
- Session persists across refresh; unauthenticated users cannot reach `_authenticated` routes.
- Sign out is available from the profile menu.

## UI
- Same branded login shell: desktop split (branding | form), mobile stacked.
- Toggle between Sign in ↔ Create account on the same page.
- Terms / Privacy links remain placeholders.

## Related
- Code: `src/components/login/`, `src/lib/auth.ts`
- Schema: `auth.users`, `profiles` in `docs/DATABASE.md`
