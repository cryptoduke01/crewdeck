import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - crewdeck",
  description: "Privacy Policy for crewdeck marketing agency aggregator platform.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-semibold mb-4">Privacy Policy</h1>
            <p className="text-sm text-foreground/60">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Welcome to crewdeck ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-medium mb-3 mt-6">2.1 Information You Provide</h3>
              <p className="text-foreground/80 leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li>Account information (name, email address, password)</li>
                <li>Agency profile information (company name, description, services, pricing)</li>
                <li>Contact information when you send messages through the Platform</li>
                <li>Reviews and ratings you submit</li>
                <li>Portfolio items and images</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <p className="text-foreground/80 leading-relaxed mb-4">
                When you access the Platform, we automatically collect certain information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, links clicked)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, prevent, and address technical issues and fraudulent activity</li>
                <li>Personalize and improve your experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li><strong>Service Providers:</strong> We may share information with third-party vendors who perform services on our behalf</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid requests by public authorities</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
                <li><strong>With Your Consent:</strong> We may share your information with your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                We use industry-standard encryption, secure authentication, and regular security audits to protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Privacy Rights</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your information to another service</li>
                <li><strong>Withdrawal:</strong> Withdraw consent where we rely on consent to process your information</li>
              </ul>
              <p className="text-foreground/80 leading-relaxed mb-4 mt-4">
                To exercise these rights, please contact us at <a href="mailto:privacy@crewdeck.xyz" className="underline hover:text-foreground transition-colors">privacy@crewdeck.xyz</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity on our Platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Cookies we use include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li><strong>Essential Cookies:</strong> Required for the Platform to function properly</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with the Platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Third-Party Services</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Our Platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                We use the following third-party services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li><strong>Supabase:</strong> For database and authentication services</li>
                <li><strong>Resend:</strong> For email delivery services</li>
                <li><strong>Vercel Analytics:</strong> For website analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                When we no longer need your information, we will delete or anonymize it in a secure manner.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Our Platform is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-foreground/80 leading-relaxed">
                Email: <a href="mailto:privacy@crewdeck.xyz" className="underline hover:text-foreground transition-colors">privacy@crewdeck.xyz</a>
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
