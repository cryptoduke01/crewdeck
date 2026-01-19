# crewdeck

A marketing agency aggregator platform for discovering and connecting with vetted marketing agencies.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL, Auth, Storage)
- Framer Motion
- shadcn/ui

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token (optional)
RESEND_API_KEY=your_resend_api_key (for email notifications)
NEXT_PUBLIC_ADMIN_PASSCODE=your_6_digit_passcode (for admin panel)
```

3. Run the development server:
```bash
pnpm dev
```

## Features

- Agency directory with advanced filtering
- Agency profiles with portfolio, reviews, and contact forms
- Agency authentication and dashboard
- Review system
- Messaging system
- Image uploads for portfolio items
- Analytics tracking

## Credits

Original idea by Netrovert. Implementation by crewdeck team.
