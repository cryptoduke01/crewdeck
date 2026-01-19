"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Loader2, Calendar, Reply, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/lib/auth/context";
import { useMyAgency } from "@/hooks/use-my-agency";
import { Loading } from "@/components/loading";
import { createSupabaseClient } from "@/lib/supabase/client";
import { parseMessage, type ParsedMessage } from "@/lib/message-parser";
import { useToast } from "@/lib/toast/context";
import { exportToCSV } from "@/lib/export";
import { Download } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_id: string | null;
  created_at: string;
  read?: boolean;
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const { agency, loading: agencyLoading } = useMyAgency();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");
  const { success: showSuccess, error: showError } = useToast();

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
        // Add read status (default to false if not set)
        const messagesWithRead = (data || []).map((msg: any) => ({
          ...msg,
          read: msg.read || false,
        }));
        setMessages(messagesWithRead);
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-semibold mb-2">Messages</h1>
                <p className="text-sm text-foreground/60">
                  View and manage inquiries from potential clients.
                </p>
              </div>
              <div className="text-sm text-foreground/60">
                {messages.length} {messages.length === 1 ? "message" : "messages"}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterRead("all")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    filterRead === "all"
                      ? "bg-foreground text-background"
                      : "bg-muted text-foreground/70 hover:bg-muted/80 border border-border"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterRead("unread")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    filterRead === "unread"
                      ? "bg-foreground text-background"
                      : "bg-muted text-foreground/70 hover:bg-muted/80 border border-border"
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilterRead("read")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    filterRead === "read"
                      ? "bg-foreground text-background"
                      : "bg-muted text-foreground/70 hover:bg-muted/80 border border-border"
                  }`}
                >
                  Read
                </button>
              </div>
            </div>
          </motion.div>

          {/* Messages List */}
          {(() => {
            // Filter and search messages
            let filtered = messages;

            // Filter by read status
            if (filterRead === "read") {
              filtered = filtered.filter((m) => m.read);
            } else if (filterRead === "unread") {
              filtered = filtered.filter((m) => !m.read);
            }

            // Search
            if (searchQuery) {
              const query = searchQuery.toLowerCase();
              filtered = filtered.filter((m) => {
                const parsed = parseMessage(m.content);
                return (
                  parsed.name?.toLowerCase().includes(query) ||
                  parsed.email?.toLowerCase().includes(query) ||
                  parsed.message.toLowerCase().includes(query) ||
                  m.content.toLowerCase().includes(query)
                );
              });
            }

            if (filtered.length === 0) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20 border border-border rounded-lg bg-card"
                >
                  <Mail className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery || filterRead !== "all" ? "No messages found" : "No messages yet"}
                  </h3>
                  <p className="text-sm text-foreground/60">
                    {searchQuery || filterRead !== "all"
                      ? "Try adjusting your search or filters."
                      : "Messages from potential clients will appear here."}
                  </p>
                </motion.div>
              );
            }

            return (
              <div className="space-y-4">
                {filtered.map((message, index) => {
                  const parsed = parseMessage(message.content);
                  const replyEmail = parsed.email || message.sender_id;

                  const handleMarkRead = async () => {
                    try {
                      const supabase = createSupabaseClient();
                      const { error } = await supabase
                        .from("messages")
                        .update({ read: !message.read })
                        .eq("id", message.id);

                      if (error) throw error;

                      setMessages((prev) =>
                        prev.map((m) =>
                          m.id === message.id ? { ...m, read: !m.read } : m
                        )
                      );
                    } catch (err) {
                      showError("Failed to update", err instanceof Error ? err.message : "Unknown error");
                    }
                  };

                  const handleDelete = async () => {
                    if (!confirm("Are you sure you want to delete this message?")) return;

                    try {
                      const supabase = createSupabaseClient();
                      const { error } = await supabase
                        .from("messages")
                        .delete()
                        .eq("id", message.id);

                      if (error) throw error;

                      setMessages((prev) => prev.filter((m) => m.id !== message.id));
                      showSuccess("Message deleted", "The message has been removed.");
                    } catch (err) {
                      showError("Failed to delete", err instanceof Error ? err.message : "Unknown error");
                    }
                  };

                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className={`p-6 rounded-lg border ${
                        !message.read ? "border-foreground/30 bg-card" : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            !message.read ? "bg-foreground/10" : "bg-muted"
                          }`}>
                            <Mail className={`h-5 w-5 ${!message.read ? "text-foreground/60" : "text-foreground/40"}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="text-sm font-medium">
                                {parsed.name || message.sender_id || "Anonymous"}
                              </div>
                              {!message.read && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-foreground text-background">
                                  New
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-foreground/50">
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
                        <div className="flex gap-2">
                          {replyEmail && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                window.location.href = `mailto:${replyEmail}?subject=Re: Inquiry from crewdeck&body=Hi ${parsed.name || "there"},\n\n`;
                              }}
                              className="gap-2 cursor-pointer"
                            >
                              <Reply className="h-3.5 w-3.5" />
                              Reply
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkRead}
                            className="cursor-pointer"
                          >
                            {message.read ? "Mark unread" : "Mark read"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            className="text-foreground/50 hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Contact Info */}
                      {(parsed.email || parsed.xHandle || parsed.projectType) && (
                        <div className="mb-4 p-3 rounded-lg bg-muted border border-border">
                          <div className="space-y-1.5 text-xs">
                            {parsed.email && (
                              <div className="flex items-center gap-2">
                                <span className="text-foreground/50">Email:</span>
                                <a
                                  href={`mailto:${parsed.email}`}
                                  className="text-foreground/70 hover:text-foreground hover:underline cursor-pointer"
                                >
                                  {parsed.email}
                                </a>
                              </div>
                            )}
                            {parsed.xHandle && (
                              <div className="flex items-center gap-2">
                                <span className="text-foreground/50">X:</span>
                                <a
                                  href={`https://x.com/${parsed.xHandle.replace(/^@/, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-foreground/70 hover:text-foreground hover:underline cursor-pointer"
                                >
                                  {parsed.xHandle}
                                </a>
                              </div>
                            )}
                            {parsed.projectType && (
                              <div className="flex items-center gap-2">
                                <span className="text-foreground/50">Project:</span>
                                <span className="text-foreground/70">{parsed.projectType}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Message Content */}
                      <div className="whitespace-pre-wrap text-sm text-foreground/70 leading-relaxed">
                        {parsed.message || message.content}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
