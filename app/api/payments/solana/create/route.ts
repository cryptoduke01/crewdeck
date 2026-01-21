import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

// Platform wallet address (should be in env)
const PLATFORM_WALLET = process.env.SOLANA_RECIPIENT_WALLET || "";

export async function POST(request: Request) {
  try {
    const { plan, userId, agencyId } = await request.json();
    
    if (!plan || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!PLATFORM_WALLET) {
      return NextResponse.json(
        { error: "Platform wallet not configured" },
        { status: 500 }
      );
    }

    // Calculate amount in SOL (approximate conversion)
    // $20 = Featured, $60 = Premium
    const amountUSD = plan === "featured" ? 20 : 60;
    // Rough conversion: 1 SOL ≈ $150 (should use real-time API in production)
    const solAmount = (amountUSD / 150).toFixed(4);

    // Create payment request
    const paymentRequest = {
      recipient: PLATFORM_WALLET,
      amount: parseFloat(solAmount),
      label: `crewdeck ${plan} subscription`,
      message: `Payment for ${plan} plan - $${amountUSD}/month`,
      memo: JSON.stringify({ 
        userId, 
        agencyId: agencyId || "", 
        plan,
        amountUSD,
        timestamp: Date.now()
      }),
    };

    // Generate Solana Pay URL
    const solanaPayUrl = `solana:${PLATFORM_WALLET}?amount=${solAmount}&label=${encodeURIComponent(paymentRequest.label)}&memo=${encodeURIComponent(paymentRequest.memo)}`;

    // Store pending payment in database (optional - for tracking)
    // Note: pending_payments table needs to be created first
    try {
      const supabase = await createSupabaseServerClient();
      await supabase.from("pending_payments").insert({
        user_id: userId,
        agency_id: agencyId || null,
        plan,
        amount_usd: amountUSD,
        amount_sol: parseFloat(solAmount),
        status: "pending",
        payment_method: "solana",
      });
    } catch (error) {
      // Table might not exist yet, that's okay
      console.log("Could not store pending payment:", error);
    }

    return NextResponse.json({ 
      url: solanaPayUrl,
      amount: solAmount,
      recipient: PLATFORM_WALLET,
      amountUSD,
      plan,
    });
  } catch (error) {
    console.error("Solana payment creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment request" },
      { status: 500 }
    );
  }
}
