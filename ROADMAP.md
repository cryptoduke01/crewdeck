# crewdeck Roadmap

## ✅ Completed Features

### Core Platform
- ✅ Agency directory with advanced filtering (niche, location, price, services, sort)
- ✅ Agency profile pages with full details
- ✅ Search functionality with debouncing
- ✅ Homepage with features and how-it-works sections

### Authentication & Profiles
- ✅ Agency signup/login with email verification
- ✅ Agency dashboard with stats (messages, rating, views)
- ✅ Profile editing (create/update agency profiles)
- ✅ Portfolio management with image uploads
- ✅ Services management

### Communication
- ✅ Contact form on agency profiles
- ✅ Messages inbox for agencies
- ✅ Message parsing (extract email, X handle, project type)
- ✅ Search and filter messages (read/unread)
- ✅ Reply via email functionality
- ✅ Mark messages as read/unread
- ✅ Delete messages

### Reviews & Social Proof
- ✅ Review submission form
- ✅ Display reviews on agency profiles
- ✅ Rating calculation and display
- ✅ Review count tracking

### Admin & Management
- ✅ Admin panel with stats dashboard
- ✅ Agency verification/unverification
- ✅ Delete agencies
- ✅ View all agencies with search/filters
- ✅ Admin access control

### UI/UX
- ✅ Smooth animations and transitions
- ✅ Dark/light mode
- ✅ Responsive design
- ✅ Interactive hover effects
- ✅ Loading states
- ✅ Toast notifications
- ✅ Filter modal for better organization

### Technical
- ✅ Supabase integration (database, auth, storage)
- ✅ Row Level Security (RLS) policies
- ✅ Database triggers for agency creation
- ✅ Analytics tracking (Mixpanel)
- ✅ Type-safe TypeScript throughout

---

## 🔧 Known Issues

1. **Portfolio Display** - Portfolio items not showing correctly on public agency profiles (needs debugging)

---

## 🚀 Next Priority Features

### High Priority (Core Functionality)

#### 1. **Fix Portfolio Display** ⚠️
**Status**: Not working  
**What to do**:
- Debug why portfolio items aren't displaying on agency profile pages
- Ensure images load correctly from Supabase Storage
- Fix any data fetching issues in `use-agency.ts` hook

**Impact**: Critical - agencies need to showcase their work

---

#### 2. **Email Notifications** 📧
**Status**: Not implemented  
**What to do**:
- Set up email service (Resend, SendGrid, or Supabase Edge Functions)
- Send email when agency receives new message
- Send email when agency gets new review
- Welcome email after signup (already have verification email)
- Optional: Weekly digest for agencies

**Impact**: High - agencies need to know when they get inquiries

**Options**:
- **Resend API** (recommended - simple, good free tier)
- **SendGrid** (more features, enterprise)
- **Supabase Edge Functions** (integrated, but more setup)

---

#### 3. **Enhanced Search** 🔍
**Status**: Basic search works  
**What to do**:
- Full-text search across descriptions
- Search term highlighting in results
- Search suggestions/autocomplete
- Recent searches
- Save search filters

**Impact**: Medium - improves discovery experience

---

### Medium Priority (User Experience)

#### 4. **Agency Comparison Tool** ⚖️
**Status**: Not implemented  
**What to do**:
- Allow users to select multiple agencies to compare
- Side-by-side comparison view
- Compare: pricing, services, ratings, location
- Save comparison for later

**Impact**: Medium - helps users make decisions

---

#### 5. **In-App Message Replies** 💬
**Status**: Currently only email replies  
**What to do**:
- Add reply functionality within the platform
- Thread messages (conversation view)
- Mark conversations as resolved
- Notification system for new replies

**Impact**: Medium - better communication flow

---

#### 6. **Analytics Dashboard for Agencies** 📊
**Status**: Basic stats exist  
**What to do**:
- Profile view analytics (daily/weekly/monthly trends)
- Message analytics (response rate, avg response time)
- Review analytics (rating trends over time)
- Traffic sources (if tracking)
- Export analytics data (CSV/PDF)

**Impact**: Medium - agencies want to track performance

---

#### 7. **Project Brief Submission** 📋
**Status**: Not implemented  
**What to do**:
- Enhanced contact form with project brief fields
- Budget range selection
- Timeline selection
- Project type/details
- Store briefs in database
- Display briefs in agency dashboard

**Impact**: Medium - better lead qualification

---

### Low Priority (Nice to Have)

#### 8. **Featured Listings** ⭐
**Status**: Not implemented  
**What to do**:
- Paid featured placement on homepage
- Featured badge on agency cards
- Stripe integration for payments
- Featured agencies section
- Admin can feature agencies

**Impact**: Low - monetization opportunity

---

#### 9. **Review Moderation** 🛡️
**Status**: Reviews are public  
**What to do**:
- Admin approval workflow for reviews
- Flag inappropriate reviews
- Agency can report reviews
- Review guidelines display

**Impact**: Low - quality control

---

#### 10. **Saved Searches & Favorites** ❤️
**Status**: Not implemented  
**What to do**:
- Save favorite agencies
- Save search filters
- Get notified when new agencies match saved search
- User accounts for clients (optional)

**Impact**: Low - convenience feature

---

#### 11. **Agency Onboarding Flow** 🎯
**Status**: Basic signup exists  
**What to do**:
- Multi-step onboarding wizard
- Profile completion progress
- Tips and best practices
- Welcome tour

**Impact**: Low - better first experience

---

#### 12. **Export Functionality** 📥
**Status**: Not implemented  
**What to do**:
- Export agency data (CSV/PDF)
- Export messages (CSV)
- Export analytics (CSV/PDF)
- For agencies and admin

**Impact**: Low - data portability

---

## 📋 Recommended Order

### Phase 1: Critical Fixes (This Week)
1. Fix portfolio display
2. Set up email notifications

### Phase 2: Core Enhancements (Next 2 Weeks)
3. Enhanced search
4. In-app message replies
5. Project brief submission

### Phase 3: Growth Features (Next Month)
6. Agency comparison tool
7. Analytics dashboard
8. Featured listings (monetization)

### Phase 4: Polish (Ongoing)
9. Review moderation
10. Saved searches
11. Onboarding flow
12. Export functionality

---

## 🎯 Success Metrics to Track

- Agency signups per week
- Messages sent per week
- Reviews submitted per week
- Profile views per agency
- Search queries per day
- Filter usage patterns
- Conversion rate (profile view → message)
- Agency response rate to messages

---

## 💡 Quick Wins (Can do in 1-2 hours each)

1. **Add "Share Agency" button** - Already have shareUrl utility, just add to more places
2. **Add loading skeletons** - Better perceived performance
3. **Add empty states** - Better UX when no data
4. **Add keyboard shortcuts** - Power user features
5. **Add tooltips** - Help users understand features
6. **Add breadcrumbs** - Better navigation
7. **Add pagination** - For agencies list (if many agencies)

---

## 🔮 Future Considerations

- Mobile app (React Native)
- API for integrations
- White-label solution
- Multi-language support
- Advanced analytics (heatmaps, user flows)
- A/B testing framework
- Recommendation engine ("Agencies you might like")
- Agency marketplace (agencies can bid on projects)

---

## 📝 Notes

- Portfolio display is the most critical issue to fix
- Email notifications are essential for engagement
- Consider using Resend for emails (simple, good free tier)
- Analytics dashboard will help agencies see value
- Featured listings can be a revenue stream
