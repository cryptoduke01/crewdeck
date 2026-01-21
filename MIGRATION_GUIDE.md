# Migration Guide: Agencies → Profiles + KOL Support

This guide documents the migration from agency-only to agency + KOL profiles.

## ✅ Completed

1. **Database Schema**
   - Created SQL migration: `sql/migrate-to-profiles.sql`
   - Updated Prisma schema: `prisma/schema.prisma`
   - Created profile trigger: `sql/create-profile-trigger.sql`

2. **Payment Removal**
   - Removed all Stripe payment routes
   - Removed Solana payment routes  
   - Removed pricing/upgrade pages
   - Removed plan selection flow

3. **Profile Type Support**
   - Created `ProfileTypeSelector` component
   - Updated signup flow to include profile type
   - Updated auth context to pass profile_type

4. **Solana Wallet Adapter**
   - Installed `@solana/wallet-adapter-react` and dependencies

## 🔄 In Progress

### Files Still Need Updates (Rename "agencies" → "profiles")

**Critical Files:**
- `hooks/use-agencies.ts` → Rename to `use-profiles.ts`
- `hooks/use-agency.ts` → Rename to `use-profile.ts`
- `hooks/use-my-agency.ts` → Rename to `use-my-profile.ts`
- `app/dashboard/agency/` → Rename to `app/dashboard/profile/`
- `app/agencies/` → Rename to `app/profiles/`
- All Supabase queries using `from("agencies")` → `from("profiles")`

**Database Table References:**
- `agencies` table → `profiles` table
- `agency_id` column → `profile_id` column
- All RLS policies referencing `agencies`

## 📝 Next Steps

1. **Run SQL Migration**
   ```bash
   # In Supabase SQL Editor, run:
   sql/migrate-to-profiles.sql
   sql/create-profile-trigger.sql
   ```

2. **Update All Database Queries**
   - Find/replace: `from("agencies")` → `from("profiles")`
   - Find/replace: `agency_id` → `profile_id`
   - Update all TypeScript interfaces

3. **Update Components**
   - Profile cards to show type badge
   - Profile pages to use dynamic layouts
   - Browse page with profile type filter

4. **Add KOL-Specific Features**
   - KOL onboarding form
   - Twitter handle integration
   - Content type pricing
   - Follower count display

5. **Solana Wallet Verification**
   - Create wallet verification component
   - Create verification API route
   - Add verification badge to profiles

## 🚀 Quick Migration Script

```bash
# Find all files with "agencies"
find . -type f \( -name "*.ts" -o -name "*.tsx" \) | xargs grep -l "agencies" | grep -v node_modules

# Manual find/replace (use with caution):
# 1. agencies → profiles
# 2. agency_id → profile_id  
# 3. Agency → Profile (TypeScript interfaces)
# 4. from("agencies") → from("profiles")
```

## 📋 Checklist

- [ ] Run SQL migrations in Supabase
- [ ] Update all hooks
- [ ] Update all pages  
- [ ] Update all components
- [ ] Update all API routes
- [ ] Test signup flow
- [ ] Test profile creation
- [ ] Test profile display
- [ ] Add wallet verification
- [ ] Update homepage
