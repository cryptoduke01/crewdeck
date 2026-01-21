"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, CreditCard, Check, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/auth/context";
import { useMyAgency } from "@/hooks/use-my-agency";
import { Loading, LoadingSpinner } from "@/components/loading";
import { Logo } from "@/components/logo";
import { useToast } from "@/lib/toast/context";

export const dynamic = 'force-dynamic';

export default function UpgradePage() {
  const { user, loading: authLoading } = useAuth();
  const { agency } = useMyAgency();
  const router = useRouter();
  const { error: showError } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<"featured" | "premium">("featured");
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "fiat" | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Loading />
      </div>
    );
  }

  const handleContinue = async () => {
    if (!paymentMethod) {
      showError("Payment method required", "Please select a payment method");
      return;
    }

    if (!user) {
      router.push("/auth/login");
      return;
    }

    setProcessing(true);

    try {
      if (paymentMethod === "crypto") {
        // Create Solana payment
        const response = await fetch("/api/payments/solana/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: selectedPlan,
            userId: user.id,
            agencyId: agency?.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create payment");
        }

        const data = await response.json();
        
        // Redirect to Solana Pay URL
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error("Payment URL not generated");
        }
      } else {
        // Create Stripe checkout
        const response = await fetch("/api/payments/stripe/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: selectedPlan,
            userId: user.id,
            agencyId: agency?.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create checkout");
        }

        const data = await response.json();
        
        // Redirect to Stripe checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error("Checkout URL not generated");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      showError("Payment failed", error instanceof Error ? error.message : "Please try again");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
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

            <div className="text-center mb-8">
              <div className="mb-6 flex justify-center">
                <Logo variant="standalone" size={60} className="h-12 w-12 opacity-90" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">Upgrade Your Plan</h1>
              <p className="text-lg text-foreground/70">
                Choose a plan to get more visibility and features.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Featured Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                onClick={() => setSelectedPlan("featured")}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === "featured"
                    ? "border-foreground bg-card shadow-lg"
                    : "border-border bg-card hover:border-foreground/40"
                }`}
              >
                {selectedPlan === "featured" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="px-3 py-1 rounded-full bg-foreground text-background text-xs font-medium">
                      Selected
                    </div>
                  </div>
                )}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    Popular
                  </div>
                </div>
                <div className="mb-6 pt-4">
                  <h3 className="text-xl font-bold mb-2">Featured</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">$20</span>
                    <span className="text-foreground/60">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">Everything in Free</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">Featured badge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">Priority placement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">Enhanced analytics</span>
                  </li>
                </ul>
              </motion.div>

              {/* Premium Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                onClick={() => setSelectedPlan("premium")}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === "premium"
                    ? "border-foreground bg-card shadow-lg"
                    : "border-border bg-card hover:border-foreground/40"
                }`}
              >
                {selectedPlan === "premium" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="px-3 py-1 rounded-full bg-foreground text-background text-xs font-medium">
                      Selected
                    </div>
                  </div>
                )}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-5 w-5 text-foreground/60" />
                    <h3 className="text-xl font-bold">Premium</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">$60</span>
                    <span className="text-foreground/60">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80 font-medium">Everything in Featured</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">Premium badge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">Top placement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">Maximum exposure</span>
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Payment Method Selection */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-6 rounded-xl border-2 border-border bg-card"
            >
              <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("crypto")}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
                    paymentMethod === "crypto"
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${paymentMethod === "crypto" ? "bg-purple-500/20" : "bg-foreground/10"}`}>
                      <Zap className={`h-5 w-5 ${paymentMethod === "crypto" ? "text-purple-500" : "text-foreground/60"}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold">Crypto (Solana)</h4>
                      <p className="text-xs text-foreground/60">Fastest & Most Reliable</p>
                    </div>
                  </div>
                  <p className="text-xs text-foreground/70 mt-2">
                    Instant settlements, ultra-low fees, global access
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("fiat")}
                  className={`p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${
                    paymentMethod === "fiat"
                      ? "border-foreground/40 bg-foreground/5"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${paymentMethod === "fiat" ? "bg-foreground/20" : "bg-foreground/10"}`}>
                      <CreditCard className="h-5 w-5 text-foreground/60" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Fiat (Stripe)</h4>
                      <p className="text-xs text-foreground/60">Credit/Debit Cards</p>
                    </div>
                  </div>
                  <p className="text-xs text-foreground/70 mt-2">
                    Traditional payment methods via Stripe
                  </p>
                </button>
              </div>
            </motion.div>

            <div className="flex justify-center">
              <Button
                onClick={handleContinue}
                disabled={!paymentMethod || processing}
                size="lg"
                className="cursor-pointer gap-2"
              >
                {processing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
