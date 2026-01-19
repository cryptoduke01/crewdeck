# Fix: Signup RLS Error

If you're getting "new row violates row-level security policy" during signup, here's the fix:

## Problem

When email confirmation is **enabled** in Supabase, users aren't authenticated immediately after signup. This means `auth.uid()` returns `null` during the signup process, so RLS policies that check `user_id = auth.uid()` fail.

## Solutions

### Option 1: Disable Email Confirmation (Quick Fix for Development)

1. Go to Supabase Dashboard → **Authentication** → **Settings**
2. Find **"Enable email confirmations"**
3. **Disable** it (toggle it off)
4. Run the SQL from `sql/fix-signup-rls-complete.sql`
5. Try signing up again

### Option 2: Use Database Trigger (Production-Ready)

This automatically creates agency records when users sign up, even with email confirmation enabled:

1. Update your signup code to include agency name in user metadata:
   ```typescript
   await supabase.auth.signUp({
     email,
     password,
     options: {
       data: {
         agency_name: agencyName,
         agency_slug: agencyName.toLowerCase().replace(/\s+/g, "-"),
       }
     }
   });
   ```

2. Run the SQL from `sql/create-agency-trigger.sql` in Supabase SQL Editor

3. Remove the manual agency insert from `lib/auth/context.tsx` (since the trigger handles it)

### Option 3: Create Agency After Email Confirmation

Create the agency record after the user confirms their email (in a callback or redirect handler).

## Recommended: Option 1 for Development

For development/testing, **disable email confirmation** and use Option 1. It's the simplest and fastest solution.

For production, use **Option 2** (database trigger) as it's more robust.
