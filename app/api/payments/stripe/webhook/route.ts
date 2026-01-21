import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const plan = session.metadata?.plan;
      const userId = session.metadata?.userId || session.client_reference_id;
      
      if (!userId || !plan) {
        console.error("Missing userId or plan in session metadata");
        return NextResponse.json({ received: true });
      }

      // Update agency plan status
      const updateData: any = {
        premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      if (plan === "featured") {
        updateData.featured = true;
        updateData.premium = false;
      } else if (plan === "premium") {
        updateData.premium = true;
        updateData.featured = false;
      }

      const { error } = await supabase
        .from("agencies")
        .update(updateData)
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating agency plan:", error);
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      const plan = subscription.metadata?.plan;

      if (userId && plan) {
        // Calculate premium_until from subscription period end
        const periodEnd = (subscription as any).current_period_end;
        const updateData: any = {
          premium_until: periodEnd 
            ? new Date(periodEnd * 1000).toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };

        if (plan === "featured") {
          updateData.featured = true;
          updateData.premium = false;
        } else if (plan === "premium") {
          updateData.premium = true;
          updateData.featured = false;
        }

        await supabase
          .from("agencies")
          .update(updateData)
          .eq("user_id", userId);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        // Revert to free plan
        await supabase
          .from("agencies")
          .update({
            featured: false,
            premium: false,
            premium_until: null,
          })
          .eq("user_id", userId);
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      // Log payment failure for monitoring
      console.log("Payment failed for invoice:", invoice.id);
      // In production, you might want to fetch the subscription and update agency status
      // or send a notification email to the user
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
