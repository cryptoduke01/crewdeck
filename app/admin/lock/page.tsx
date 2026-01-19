"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

const ADMIN_PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "";

export default function AdminLockPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Check if already authenticated
    const isAuthenticated = sessionStorage.getItem("admin_authenticated");
    if (isAuthenticated === "true") {
      router.push("/admin");
    }
  }, [router]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPasscode = [...passcode];
    newPasscode[index] = value;
    setPasscode(newPasscode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !passcode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newPasscode = [...passcode];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newPasscode[i] = pastedData[i];
      }
      setPasscode(newPasscode);
      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const enteredPasscode = passcode.join("");

    if (enteredPasscode.length !== 6) {
      setError("Please enter a 6-digit passcode");
      setLoading(false);
      return;
    }

    // Check passcode
    if (enteredPasscode === ADMIN_PASSCODE) {
      // Store authentication in sessionStorage
      sessionStorage.setItem("admin_authenticated", "true");
      router.push("/admin");
    } else {
      setError("Incorrect passcode. Please try again.");
      setPasscode(Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setLoading(false);
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
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-foreground/60" />
              </div>
              <h1 className="text-2xl font-semibold mb-2">Admin Access</h1>
              <p className="text-sm text-foreground/60">
                Enter the 6-digit passcode to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-2">
                {passcode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-semibold rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    disabled={loading}
                  />
                ))}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-sm text-destructive text-center"
                >
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={loading || passcode.join("").length !== 6}
              >
                {loading ? "Verifying..." : "Access Admin Panel"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="gap-2 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
