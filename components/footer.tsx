import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
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
  );
}
