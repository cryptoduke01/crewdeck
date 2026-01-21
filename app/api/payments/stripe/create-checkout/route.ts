import { NextResponse } from "next/server";
import Stripe from "stripe";

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

export async function POST(request: Request) {
  try {
    const { plan, userId, agencyId } = await request.json();
    
    if (!plan || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Get price IDs from environment or use default test prices
    const priceId = plan === "featured" 
      ? (process.env.STRIPE_FEATURED_PRICE_ID || "price_featured_test")
      : (process.env.STRIPE_PREMIUM_PRICE_ID || "price_premium_test");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ 
        price: priceId, 
        quantity: 1 
      }],
      success_url: `${baseUrl}/dashboard/agency?payment=success&plan=${plan}`,
      cancel_url: `${baseUrl}/pricing?canceled=true&plan=${plan}`,
      client_reference_id: userId,
      metadata: {
        agencyId: agencyId || "",
        plan,
        userId,
      },
      subscription_data: {
        metadata: {
          agencyId: agencyId || "",
          plan,
          userId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
