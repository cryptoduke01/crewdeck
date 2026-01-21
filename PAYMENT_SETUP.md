# Payment Setup Guide

## Overview
This document outlines how to set up crypto payments (Solana) and fiat payments (Stripe) for the crewdeck platform.

## Current Implementation Status

### ✅ Completed
- Wallet address storage in database (`wallet_address` column in `agencies` table)
- Payment setup UI for agencies to enter Solana wallet address
- Payment method selection on plan selection page (crypto vs fiat)
- Updated pricing: Featured $20/month, Premium $60/month

### 🔧 Next Steps

## 1. Solana (Crypto) Payments Setup

### Database Migration
Run the SQL script to add wallet address column:
```sql
-- Already created: sql/add-wallet-address.sql
ALTER TABLE agencies
ADD COLUMN IF NOT EXISTS wallet_address TEXT;
```

### Implementation Steps

#### Option A: Direct Wallet Integration (Recommended)
1. **Install Solana Web3.js**
   ```bash
   pnpm add @solana/web3.js @solana/spl-token
   ```

2. **Create Payment Service**
   - Create `lib/payments/solana.ts`
   - Implement wallet address validation
   - Create payment request generation
   - Handle payment verification

3. **Payment Flow**
   - User selects plan and payment method (crypto)
   - Generate payment request with amount and recipient wallet
   - Display QR code or payment link
   - Poll for payment confirmation on Solana blockchain
   - Update agency plan status on confirmation

#### Option B: Payment Processor Integration
Use a service like:
- **Helio** (https://helio.finance) - Solana payment processor
- **Solana Pay** (https://solanapay.com) - Official Solana payment standard
- **Sphere** (https://spherepay.co) - Crypto payment infrastructure

### Recommended: Solana Pay Integration

1. **Install Solana Pay**
   ```bash
   pnpm add @solana/pay
   ```

2. **Create Payment API Route**
   - `app/api/payments/solana/route.ts`
   - Generate payment URLs
   - Verify transactions

3. **Payment Verification**
   - Use Solana RPC to check transaction status
   - Verify amount and recipient
   - Update agency plan on successful payment

## 2. Stripe (Fiat) Payments Setup

### Setup Steps

1. **Install Stripe**
   ```bash
   pnpm add stripe @stripe/stripe-js
   ```

2. **Environment Variables**
   Add to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Create Stripe Products**
   - Featured Plan: $20/month (recurring)
   - Premium Plan: $60/month (recurring)
   - Create products in Stripe Dashboard or via API

4. **Create Payment API Routes**
   - `app/api/payments/stripe/create-checkout/route.ts` - Create checkout session
   - `app/api/payments/stripe/webhook/route.ts` - Handle webhooks
   - `app/api/payments/stripe/cancel/route.ts` - Handle cancellations

5. **Webhook Setup**
   - Configure webhook endpoint in Stripe Dashboard
   - URL: `https://yourdomain.com/api/payments/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

6. **Update Agency Plan Status**
   - On successful payment, update `featured` or `premium` fields
   - Set `premiumUntil` date for subscription end date
   - Handle subscription renewals automatically

## 3. Implementation Files Needed

### Solana Payment Files
```
lib/payments/solana.ts          # Solana payment utilities
app/api/payments/solana/route.ts # Payment generation & verification
components/solana-payment.tsx   # Payment UI component
```

### Stripe Payment Files
```
lib/payments/stripe.ts                    # Stripe utilities
app/api/payments/stripe/create-checkout/route.ts
app/api/payments/stripe/webhook/route.ts
app/api/payments/stripe/cancel/route.ts
components/stripe-checkout.tsx            # Stripe checkout component
```

## 4. Database Updates Needed

### Add Subscription Fields
```sql
ALTER TABLE agencies
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_method TEXT; -- 'crypto' or 'fiat'
```

## 5. Testing

### Solana Testing
- Use Solana Devnet for testing
- Test with small amounts first
- Verify transaction confirmation times
- Test payment verification logic

### Stripe Testing
- Use Stripe test mode
- Test with test cards: `4242 4242 4242 4242`
- Test webhook delivery
- Test subscription lifecycle

## 6. Security Considerations

### Solana
- Validate wallet addresses before saving
- Verify transaction signatures
- Implement rate limiting on payment verification
- Store transaction IDs for audit trail

### Stripe
- Verify webhook signatures
- Use HTTPS for webhook endpoints
- Implement idempotency keys
- Store subscription IDs securely

## 7. Recommended Implementation Order

1. ✅ Database schema (wallet_address column) - DONE
2. ✅ UI for wallet address entry - DONE
3. ⏭️ Stripe integration (easier to test)
4. ⏭️ Solana Pay integration
5. ⏭️ Payment verification & plan updates
6. ⏭️ Subscription management UI
7. ⏭️ Email notifications for payments

## Resources

- Solana Pay Docs: https://docs.solanapay.com
- Stripe Docs: https://stripe.com/docs
- Solana Web3.js: https://solana-labs.github.io/solana-web3.js
- Helio: https://docs.helio.finance
