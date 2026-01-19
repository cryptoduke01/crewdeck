"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { createSupabaseClient } from "@/lib/supabase/client";

// Disable static generation for this page
export const dynamic = 'force-dynamic';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    async function handleCallback() {
      const supabase = createSupabaseClient();
      
      // Get the code from URL
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setMessage("Email verification failed. Please try again.");
        return;
      }

      if (code) {
        try {
          // Exchange code for session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }

          if (data.user) {
            setStatus("success");
            setMessage("Email verified successfully! Welcome to crewdeck.");
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push("/dashboard/agency");
            }, 2000);
          }
        } catch (err) {
          console.error("Error verifying email:", err);
          setStatus("error");
          setMessage(err instanceof Error ? err.message : "Failed to verify email");
        }
      } else {
        // No code - might already be verified or invalid link
        setStatus("error");
        setMessage("Invalid verification link");
      }
    }

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 rounded-lg border border-border bg-card text-center"
        >
          {status === "loading" && (
            <>
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <h1 className="text-2xl font-semibold mb-2">Verifying email</h1>
              <p className="text-sm text-foreground/60">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold mb-2">Email verified!</h1>
              <p className="text-sm text-foreground/60 mb-6">{message}</p>
              <p className="text-xs text-foreground/50">Redirecting to dashboard...</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold mb-2">Verification failed</h1>
              <p className="text-sm text-foreground/60 mb-6">{message}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => router.push("/auth/login")} className="cursor-pointer">
                  Go to Sign In
                </Button>
                <Button variant="outline" onClick={() => router.push("/auth/signup")} className="cursor-pointer">
                  Sign Up Again
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense
        fallback={
          <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-md">
              <div className="p-8 rounded-lg border border-border bg-card text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
              </div>
            </div>
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
