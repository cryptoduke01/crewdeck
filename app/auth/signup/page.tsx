"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Building2, ArrowRight } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/lib/toast/context";
import { PasswordInput } from "@/components/password-input";
import { ProfileTypeSelector } from "@/components/profile-type-selector";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileType, setProfileType] = useState<"agency" | "kol" | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { signUp } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      showError("Passwords don't match", "Please make sure both passwords are the same");
      setLoading(false);
      return;
    }

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

    if (!profileType) {
      showError("Profile type required", "Please select whether you're an agency or KOL");
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, profileName, profileType);

    if (error) {
      // Show more helpful error message
      let errorTitle = "Signup failed";
      let errorMessage = error.message;
      
      // If it's a duplicate email error, provide more context
      if (error.message?.includes('already registered')) {
        errorTitle = "Email already exists";
        errorMessage = error.message + "\n\nTo fix this:\n1. Go to Supabase Dashboard > Authentication > Users\n2. Find and delete the user with this email\n3. Try signing up again\n\nOr use a different email address.";
      }
      
      showError(errorTitle, errorMessage);
      setLoading(false);
    } else {
      showSuccess(
        "Account created!", 
        `Welcome, ${profileName}! Redirecting to dashboard...`,
        2000
      );
      // Redirect to dashboard after showing message
      setTimeout(() => {
        router.push("/dashboard/agency");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Stacked layers background effect */}
      <div className="absolute inset-0 -z-10 opacity-3">
        <div className="absolute top-20 left-10 w-96 h-96 bg-foreground rounded-3xl rotate-6 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-foreground rounded-3xl -rotate-12 blur-3xl"></div>
      </div>
      
      <Navbar />
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative p-8 rounded-xl border-2 border-border bg-card shadow-lg"
          >
            {/* Stacked layers effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-foreground/5 rounded-full blur-2xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-foreground/3 rounded-full blur-2xl -z-10"></div>
            
            <div className="relative mb-8 flex justify-center">
              <Logo variant="standalone" size={60} className="h-12 w-12 opacity-90" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2 text-center">Create account</h1>
            <p className="text-sm text-foreground/70 mb-8 text-center">
              Sign up to create and manage your profile.
            </p>

                   <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="space-y-4">
                       <label className="text-sm font-medium text-foreground/80 block">
                         Choose Your Profile Type
                       </label>
                       <ProfileTypeSelector
                         selectedType={profileType}
                         onSelect={setProfileType}
                       />
                     </div>

              {profileType && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="profileName" className="text-sm font-medium text-foreground/80">
                      {profileType === "agency" ? "Agency Name" : "Display Name"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setProfileType(null)}
                      className="text-xs text-foreground/60 hover:text-foreground transition-colors"
                    >
                      Change type
                    </button>
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/40" />
                    <input
                      id="profileName"
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      placeholder={profileType === "agency" ? "Your Agency Name" : "Your Display Name"}
                    />
                  </div>
                </div>
              )}

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

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80">
                  Confirm Password
                </label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  showStrengthBar={false}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !profileType}
                className="w-full cursor-pointer"
                size="lg"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
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

            <div className="mt-6 space-y-3">
              <div className="text-center text-sm text-foreground/60">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-foreground hover:underline cursor-pointer">
                  Sign in
                </Link>
              </div>
              <div className="text-center text-xs text-foreground/50">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-foreground/70 transition-colors cursor-pointer">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-foreground/70 transition-colors cursor-pointer">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
