"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth/context";
import { useMyAgency } from "@/hooks/use-my-agency";
import { Loading } from "@/components/loading";
import { createSupabaseClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  content: string;
  sender_id: string | null;
  created_at: string;
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const { agency, loading: agencyLoading } = useMyAgency();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchMessages() {
      if (!agency) return;

      try {
        setLoading(true);
        const supabase = createSupabaseClient();

        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("agency_id", agency.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    }

    if (agency) {
      fetchMessages();
    }
  }, [agency]);

  if (authLoading || agencyLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Loading />
      </div>
    );
  }

  if (!user || !agency) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link href="/dashboard/agency" className="inline-block mb-4">
              <Button variant="ghost" className="gap-2 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold mb-2">Messages</h1>
                <p className="text-sm text-foreground/60">
                  View and manage inquiries from potential clients.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Messages List */}
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="p-6 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="h-5 w-5 text-foreground/40" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {message.sender_id || "Anonymous"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-foreground/50 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(message.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-sm text-foreground/70 leading-relaxed">
                    {message.content}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 border border-border rounded-lg bg-card"
            >
              <Mail className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-sm text-foreground/60">
                Messages from potential clients will appear here.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
