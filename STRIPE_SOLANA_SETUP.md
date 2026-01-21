# Stripe & Solana Pay Setup Guide

## Quick Setup Instructions

### 1. Stripe Setup (Fiat Payments)

#### Step 1: Create Stripe Account
1. Go to https://stripe.com and sign up
2. Complete account verification
3. Get your API keys from Dashboard → Developers → API keys

#### Step 2: Install Stripe
```bash
pnpm add stripe @stripe/stripe-js
```

#### Step 3: Environment Variables
Add to `.env.local`:
```
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_WEBHOOK_SECRET=whsec_... (get from Stripe Dashboard → Webhooks)
```

#### Step 4: Create Products in Stripe
Go to Stripe Dashboard → Products → Create Product:
- **Featured Plan**: $20/month (recurring subscription)
- **Premium Plan**: $60/month (recurring subscription)

Or create via API:
```bash
# Use Stripe CLI or API
stripe products create --name="Featured Plan" --type=service
stripe prices create --product=prod_xxx --unit-amount=2000 --currency=usd --recurring[interval]=month
```

#### Step 5: Create API Routes

**`app/api/payments/stripe/create-checkout/route.ts`**:
```typescript
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: Request) {
  const { plan, userId, agencyId } = await request.json();
  
  const priceId = plan === "featured" 
    ? process.env.STRIPE_FEATURED_PRICE_ID!
    : process.env.STRIPE_PREMIUM_PRICE_ID!;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agency?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    client_reference_id: userId,
    metadata: {
      agencyId,
      plan,
    },
  });

  return NextResponse.json({ url: session.url });
}
```

**`app/api/payments/stripe/webhook/route.ts`**:
```typescript
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const plan = session.metadata?.plan;
    
    // Update agency plan status
    await supabase
      .from("agencies")
      .update({
        featured: plan === "featured",
        premium: plan === "premium",
        premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("user_id", session.client_reference_id);
  }

  if (event.type === "customer.subscription.deleted") {
    // Handle subscription cancellation
    const subscription = event.data.object as Stripe.Subscription;
    // Update agency to free plan
  }

  return NextResponse.json({ received: true });
}
```

#### Step 6: Configure Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payments/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret to `.env.local`

---

### 2. Solana Pay Setup (Crypto Payments)

#### Step 1: Install Solana Libraries
```bash
pnpm add @solana/web3.js @solana/spl-token @solana/pay
```

#### Step 2: Environment Variables
Add to `.env.local`:
```
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com (or devnet for testing)
SOLANA_RPC_URL_DEVNET=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet (or mainnet-beta)
```

#### Step 3: Create Payment API Route

**`app/api/payments/solana/create/route.ts`**:
```typescript
import { NextResponse } from "next/server";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { createTransferInstruction } from "@solana/spl-token";

const connection = new Connection(
  process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com"
);

export async function POST(request: Request) {
  const { plan, recipientWallet, userId, agencyId } = await request.json();
  
  const amount = plan === "featured" ? 20 : 60; // USD
  // Convert to SOL (approximate, use real-time price API)
  const solAmount = amount / 150; // Example rate
  
  // Create payment request
  const paymentRequest = {
    recipient: recipientWallet, // Your platform wallet
    amount: solAmount,
    label: `crewdeck ${plan} subscription`,
    message: `Payment for ${plan} plan`,
    memo: JSON.stringify({ userId, agencyId, plan }),
  };

  // Generate Solana Pay URL
  const solanaPayUrl = `solana:${recipientWallet}?amount=${solAmount}&label=crewdeck%20${plan}&memo=${encodeURIComponent(paymentRequest.memo)}`;

  return NextResponse.json({ 
    url: solanaPayUrl,
    amount: solAmount,
    recipient: recipientWallet,
  });
}
```

**`app/api/payments/solana/verify/route.ts`**:
```typescript
import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";

const connection = new Connection(
  process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com"
);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { signature, plan, userId, agencyId } = await request.json();

  try {
    // Verify transaction
    const tx = await connection.getTransaction(signature, {
      commitment: "confirmed",
    });

    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Check transaction amount and recipient
    // Update agency plan status
    await supabase
      .from("agencies")
      .update({
        featured: plan === "featured",
        premium: plan === "premium",
        premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("user_id", userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
```

#### Step 4: Setup Platform Wallet
1. Create a Solana wallet for receiving payments (use Phantom, Solflare, etc.)
2. Store wallet address securely (environment variable)
3. Add to `.env.local`:
```
SOLANA_RECIPIENT_WALLET=YourPlatformWalletAddress
```

#### Step 5: Use Solana Pay QR Code
Install QR code library:
```bash
pnpm add qrcode
```

Generate QR code in frontend:
```typescript
import QRCode from "qrcode";

const qrCodeDataUrl = await QRCode.toDataURL(solanaPayUrl);
```

---

## Testing

### Stripe Testing
- Use test mode: `sk_test_...` and `pk_test_...`
- Test card: `4242 4242 4242 4242`
- Any future expiry date, any CVC
- Use Stripe CLI for webhook testing: `stripe listen --forward-to localhost:3000/api/payments/stripe/webhook`

### Solana Testing
- Use Devnet for testing: `https://api.devnet.solana.com`
- Get free SOL from faucet: https://faucet.solana.com
- Test transactions on Devnet before mainnet

---

## Production Checklist

- [ ] Switch to Stripe live keys
- [ ] Switch to Solana mainnet
- [ ] Set up proper error handling
- [ ] Add transaction logging
- [ ] Set up monitoring/alerts
- [ ] Test webhook delivery
- [ ] Verify payment amounts
- [ ] Add rate limiting
- [ ] Set up backup wallet for Solana
- [ ] Document refund process

---

## Resources

- Stripe Docs: https://stripe.com/docs
- Solana Pay: https://docs.solanapay.com
- Solana Web3.js: https://solana-labs.github.io/solana-web3.js
- Stripe Testing: https://stripe.com/docs/testing
