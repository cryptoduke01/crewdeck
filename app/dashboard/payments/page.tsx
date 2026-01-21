"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, CreditCard, CheckCircle2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth/context";
import { Loading } from "@/components/loading";
import { createSupabaseClient } from "@/lib/supabase/client";

export const dynamic = 'force-dynamic';

function PaymentsSetupContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const method = searchParams.get("method") || "solana";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Loading />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6 cursor-pointer gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="p-8 rounded-xl border-2 border-border bg-card shadow-lg">
              <h1 className="text-3xl font-bold mb-2">Setup Solana Wallet</h1>
              <p className="text-sm text-foreground/60 mb-8">
                Configure your Solana wallet address to receive instant payments from clients.
              </p>

              <div className="space-y-6">
                <div className="p-6 rounded-lg border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-purple-500/20">
                      <Zap className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Why Solana?</h3>
                      <p className="text-xs text-foreground/60">Fastest & Most Reliable</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-sm text-foreground/70">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <span><strong>Instant settlements:</strong> Payments confirm in seconds, not days</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <span><strong>Ultra-low fees:</strong> Average transaction cost under $0.001</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <span><strong>Global access:</strong> No borders, no restrictions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      <span><strong>24/7 availability:</strong> Payments work around the clock</span>
                    </li>
                  </ul>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const walletAddress = formData.get("walletAddress") as string;
                    
                    if (!walletAddress || walletAddress.trim().length < 32) {
                      alert("Please enter a valid Solana wallet address");
                      return;
                    }

                    setLoading(true);
                    try {
                      const supabase = createSupabaseClient();
                      const { error } = await supabase
                        .from("agencies")
                        .update({ wallet_address: walletAddress.trim() })
                        .eq("user_id", user?.id);

                      if (error) throw error;
                      
                      router.push("/dashboard/agency");
                    } catch (err) {
                      console.error("Error saving wallet:", err);
                      alert("Failed to save wallet address. Please try again.");
                      setLoading(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="walletAddress" className="text-sm font-medium text-foreground/80 mb-2 block">
                      Solana Wallet Address
                    </label>
                    <input
                      id="walletAddress"
                      name="walletAddress"
                      type="text"
                      required
                      placeholder="Enter your Solana wallet address (e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU)"
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all font-mono"
                    />
                    <p className="text-xs text-foreground/50 mt-2">
                      This is where clients will send payments. Make sure to use a secure wallet.
                    </p>
                  </div>

                  <Button 
                    type="submit"
                    className="w-full cursor-pointer gap-2"
                    size="lg"
                    disabled={loading}
                  >
                    <Wallet className="h-4 w-4" />
                    {loading ? "Saving..." : "Save Wallet Address"}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <Loading />
      </div>
    }>
      <PaymentsSetupContent />
    </Suspense>
  );
}
