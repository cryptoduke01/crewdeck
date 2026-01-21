import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { FAQAccordion } from "@/components/faq-accordion";
import Link from "next/link";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing - crewdeck",
  description: "Choose the right plan for your agency. Featured listings and premium features to grow your business.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 sm:pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Stacked layers background effect */}
        <div className="absolute inset-0 -z-10 opacity-3">
          <div className="absolute top-20 left-10 w-96 h-96 bg-foreground rounded-3xl rotate-6 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-foreground rounded-3xl -rotate-12 blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="mb-6 flex justify-center">
              <Logo variant="standalone" size={60} className="h-12 w-12 opacity-90" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Pricing & Revenue Model</h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Choose the plan that works best for your agency. Pay in crypto or fiat. All plans include a verified listing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {/* Free Plan */}
            <div className="relative p-8 rounded-xl border-2 border-border bg-card">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-foreground/60">/month</span>
                </div>
                <p className="text-sm text-foreground/60 mt-2">Perfect for getting started</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Verified agency listing</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Portfolio showcase</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Client reviews</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Contact form</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Basic analytics</span>
                </li>
              </ul>

              <Link href="/auth/signup" className="block">
                <Button variant="outline" className="w-full cursor-pointer">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Featured Plan */}
            <div className="relative p-8 pt-12 rounded-xl border-2 border-foreground/40 bg-card shadow-lg">
              {/* Stacked layers effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/5 rounded-full blur-2xl -z-10"></div>
              
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-foreground text-background text-xs font-medium">
                  <Sparkles className="h-3 w-3" />
                  Popular
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Featured</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$20</span>
                  <span className="text-foreground/60">/month</span>
                </div>
                <p className="text-sm text-foreground/60 mt-2">Get more visibility</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80 font-medium">Everything in Free</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Featured badge on listing</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Priority in search results</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Top placement on homepage</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Enhanced analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Email support</span>
                </li>
              </ul>

              <Link href="/auth/signup?plan=featured" className="block">
                <Button className="w-full cursor-pointer">
                  Upgrade to Featured
                </Button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="relative p-8 rounded-xl border-2 border-border bg-card">
              {/* Stacked layers effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/5 rounded-full blur-2xl -z-10"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-foreground/3 rounded-full blur-2xl -z-10"></div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-foreground/60" />
                  <h3 className="text-2xl font-bold">Premium</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$60</span>
                  <span className="text-foreground/60">/month</span>
                </div>
                <p className="text-sm text-foreground/60 mt-2">Maximum exposure</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80 font-medium">Everything in Featured</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Premium badge & placement</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Homepage hero placement</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Advanced analytics dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Custom profile enhancements</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-foreground/60 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">Lead generation insights</span>
                </li>
              </ul>

              <Link href="/auth/signup?plan=premium" className="block">
                <Button variant="outline" className="w-full cursor-pointer border-2">
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          </div>

          {/* Payment Info */}
          <div className="max-w-3xl mx-auto mt-20 pt-16 border-t border-border">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Payment Methods</h2>
              <p className="text-foreground/70">
                We accept both cryptocurrency and fiat payments. Choose your preferred method during checkout.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground/70">
                Crypto (USDC, ETH)
              </div>
              <div className="px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground/70">
                Credit Card
              </div>
              <div className="px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground/70">
                Stripe
              </div>
              <div className="px-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground/70">
                PayPal
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mt-20 pt-16 border-t border-border">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <FAQAccordion
              items={[
                {
                  question: "How does billing work?",
                  answer: "All plans are billed monthly. You can upgrade, downgrade, or cancel at any time. Changes take effect immediately."
                },
                {
                  question: "What happens if I cancel?",
                  answer: "Your listing remains active but reverts to the Free plan. You'll keep all your data, reviews, and portfolio items."
                },
                {
                  question: "Can I switch plans later?",
                  answer: "Yes! You can upgrade or downgrade at any time from your dashboard. Prorated credits are applied when upgrading."
                },
                {
                  question: "Can I pay with cryptocurrency?",
                  answer: "Yes! We accept USDC, ETH, and other major tokens. Connect your wallet during checkout. Crypto payments are processed instantly."
                },
                {
                  question: "Do you offer annual plans?",
                  answer: (
                    <>
                      Annual plans are available with a 20% discount. Contact us at{" "}
                      <a href="mailto:sales@crewdeck.xyz" className="underline hover:text-foreground transition-colors">
                        sales@crewdeck.xyz
                      </a>{" "}
                      for annual pricing.
                    </>
                  )
                }
              ]}
            />
          </div>

          <div className="mt-12 text-center">
            <Link href="/" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
