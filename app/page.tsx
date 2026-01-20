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
import { Logo } from "@/components/logo";
import Link from "next/link";
export default function Home() {
  // Removed unnecessary data fetching - homepage doesn't display agencies

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Stacked layers background effect */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-foreground rounded-3xl rotate-6 blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-foreground rounded-3xl -rotate-12 blur-3xl"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-foreground rounded-3xl rotate-45 blur-3xl"></div>
        </div>
        
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            {/* Logo showcase */}
            <div className="mb-8 sm:mb-10 flex justify-center">
              <div className="relative">
                <Logo variant="standalone" size={80} className="h-16 w-16 sm:h-20 sm:w-20 opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/20 to-transparent rounded-full blur-2xl -z-10"></div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
              <span className="block mb-1">The Marketing</span>
              <span className="block bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Agency Aggregator
              </span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground/70 mt-3">
                for Web3 Projects
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto mb-8 sm:mb-10 px-2 leading-relaxed">
              Browse vetted marketing agencies all in one place. Compare services, portfolios, pricing, and reviews to find the perfect match for your project.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 sm:mb-16">
              <Link href="/agencies" className="cursor-pointer w-full sm:w-auto">
                <Button size="default" className="group cursor-pointer w-full sm:w-auto px-6 shadow-md hover:shadow-lg transition-all">
                  Browse Agencies
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/signup" className="cursor-pointer w-full sm:w-auto">
                <Button size="default" variant="outline" className="cursor-pointer w-full sm:w-auto px-6 border-2 hover:bg-foreground/5 transition-all">
                  Join as Agency
                </Button>
              </Link>
            </div>

            {/* Stats or social proof */}
            <div className="grid grid-cols-3 gap-6 sm:gap-8 max-w-xl mx-auto pt-6 sm:pt-8 border-t border-border/50">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">100+</div>
                <div className="text-xs text-foreground/60 mt-1">Agencies</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">Verified</div>
                <div className="text-xs text-foreground/60 mt-1">Quality</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">Web3</div>
                <div className="text-xs text-foreground/60 mt-1">Focused</div>
              </div>
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
                className="relative group p-8 rounded-xl border border-border bg-card hover:border-foreground/40 hover:shadow-lg transition-all cursor-default overflow-hidden"
              >
                {/* Stacked layers effect */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-foreground/5 rounded-full blur-2xl group-hover:bg-foreground/10 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-foreground/3 rounded-full blur-2xl group-hover:bg-foreground/8 transition-colors"></div>
                
                <div className="relative">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-foreground/10 group-hover:bg-foreground/20 transition-colors shrink-0">
                      <feature.icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg font-semibold pt-1">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
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
                {/* Stacked card effect */}
                <div className="absolute inset-0 bg-foreground/5 rounded-xl blur-xl group-hover:bg-foreground/10 transition-all -z-10" style={{ transform: `translate(${index * 4}px, ${index * 4}px)` }}></div>
                <div className="absolute inset-0 bg-foreground/10 rounded-xl blur-lg group-hover:bg-foreground/15 transition-all -z-10" style={{ transform: `translate(${index * 2}px, ${index * 2}px)` }}></div>
                
                <div className="relative p-8 rounded-xl border-2 border-border bg-card hover:border-foreground/40 hover:shadow-xl transition-all">
                  <div className="text-xs font-bold text-foreground/40 mb-6 tracking-wider">
                    {step.step}
                  </div>
                  <div className="mb-6 p-3 rounded-lg bg-foreground/10 w-fit group-hover:bg-foreground/20 transition-colors">
                    <step.icon className="h-8 w-8 text-foreground group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 border-t border-border relative overflow-hidden">
        {/* Stacked layers background */}
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-foreground rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-foreground rounded-full blur-3xl"></div>
        </div>
        
        <div className="mx-auto max-w-3xl text-center relative">
          <div className="mb-8">
            <Logo variant="standalone" size={80} className="h-16 w-16 mx-auto opacity-90" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to find your marketing agency?
          </h2>
          <p className="text-lg text-foreground/70 mb-12 max-w-xl mx-auto leading-relaxed">
            Browse our directory of vetted marketing agencies and find the perfect match for your project.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/agencies" className="cursor-pointer w-full sm:w-auto">
              <Button size="default" className="group cursor-pointer w-full sm:w-auto px-6 shadow-md hover:shadow-lg transition-all">
                Browse Agencies
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/signup" className="cursor-pointer w-full sm:w-auto">
              <Button size="default" variant="outline" className="cursor-pointer w-full sm:w-auto px-6 border-2 hover:bg-foreground/5 transition-all">
                Join as Agency
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <Logo variant="with-text" size={120} className="h-7" />
              <p className="text-sm text-foreground/60 leading-relaxed">
                The marketing agency aggregator for web3 projects.
              </p>
            </div>
            <div>
              <div className="text-sm font-medium mb-4 text-foreground/90">Product</div>
              <ul className="space-y-3 text-sm text-foreground/60">
                <li>
                  <Link href="/agencies" className="hover:text-foreground transition-colors cursor-pointer">
                    Browse Agencies
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="hover:text-foreground transition-colors cursor-pointer">
                    Join as Agency
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground transition-colors cursor-pointer">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium mb-4 text-foreground/90">Company</div>
              <ul className="space-y-3 text-sm text-foreground/60">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors cursor-pointer">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium mb-4 text-foreground/90">Legal</div>
              <ul className="space-y-3 text-sm text-foreground/60">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors cursor-pointer">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors cursor-pointer">
                    Terms and Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/60">
              <p>© {new Date().getFullYear()} crewdeck. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
