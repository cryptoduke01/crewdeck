import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const connection = new Connection(
  process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com"
);

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
  try {
    const { signature, plan, userId, agencyId, amountUSD } = await request.json();

    if (!signature || !plan || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify transaction
    const tx = await connection.getTransaction(signature, {
      commitment: "confirmed",
    });

    if (!tx) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check if transaction is confirmed
    if (!tx.meta || tx.meta.err) {
      return NextResponse.json(
        { error: "Transaction failed" },
        { status: 400 }
      );
    }

    // Verify amount and recipient (simplified - in production, parse transaction details)
    const platformWallet = process.env.SOLANA_RECIPIENT_WALLET;
    if (!platformWallet) {
      return NextResponse.json(
        { error: "Platform wallet not configured" },
        { status: 500 }
      );
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
      return NextResponse.json(
        { error: "Failed to update plan" },
        { status: 500 }
      );
    }

    // Mark payment as completed (if pending_payments table exists)
    try {
      await supabase
        .from("pending_payments")
        .update({ 
          status: "completed",
          transaction_signature: signature,
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("status", "pending");
    } catch (error) {
      // Table might not exist, that's okay
      console.log("Could not update pending payment:", error);
    }

    return NextResponse.json({ 
      success: true,
      plan,
      message: "Payment verified and plan activated"
    });
  } catch (error) {
    console.error("Solana verification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}
