# Setup Guide for crewdeck

This guide will help you set up the infrastructure for crewdeck.

## Prerequisites

- Node.js 18+ and pnpm installed
- Supabase account (or PostgreSQL database)
- (Optional) Algolia or MeiliSearch account for search
- (Optional) Mixpanel account for analytics

## 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database (Supabase or PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/crewdeck?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Search (Algolia)
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=your_algolia_search_key
ALGOLIA_ADMIN_KEY=your_algolia_admin_key

# OR Search (MeiliSearch)
NEXT_PUBLIC_MEILISEARCH_HOST=your_meilisearch_host
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=your_meilisearch_search_key
MEILISEARCH_MASTER_KEY=your_meilisearch_master_key

# Analytics (Mixpanel)
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Database Setup (Supabase)

### Option A: Using Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings > API
3. Update `.env.local` with your Supabase credentials
4. Run the Prisma migrations:

```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

### Option B: Using PostgreSQL

1. Set up a PostgreSQL database (local or hosted)
2. Update `DATABASE_URL` in `.env.local`
3. Run Prisma migrations:

```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

## 3. Search Setup (Optional)

### Algolia Setup

1. Install Algolia packages:

```bash
pnpm add algoliasearch instantsearch.js
```

2. Update `lib/search/client.ts` with your Algolia implementation
3. Configure your search index in Algolia dashboard
4. Add your Algolia credentials to `.env.local`

### MeiliSearch Setup

1. Install MeiliSearch packages:

```bash
pnpm add meilisearch
```

2. Update `lib/search/client.ts` with your MeiliSearch implementation
3. Run MeiliSearch locally or use MeiliSearch Cloud
4. Add your MeiliSearch credentials to `.env.local`

## 4. Analytics Setup (Optional)

### Mixpanel Setup

1. Create a Mixpanel project
2. Get your project token from Mixpanel dashboard
3. Install Mixpanel:

```bash
pnpm add mixpanel-browser
```

4. Update `lib/analytics/client.ts` with your Mixpanel implementation
5. Add your Mixpanel token to `.env.local`

## 5. Development

Start the development server:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 6. Next Steps

1. **Add Real Data**: Replace mock data with actual database queries
2. **Implement Search**: Connect Algolia/MeiliSearch to your agency data
3. **Add Authentication**: Set up Supabase Auth for agencies and projects
4. **Implement Loading States**: Use the `Loading` component for data fetching
5. **Add Analytics**: Track user behavior with Mixpanel
6. **Deploy**: Deploy to Vercel, Railway, or your preferred platform

## File Structure

```
lib/
├── supabase/
│   ├── client.ts      # Browser Supabase client
│   └── server.ts      # Server Supabase client
├── search/
│   └── client.ts      # Search client (Algolia/MeiliSearch)
├── analytics/
│   └── client.ts      # Analytics client (Mixpanel)
hooks/
└── use-agencies.ts    # Custom hook for fetching agencies
```

## Credits

**Idea by:** [Netrovert](https://twitter.com/netrovertHQ)  
**Implementation:** crewdeck team
