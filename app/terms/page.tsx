import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions - crewdeck",
  description: "Terms and Conditions for crewdeck marketing agency aggregator platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-semibold mb-4">Terms and Conditions</h1>
            <p className="text-sm text-foreground/60">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                By accessing and using crewdeck ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Permission is granted to temporarily access and use the Platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the Platform</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                You may not use as a username the name of another person or entity or that is not lawfully available for use, a name or trademark that is subject to any rights of another person or entity, or a name that is otherwise offensive, vulgar, or obscene.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Agency Listings</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Agencies listing on crewdeck agree to provide accurate and truthful information about their services, pricing, and credentials. crewdeck reserves the right to verify and remove any listings that contain false or misleading information.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Agencies are responsible for maintaining the accuracy of their listings and responding to inquiries in a timely and professional manner.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Reviews and Content</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Users may submit reviews and content to the Platform. By submitting content, you grant crewdeck a non-exclusive, royalty-free, perpetual, and worldwide license to use, modify, and display such content.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                You agree not to submit content that is defamatory, libelous, hateful, racially or ethnically offensive, or encourages conduct that would be considered a criminal offense. crewdeck reserves the right to remove any content that violates these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Disclaimers</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                The information on this Platform is provided on an "as is" basis. To the fullest extent permitted by law, crewdeck excludes all representations, warranties, and conditions relating to the Platform and the use of this Platform.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                crewdeck does not endorse or guarantee the quality of services provided by listed agencies. We act solely as an aggregator platform and are not responsible for the actions, services, or conduct of any agency listed on the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                In no event shall crewdeck, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Indemnification</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                You agree to defend, indemnify, and hold harmless crewdeck and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                We may terminate or suspend your account and bar access to the Platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                If you wish to terminate your account, you may simply discontinue using the Platform or contact us to delete your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Platform after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <p className="text-foreground/80 leading-relaxed">
                Email: <a href="mailto:legal@crewdeck.xyz" className="underline hover:text-foreground transition-colors">legal@crewdeck.xyz</a>
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
