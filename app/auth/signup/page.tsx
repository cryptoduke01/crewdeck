"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Building2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/lib/toast/context";
import { PasswordInput } from "@/components/password-input";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { signUp } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      showError("Invalid password", "Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (passwordStrength < 2) {
      showError("Weak password", "Please use a stronger password with at least 8 characters, including uppercase, lowercase, and numbers");
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, agencyName);

    if (error) {
      showError("Signup failed", error.message);
      setLoading(false);
    } else {
      showSuccess(
        "Welcome to crewdeck!", 
        `Thanks for joining, ${agencyName}! We've sent a welcome email with next steps.`,
        4000
      );
      // Redirect to login after showing message
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-lg border border-border bg-card"
          >
            <h1 className="text-2xl font-semibold mb-2">Create account</h1>
            <p className="text-sm text-foreground/60 mb-6">
              Sign up to create and manage your agency profile.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="agencyName" className="text-sm font-medium text-foreground/80">
                  Agency name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <input
                    id="agencyName"
                    type="text"
                    required
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="Your Agency Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground/80">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground/80">
                  Password
                </label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  onStrengthChange={setPasswordStrength}
                />
                <p className="text-xs text-foreground/50">Must be at least 6 characters, 8+ recommended</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-foreground/60">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-foreground hover:underline cursor-pointer">
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
