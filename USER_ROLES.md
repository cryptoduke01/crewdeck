# User Roles & Permissions

## User Types

### 1. **Agencies (Authenticated Users)**
- **Who**: Marketing agencies that want to list their services
- **How to join**: Sign up via `/auth/signup` with email, password, and agency name
- **What they can do**:
  - Create and manage their agency profile
  - Upload portfolio images
  - View their dashboard with stats (messages, reviews, rating)
  - Edit their profile information
  - View messages/inquiries from potential clients
  - Respond to reviews (future feature)

### 2. **Public Users (Unauthenticated)**
- **Who**: Anyone browsing the platform
- **How to access**: No account needed - just visit the site
- **What they can do**:
  - Browse all verified agencies
  - Search and filter agencies
  - View agency profiles
  - Submit reviews (no account needed)
  - Send contact messages/inquiries to agencies
  - Share agency profiles

## Summary

✅ **Only agencies need accounts** - They sign up to create and manage their profiles

✅ **Anyone can browse** - No account needed to view agencies, search, filter

✅ **Anyone can contact agencies** - Public contact form, no login required

✅ **Anyone can review** - Public review submission, no account needed

This is a **B2B marketplace** model where:
- **Agencies** = Sellers (need accounts to list services)
- **Public users** = Buyers/Browsers (no account needed to browse and contact)
