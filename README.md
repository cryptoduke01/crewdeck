# crewdeck - Marketing Agency Aggregator

A minimal, professional platform for discovering and connecting with vetted marketing agencies. Built with Next.js 14, TypeScript, Framer Motion, and Tailwind CSS.

## Features

- **Minimal Landing Page** - Clean design with smooth animations using Framer Motion
- **Agency Directory** - Browse vetted marketing agencies with advanced filtering
- **Agency Profiles** - Detailed profiles with portfolio showcases, testimonials, and pricing
- **Dark/Light Mode** - Toggle between dark and light themes
- **Responsive Design** - Works seamlessly on all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Package Manager**: pnpm

## 📦 Installation

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
agency-aggregator/
├── app/
│   ├── agencies/
│   │   ├── [id]/
│   │   │   └── page.tsx      # Agency profile page
│   │   └── page.tsx           # Agency directory page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # Reusable UI components
│   │   └── button.tsx
│   └── navbar.tsx             # Navigation component
└── lib/
    └── utils.ts               # Utility functions
```

## 🎨 Design Features

- **Gradient Text Effects** - Beautiful gradient text animations
- **Smooth Animations** - Framer Motion powered transitions
- **Hover Effects** - Interactive card hover states
- **Floating Elements** - Animated background gradients
- **Glass Morphism** - Backdrop blur effects on cards
- **Dark Theme** - Modern dark theme with accent colors

## 🚀 Quick Start

**New to Supabase?** Start here:
1. Read [QUICK_START.md](./QUICK_START.md) for a 10-minute setup guide
2. Or follow the detailed [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) guide

**Already have Supabase?**
1. Add your credentials to `.env.local`
2. Run `pnpm test:supabase` to verify connection
3. Start with `pnpm dev`

## 🔮 Next Steps

See [SETUP.md](./SETUP.md) for detailed setup instructions.

- [x] Supabase client setup (ready for configuration)
- [x] Search client structure (ready for Algolia/MeiliSearch)
- [x] Analytics client structure (ready for Mixpanel)
- [x] Loading states component
- [ ] Configure Supabase database and authentication
- [ ] Set up Prisma with real database
- [ ] Implement search with Algolia/MeiliSearch
- [ ] Add analytics tracking with Mixpanel
- [ ] Replace mock data with real database queries
- [ ] Implement agency dashboard
- [ ] Integrate Stripe for payments
- [ ] Add review and rating system
- [ ] Implement messaging system

## 📝 License

MIT

## 🙏 Credits

This project was inspired by [Netrovert's](https://x.com/netrovertHQ) idea for a marketing agency aggregator. The crewdeck team implemented this concept.

**Original Idea:** Netrovert  
**Implementation:** duke.sol
