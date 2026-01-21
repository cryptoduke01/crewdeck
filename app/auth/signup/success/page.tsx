"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Logo } from "@/components/logo";

// Disable static generation - this page uses searchParams
export const dynamic = 'force-dynamic';

export default function SignupSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileName = searchParams.get("name") || "there";
  const profileType = searchParams.get("type") as "agency" | "kol" | null;

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
            
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4"
              >
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">Account Created!</h1>
              <p className="text-sm text-foreground/70">
                Welcome, {profileName}!
              </p>
            </div>

            <div className="mb-8 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
              <p className="text-sm text-foreground/80 text-center leading-relaxed">
                <strong>Verification Pending:</strong> Your account will be verified soon. In the meantime, complete and setup your {profileType === "kol" ? "KOL" : "agency"} profile to get verified.
              </p>
            </div>

            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full cursor-pointer"
              size="lg"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
