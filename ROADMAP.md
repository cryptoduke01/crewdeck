# crewdeck Roadmap

## ✅ Completed
- [x] Supabase database setup
- [x] Agency listing page with real data
- [x] Basic search and filtering
- [x] Loading states
- [x] Analytics tracking structure
- [x] Dark/light mode

## 🚀 Next Priority Features

### 1. Agency Profile Page (High Priority)
**Status**: Currently using mock data  
**What to do**:
- Create `hooks/use-agency.ts` to fetch single agency by ID
- Fetch agency, services, portfolio, and reviews from Supabase
- Update `app/agencies/[id]/page.tsx` to use real data
- Add loading and error states

**Impact**: Users can view full agency details

---

### 2. Enhanced Search & Filtering (High Priority)
**Status**: Basic search works, needs improvement  
**What to do**:
- Add price range filter (slider or dropdown)
- Add location filter (dropdown with popular locations)
- Add services filter (multi-select)
- Implement debounced search for better performance
- Add sorting options (rating, price, newest)

**Impact**: Better user experience finding agencies

---

### 3. Reviews System (Medium Priority)
**Status**: Not implemented  
**What to do**:
- Create review submission form
- Add authentication (or anonymous reviews with moderation)
- Display reviews on agency profile
- Calculate and update agency ratings
- Add review moderation (admin approval)

**Impact**: Builds trust and helps users make decisions

---

### 4. Agency Authentication & Dashboard (Medium Priority)
**Status**: Not implemented  
**What to do**:
- Set up Supabase Auth
- Create login/signup pages for agencies
- Build agency dashboard (`/dashboard/agency`)
- Allow agencies to:
  - Edit their profile
  - Upload portfolio items
  - View analytics (profile views, inquiries)
  - Respond to messages

**Impact**: Agencies can manage their own profiles

---

### 5. Contact/Messaging System (Medium Priority)
**Status**: Not implemented  
**What to do**:
- Create contact form on agency profile
- Store messages in Supabase `messages` table
- Add notification system (email or in-app)
- Create inbox for agencies in dashboard
- Add project brief submission

**Impact**: Enables direct communication

---

### 6. Image Uploads (Low Priority)
**Status**: Not implemented  
**What to do**:
- Set up Supabase Storage bucket
- Add image upload component
- Allow agencies to upload portfolio images
- Add image optimization
- Display images in portfolio section

**Impact**: Visual portfolio showcases

---

### 7. Advanced Features (Future)
- [ ] Admin panel for managing agencies
- [ ] Email notifications
- [ ] Agency verification workflow
- [ ] Featured listings (paid)
- [ ] Analytics dashboard for agencies
- [ ] Export data (CSV/PDF)
- [ ] API for integrations
- [ ] Mobile app

---

## Quick Wins (Can do now)

1. **Update agency profile page** - 30 min
   - Fetch real data from Supabase
   - Show portfolio items from database
   - Display reviews from database

2. **Add more filters** - 1 hour
   - Price range slider
   - Location dropdown
   - Services multi-select

3. **Improve search** - 30 min
   - Add debouncing
   - Search in descriptions too
   - Highlight search terms

4. **Add reviews display** - 1 hour
   - Fetch reviews from database
   - Display on agency profile
   - Show average rating

---

## Recommended Order

1. **Agency Profile Page** (most important - users click through)
2. **Enhanced Filtering** (improves discovery)
3. **Reviews Display** (builds trust)
4. **Contact System** (enables conversions)
5. **Agency Dashboard** (allows self-service)

---

## Need Help?

Each feature can be implemented step-by-step. Let me know which one you want to tackle first!
