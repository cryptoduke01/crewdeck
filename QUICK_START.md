# Quick Start Guide - Supabase Setup

Follow these steps to get Supabase connected in 10 minutes:

## 🚀 Step-by-Step

### 1. Create Supabase Account (2 min)
- Go to [supabase.com](https://supabase.com) and sign up
- Click "New Project"
- Name it `crewdeck`, set a database password (save it!), choose region
- Wait 2-3 minutes for project creation

### 2. Get Your Keys (1 min)
- In project dashboard → Settings → API
- Copy **Project URL** and **anon public** key

### 3. Create `.env.local` (1 min)
Create a file called `.env.local` in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from Step 2.

### 4. Create Tables (2 min)
- In Supabase dashboard → SQL Editor → New query
- Copy the SQL from `SUPABASE_SETUP.md` Step 5
- Click "Run"

### 5. Add Sample Data (1 min)
- In SQL Editor → New query
- Copy the SQL from `SUPABASE_SETUP.md` Step 7
- Click "Run"

### 6. Test Connection (1 min)
```bash
pnpm test:supabase
```

You should see: ✅ All tests passed!

### 7. Start Dev Server (1 min)
```bash
pnpm dev
```

Visit `http://localhost:3000/agencies` - you should see your agencies!

## ✅ Done!

Your Supabase is now connected. For detailed instructions, see `SUPABASE_SETUP.md`.

## 🆘 Troubleshooting

**"Invalid API key"**
- Check `.env.local` has correct values
- Restart dev server: `pnpm dev`

**"relation does not exist"**
- Make sure you ran Step 4 (create tables)

**No data showing**
- Make sure you ran Step 5 (add sample data)
- Check agencies have `verified = true` in Supabase dashboard
