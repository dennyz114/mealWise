# MW-001 — Login with Google

## Description
The login feature allows users to authenticate using their Google account via Supabase Auth (Google OAuth 2.0). The login page serves as the entry point to the application, displaying branding, key feature highlights, and the authentication action. Upon successful login, the user is redirected to the home page.

## Requirements

### Authentication
- User can sign in using "Continue with Google" button via Supabase Auth (Google OAuth 2.0)
- On first login, a user profile is automatically created in the `profiles` table
- Session persists across browser refreshes
- On authentication error or user cancellation, display an error message on the login page

### Post-Login
- After successful login, redirect to the home page (currently shows a "coming soon" component)
- The home page must include a logout button

### Login Page Layout (Desktop)
- Split layout: left side (branding) and right side (login form)
- Left side contains:
  - App icon (calendar icon)
  - Title: "MealWise"
  - Tagline: "From recipes to shopping list in minutes."
  - Three feature highlights with icons:
    - "Recipe library — Save meals with every ingredient"
    - "Weekly planner — Assign meals, plan weeks ahead"
    - "Smart shopping list — Grouped by category, check as you go"
- Right side contains:
  - Header: "Welcome back"
  - Subtitle: "Sign in to your account"
  - "Continue with Google" button with Google icon
  - "Secured by Google OAuth 2.0" text with lock icon
  - Divider
  - "Terms of Service · Privacy Policy" links (placeholders)

### Login Page Layout (Mobile)
- Single column, centered layout
- Contains:
  - App icon (calendar icon)
  - Title: "MealWise"
  - Tagline: "From recipes to shopping list in minutes."
  - "Continue with Google" button with Google icon
  - "what you get" label
  - Three feature highlights with icons (shorter copy):
    - "Recipe library"
    - "Weekly planner"
    - "Smart shopping list"
  - "Secured by Google OAuth 2.0" text with lock icon
  - "By continuing you agree to our Terms · Privacy Policy" links (placeholders)

### Footer
- Copyright text: "© 2026 MealWise"

### Terms & Privacy
- "Terms of Service" and "Privacy Policy" links are placeholders for now (no actual pages required)
