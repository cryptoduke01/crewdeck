import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About - crewdeck",
  description: "Learn about crewdeck, the marketing agency aggregator for web3 projects.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <div className="mb-8 flex justify-center">
              <Logo variant="standalone" size={100} className="h-20 w-20 opacity-90" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">About crewdeck</h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              The marketing agency aggregator for web3 projects.
            </p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                crewdeck was created to solve a fundamental problem in the web3 marketing space: finding the right marketing agency is time-consuming, fragmented, and often overwhelming. We believe that connecting projects with the right marketing partners should be simple, transparent, and efficient.
              </p>
              <p className="text-foreground/80 leading-relaxed">
                Our platform brings together vetted marketing agencies in one place, making it easy to compare services, portfolios, pricing, and reviews. We're committed to maintaining high standards and ensuring that every agency listed on crewdeck meets our quality criteria.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                crewdeck serves as a comprehensive directory and comparison platform for marketing agencies specializing in web3 projects. We help:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li><strong>Projects & Founders:</strong> Discover and compare marketing agencies, read verified reviews, and connect directly with agencies that match your needs</li>
                <li><strong>Marketing Agencies:</strong> Showcase your services, portfolio, and expertise to potential clients in the web3 space</li>
                <li><strong>The Web3 Ecosystem:</strong> Build stronger connections between projects and marketing professionals</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">Quality First</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Every agency on crewdeck is vetted. We verify portfolios, check references, and ensure that only quality agencies are listed on our platform.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Transparency</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    We believe in transparent pricing, honest reviews, and clear communication. No hidden fees, no misleading information.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Community-Driven</h3>
                  <p className="text-foreground/80 leading-relaxed">
                    Our platform is built for the web3 community, by the web3 community. We listen to feedback and continuously improve based on user needs.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">For Projects</h3>
                  <p className="text-foreground/80 leading-relaxed mb-2">
                    Browse our directory of verified marketing agencies. Filter by niche, services, budget, and location. Compare portfolios, read reviews, and contact agencies directly through our platform.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">For Agencies</h3>
                  <p className="text-foreground/80 leading-relaxed mb-2">
                    Create your agency profile, showcase your portfolio, set your pricing, and start receiving inquiries from potential clients. Our platform helps you connect with projects that are the right fit.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                crewdeck was born from a simple observation: the web3 marketing landscape is fragmented. Founders spend countless hours searching across multiple platforms, agencies struggle to reach the right clients, and the process is inefficient for everyone involved.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                We set out to create a platform that brings everyone together—a place where quality agencies can showcase their work and projects can find the perfect marketing partner. The result is crewdeck: a streamlined, transparent, and community-focused aggregator platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Credits</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                crewdeck was inspired by an idea from <a href="https://twitter.com/netrovertHQ" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">Netrovert</a>. The concept of creating a centralized platform for marketing agencies in the web3 space resonated with us, and we set out to build it.
              </p>
              <p className="text-foreground/80 leading-relaxed">
                Built with care by the crewdeck team, we're committed to making web3 marketing more accessible, transparent, and efficient for everyone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Have questions, feedback, or suggestions? We'd love to hear from you.
              </p>
              <p className="text-foreground/80 leading-relaxed">
                Email: <a href="mailto:hello@crewdeck.xyz" className="underline hover:text-foreground transition-colors">hello@crewdeck.xyz</a>
                <br />
                Website: <Link href="/" className="underline hover:text-foreground transition-colors">crewdeck.xyz</Link>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <Link href="/" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
