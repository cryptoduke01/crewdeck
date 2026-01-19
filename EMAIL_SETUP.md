# Email Notifications Setup

crewdeck uses Resend for sending email notifications to agencies.

## Setup Instructions

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

### 2. Get Your API Key

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it "crewdeck" (or whatever you prefer)
4. Copy the API key

### 3. Add to Environment Variables

Add to your `.env.local`:
```
RESEND_API_KEY=re_your_api_key_here
```

### 4. Verify Your Domain (Optional but Recommended)

For production:
1. Go to [Resend Domains](https://resend.com/domains)
2. Add your domain (e.g., `crewdeck.com`)
3. Add the DNS records Resend provides
4. Wait for verification (usually a few minutes)

For development/testing:
- You can use the default `noreply@resend.dev` domain
- Or use your verified domain

### 5. Update Email From Address (Optional)

In `lib/email/client.ts`, you can change the default `from` address:
```typescript
from = "crewdeck <noreply@crewdeck.com>"
```

Or use Resend's default:
```typescript
from = "onboarding@resend.dev"
```

## Email Types

The system sends:
1. **New Message Notification** - When an agency receives a message
2. **New Review Notification** - When an agency gets a new review
3. **Welcome Email** - After agency signup (after email verification)

## Testing

1. Make sure `RESEND_API_KEY` is set in `.env.local`
2. Submit a contact form or review
3. Check the agency's email inbox
4. Check browser console for any errors (emails are sent non-blocking)

## Troubleshooting

- **Emails not sending**: Check that `RESEND_API_KEY` is set correctly
- **Emails going to spam**: Verify your domain in Resend
- **Rate limits**: Free tier is 100 emails/day, upgrade if needed
- **API errors**: Check Resend dashboard for error logs
