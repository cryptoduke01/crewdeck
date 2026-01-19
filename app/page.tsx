"use client";

import { 
  Search, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users,
  ArrowRight,
  CheckCircle2,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
export default function Home() {
  // Removed unnecessary data fetching - homepage doesn't display agencies

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6 leading-tight tracking-tight"
            >
              The Marketing <span className="whitespace-nowrap">Agency Aggregator</span>
              <br />
              <span className="text-foreground/80">for Web3 Projects</span>
            </h1>

            <p
              className="text-base sm:text-lg text-foreground/60 max-w-2xl mx-auto mb-10 px-2"
            >
              Browse vetted marketing agencies all in one place. Compare services, portfolios, pricing, and reviews to find the right agency for your project.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
            >
              <Link href="/agencies" className="cursor-pointer w-full sm:w-auto">
                <Button size="lg" className="group cursor-pointer w-full sm:w-auto">
                  Browse Agencies
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/signup" className="cursor-pointer w-full sm:w-auto">
                <Button size="lg" variant="outline" className="cursor-pointer w-full sm:w-auto">
                  Join as Agency
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="mx-auto max-w-6xl">
          <div
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
              Why use an agency aggregator?
            </h2>
            <p className="text-base text-foreground/60 max-w-2xl mx-auto">
              Save time and make better decisions by comparing agencies in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Search,
                title: "Find agencies faster",
                description: "Filter by niche, services, budget, and location. No more endless searching across multiple platforms.",
              },
              {
                icon: Shield,
                title: "Verified agencies only",
                description: "Every agency listed is vetted. We check portfolios, verify references, and ensure quality standards.",
              },
              {
                icon: TrendingUp,
                title: "Compare pricing",
                description: "See pricing ranges upfront. Compare budgets across agencies to find the best fit for your project.",
              },
              {
                icon: Users,
                title: "Real client reviews",
                description: "Read verified reviews from actual clients. Get honest feedback about agency performance and results.",
              },
              {
                icon: Zap,
                title: "Direct communication",
                description: "Contact agencies directly through the platform. Get responses faster and start projects seamlessly.",
              },
              {
                icon: CheckCircle2,
                title: "Portfolio showcases",
                description: "Browse real work and case studies. See actual results before making a decision.",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-lg border border-border bg-card hover:border-foreground/30 transition-all cursor-default group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="p-2 rounded-md bg-muted group-hover:bg-foreground/10 transition-colors"
                  >
                    <feature.icon className="h-5 w-5 group-hover:text-foreground transition-colors" />
                  </div>
                  <h3 className="text-lg font-medium">{feature.title}</h3>
                </div>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border bg-muted/30">
        <div className="mx-auto max-w-5xl">
          <div
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
              How it works
            </h2>
            <p className="text-base text-foreground/60 max-w-2xl mx-auto">
              Find and connect with the perfect marketing agency in three steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Browse agencies",
                description: "Search and filter agencies by niche, services, budget, location, and more.",
                icon: Filter,
              },
              {
                step: "02",
                title: "Compare options",
                description: "Review portfolios, read client testimonials, and compare pricing across agencies.",
                icon: CheckCircle2,
              },
              {
                step: "03",
                title: "Connect & start",
                description: "Reach out directly to agencies. Get proposals and begin your project.",
                icon: ArrowRight,
              },
            ].map((step, index) => (
              <div
                key={step.step}
                className="relative group"
              >
                <div className="p-6 rounded-lg border border-border bg-card hover:border-foreground/30 transition-all">
                  <div className="text-xs font-medium text-foreground/40 mb-4">
                    {step.step}
                  </div>
                  <div 
                    className="mb-4"
                  >
                    <step.icon className="h-6 w-6 text-foreground/60 group-hover:text-foreground transition-colors" />
                  </div>
                  <h3 className="text-lg font-medium mb-3">{step.title}</h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
            Ready to find your marketing agency?
          </h2>
          <p className="text-base text-foreground/60 mb-10 max-w-xl mx-auto">
            Browse our directory of vetted marketing agencies and find the perfect match for your project.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/agencies" className="cursor-pointer">
              <Button size="lg" className="group cursor-pointer">
                Browse Agencies
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="cursor-pointer">
              Join as Agency
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-lg font-medium mb-4">crewdeck.</div>
              <p className="text-sm text-foreground/60 leading-relaxed mb-3">
                The marketing agency aggregator for web3 projects.
              </p>
              <p className="text-xs text-foreground/50 leading-relaxed">
                Idea by <a href="https://twitter.com/netrovertHQ" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/70 cursor-pointer">Netrovert</a>. Built by the crewdeck team.
              </p>
            </div>
            <div>
              <div className="text-sm font-medium mb-4">Product</div>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link href="/agencies" className="hover:text-foreground transition-colors cursor-pointer">
                    Browse Agencies
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors cursor-pointer">
                    For Agencies
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors cursor-pointer">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium mb-4">Company</div>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors cursor-pointer">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors cursor-pointer">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors cursor-pointer">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium mb-4">Legal</div>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors cursor-pointer">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors cursor-pointer">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors cursor-pointer">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-foreground/60">
            <p>© {new Date().getFullYear()} crewdeck. All rights reserved.</p>
            <p className="mt-2 text-xs">
              Idea by <a href="https://twitter.com/netrovertHQ" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/70 cursor-pointer">Netrovert</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
