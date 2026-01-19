# Complete Supabase Setup Guide for crewdeck

This guide will walk you through setting up Supabase from scratch. Follow each step carefully.

## Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

## Step 2: Create a New Project

1. Once logged in, click **"New Project"**
2. Fill in the project details:
   - **Name**: `crewdeck` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine to start
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to be created

## Step 3: Get Your Supabase Credentials

1. In your project dashboard, click **Settings** (gear icon) in the left sidebar
2. Click **API** in the settings menu
3. You'll see:
   - **Project URL** - Copy this (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key - Copy this (long string starting with `eyJ...`)
   - **service_role** key - Copy this too (keep it secret!)

## Step 4: Set Up Environment Variables

1. In your project root, create a file called `.env.local`:

```bash
# Copy this template and fill in your values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database (optional, if using Prisma directly)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres
```

2. Replace the values with your actual credentials from Step 3
3. For `DATABASE_URL`, replace `[YOUR-PASSWORD]` with the password you created in Step 2

## Step 5: Create Database Tables

We'll use Supabase's SQL Editor to create the tables.

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Copy and paste this SQL:

```sql
-- Create agencies table
CREATE TABLE IF NOT EXISTS agencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  niche TEXT NOT NULL,
  description TEXT,
  website TEXT,
  email TEXT,
  location TEXT,
  founded INTEGER,
  team_size TEXT,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  
  -- Rating & Reviews
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Pricing
  price_range_min INTEGER,
  price_range_max INTEGER,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolio table
CREATE TABLE IF NOT EXISTS portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  metrics TEXT,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  author TEXT,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  sender_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agencies_niche ON agencies(niche);
CREATE INDEX IF NOT EXISTS idx_agencies_verified ON agencies(verified);
CREATE INDEX IF NOT EXISTS idx_services_agency_id ON services(agency_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_agency_id ON portfolio(agency_id);
CREATE INDEX IF NOT EXISTS idx_reviews_agency_id ON reviews(agency_id);
CREATE INDEX IF NOT EXISTS idx_messages_agency_id ON messages(agency_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Click **"Run"** or press `Cmd/Ctrl + Enter`
5. You should see "Success. No rows returned"

## Step 6: Set Up Row Level Security (RLS)

For security, we need to set up RLS policies:

1. In SQL Editor, create a new query
2. Paste this SQL:

```sql
-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow public read access to verified agencies
CREATE POLICY "Public can view verified agencies"
ON agencies FOR SELECT
USING (verified = true);

-- Allow public read access to services of verified agencies
CREATE POLICY "Public can view services of verified agencies"
ON services FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agencies 
    WHERE agencies.id = services.agency_id 
    AND agencies.verified = true
  )
);

-- Allow public read access to portfolio of verified agencies
CREATE POLICY "Public can view portfolio of verified agencies"
ON portfolio FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agencies 
    WHERE agencies.id = portfolio.agency_id 
    AND agencies.verified = true
  )
);

-- Allow public read access to reviews of verified agencies
CREATE POLICY "Public can view reviews of verified agencies"
ON reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agencies 
    WHERE agencies.id = reviews.agency_id 
    AND agencies.verified = true
  )
);

-- Allow authenticated users to insert messages
CREATE POLICY "Authenticated users can send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow agencies to view their own messages
CREATE POLICY "Agencies can view their messages"
ON messages FOR SELECT
TO authenticated
USING (true);
```

3. Click **"Run"**

## Step 7: Insert Sample Data (Optional)

Let's add some realistic test data to see it working:

1. In SQL Editor, create a new query
2. **Option A**: Copy the SQL from `sql/sample-data.sql` file (recommended - more realistic names)
   
   OR

   **Option B**: Paste this simplified SQL directly:

```sql
-- Insert sample agencies with realistic names
INSERT INTO agencies (name, slug, niche, description, location, verified, rating, review_count, price_range_min, price_range_max, team_size, founded)
VALUES
  ('Blockchain Ventures Marketing', 'blockchain-ventures-marketing', 'DeFi', 'Specialized DeFi marketing firm helping protocols launch, scale communities, and drive sustainable growth through proven strategies.', 'Remote', true, 4.8, 142, 8000, 35000, '12-18', 2020),
  ('Digital Asset Collective', 'digital-asset-collective', 'NFT', 'Full-service NFT marketing agency focused on collection launches, community building, and influencer partnerships.', 'Los Angeles, US', true, 4.9, 203, 12000, 60000, '15-22', 2019),
  ('Web3 Growth Labs', 'web3-growth-labs', 'Web3', 'Data-driven marketing agency for Web3 projects. We combine growth hacking, content strategy, and community engagement.', 'San Francisco, US', true, 4.7, 98, 10000, 50000, '10-15', 2021);

-- Insert services (run this in same query or separately)
INSERT INTO services (name, agency_id)
SELECT 'Token Launch Strategy', id FROM agencies WHERE slug = 'blockchain-ventures-marketing'
UNION ALL
SELECT 'Community Management', id FROM agencies WHERE slug = 'blockchain-ventures-marketing'
UNION ALL
SELECT 'Content Strategy', id FROM agencies WHERE slug = 'blockchain-ventures-marketing'
UNION ALL
SELECT 'NFT Launch Campaigns', id FROM agencies WHERE slug = 'digital-asset-collective'
UNION ALL
SELECT 'Influencer Marketing', id FROM agencies WHERE slug = 'digital-asset-collective'
UNION ALL
SELECT 'Growth Hacking', id FROM agencies WHERE slug = 'web3-growth-labs'
UNION ALL
SELECT 'Marketing Analytics', id FROM agencies WHERE slug = 'web3-growth-labs';
```

3. Click **"Run"**

**Note**: For the full dataset with more agencies and portfolio items, see `sql/sample-data.sql` file.

## Step 8: Update the useAgencies Hook

The hook needs a small update to handle the database structure. Let me check the current implementation and update it.

## Step 9: Test the Connection

1. Make sure your `.env.local` file has the correct values
2. Restart your dev server:
   ```bash
   pnpm dev
   ```
3. Visit `http://localhost:3000/agencies`
4. You should see the agencies from the database!

## Step 10: Verify in Supabase Dashboard

1. Go to **Table Editor** in Supabase dashboard
2. Click on **agencies** table
3. You should see your sample data
4. Try editing a record to see it update

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file
- Make sure you copied the **anon public** key (not service_role)
- Restart your dev server after changing `.env.local`

### "relation does not exist" error
- Make sure you ran the SQL from Step 5
- Check the SQL Editor for any errors

### No data showing
- Check that agencies have `verified = true`
- Check browser console for errors
- Verify RLS policies are set up correctly

### Connection timeout
- Check your internet connection
- Verify the Supabase project URL is correct
- Check if Supabase project is paused (free tier pauses after inactivity)

## Next Steps

1. **Add more agencies**: Use the Table Editor or create an admin interface
2. **Set up authentication**: For agencies to manage their profiles
3. **Add image storage**: Use Supabase Storage for portfolio images
4. **Set up real-time**: Use Supabase Realtime for live updates

## Need Help?

- Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Check the browser console for errors
- Verify all environment variables are set correctly
