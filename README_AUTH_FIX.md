# Fix: "User already registered" Error

## Problem

When you delete users from the `agencies` table in Supabase, the auth users still exist in the `auth.users` table. Supabase Auth and your database tables are separate.

## Solution

You need to delete users from **Supabase Auth**, not just the database tables.

### Option 1: Delete from Supabase Dashboard (Easiest)

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find the user you want to delete
3. Click the **three dots** (⋯) → **Delete user**
4. Confirm deletion

### Option 2: Delete via SQL (For Development)

**⚠️ WARNING: This deletes ALL auth users. Use with caution!**

Run this in Supabase SQL Editor:

```sql
-- Delete all auth users
DELETE FROM auth.users;

-- Or delete a specific user by email:
-- DELETE FROM auth.users WHERE email = 'user@example.com';
```

### Option 3: Use the SQL File

I've created `sql/delete-auth-users.sql` with instructions. Run it in Supabase SQL Editor.

## After Deleting Auth Users

After deleting auth users, you may also want to clean up related data:

```sql
DELETE FROM agencies;
DELETE FROM messages;
DELETE FROM reviews;
DELETE FROM portfolio;
DELETE FROM services;
```

## Why This Happens

- **Supabase Auth** (`auth.users`) - Stores authentication data
- **Your Database** (`agencies`, `messages`, etc.) - Stores application data

These are separate! Deleting from one doesn't delete from the other.
