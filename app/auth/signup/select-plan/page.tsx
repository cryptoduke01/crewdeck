"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Disable static generation for this page
export const dynamic = 'force-dynamic';
import Link from "next/link";
import { Check, Sparkles, Crown, ArrowRight, Zap, CreditCard } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/lib/toast/context";

export default function SelectPlanPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "featured" | "premium">("free");
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "fiat" | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push("/auth/signup");
    }
  }, [user, authLoading, router]);

  const handleContinue = async () => {
    if (!user) {
      router.push("/auth/signup");
      return;
    }

    setProcessing(true);

    try {
      // For now, just redirect to dashboard
      // In the future, this will handle payment processing
      if (selectedPlan === "free") {
        showSuccess("Account created!", "Your free account is ready. You can upgrade anytime from your dashboard.");
        router.push("/dashboard/agency");
      } else {
        // Process payment
        if (paymentMethod === "crypto") {
          const response = await fetch("/api/payments/solana/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              plan: selectedPlan,
              userId: user.id,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create payment");
          }

          const data = await response.json();
          if (data.url) {
            window.location.href = data.url;
          } else {
            throw new Error("Payment URL not generated");
          }
        } else {
          const response = await fetch("/api/payments/stripe/create-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              plan: selectedPlan,
              userId: user.id,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create checkout");
          }

          const data = await response.json();
          if (data.url) {
            window.location.href = data.url;
          } else {
            throw new Error("Checkout URL not generated");
          }
        }
      }
    } catch (err) {
      showError("Error", err instanceof Error ? err.message : "Failed to process plan selection");
      setProcessing(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Stacked layers background effect */}
      <div className="absolute inset-0 -z-10 opacity-3">
        <div className="absolute top-20 left-10 w-96 h-96 bg-foreground rounded-3xl rotate-6 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-foreground rounded-3xl -rotate-12 blur-3xl"></div>
      </div>
      
      <Navbar />
      <div className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="mb-6 flex justify-center">
              <Logo variant="standalone" size={60} className="h-12 w-12 opacity-90" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Select the plan that works best for your agency. You can upgrade or downgrade anytime.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={() => setSelectedPlan("free")}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPlan === "free"
                  ? "border-foreground bg-card shadow-lg"
                  : "border-border bg-card hover:border-foreground/40"
              }`}
            >
              {selectedPlan === "free" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-3 py-1 rounded-full bg-foreground text-background text-xs font-medium">
                    Selected
                  </div>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-foreground/60">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Verified listing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Portfolio showcase</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Client reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Contact form</span>
                </li>
              </ul>
            </motion.div>

            {/* Featured Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
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
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-xs font-medium">
                  <Sparkles className="h-3 w-3" />
                  Popular
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Featured</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">$20</span>
                  <span className="text-foreground/60">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80 font-medium">Everything in Free</span>
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
              transition={{ duration: 0.5, delay: 0.2 }}
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
                  <Check className="h-4 w-4 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80 font-medium">Everything in Featured</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Premium badge</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Homepage placement</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Advanced analytics</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="mb-6 p-4 rounded-lg bg-muted border border-border text-center">
              <p className="text-sm text-foreground/70">
                We accept both cryptocurrency (USDC, ETH) and fiat payments (Credit Card, Stripe, PayPal)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleContinue}
                disabled={processing}
                size="lg"
                className="flex-1 cursor-pointer"
              >
                {processing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue with {selectedPlan === "free" ? "Free" : selectedPlan === "featured" ? "Featured" : "Premium"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              <Link href="/dashboard/agency" className="sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto cursor-pointer">
                  Skip for now
                </Button>
              </Link>
            </div>

            <p className="text-center text-xs text-foreground/50 mt-6">
              You can upgrade or downgrade anytime from your dashboard
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
