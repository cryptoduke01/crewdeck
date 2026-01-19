"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/lib/supabase/client";
import { analytics } from "@/lib/analytics/client";

interface ContactFormProps {
  agencyId: string;
  agencyName: string;
  onSuccess?: () => void;
}

export function ContactForm({ agencyId, agencyName, onSuccess }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    projectType: "",
    xHandle: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey || supabaseUrl === "your_supabase_project_url") {
        // Fallback - just show success for demo
        setTimeout(() => {
          setSuccess(true);
          setLoading(false);
          analytics.track("Contact Form Submitted", {
            agencyId,
            agencyName,
            formType: "demo",
          });
          if (onSuccess) onSuccess();
        }, 1000);
        return;
      }

      const supabase = createSupabaseClient();

      const contactInfo = [
        `Name: ${formData.name}`,
        `Email: ${formData.email}`,
        formData.xHandle ? `X (Twitter): @${formData.xHandle.replace(/^@/, "")}` : null,
        `Project Type: ${formData.projectType || "Not specified"}`,
      ].filter(Boolean).join("\n");

      const { error: insertError } = await supabase
        .from("messages")
        .insert({
          agency_id: agencyId,
          content: `${contactInfo}\n\nMessage:\n${formData.message}`,
          sender_id: formData.email, // Using email as sender ID for now
        });

      if (insertError) throw insertError;

      // Fetch agency email to send notification
      const { data: agencyData } = await supabase
        .from("agencies")
        .select("email")
        .eq("id", agencyId)
        .single();

      // Send email notification to agency (non-blocking)
      if (agencyData?.email) {
        const messageUrl = `${window.location.origin}/dashboard/agency/messages`;
        const messagePreview = formData.message.substring(0, 200);
        
        // Import and use email utility
        import("@/lib/email/utils").then(({ sendNewMessageNotification }) => {
          sendNewMessageNotification(
            agencyData.email,
            agencyName,
            formData.name,
            messagePreview,
            messageUrl
          ).catch((err) => {
            console.error("Failed to send email notification:", err);
            // Don't block the form submission if email fails
          });
        });
      }

      setSuccess(true);
      setFormData({ name: "", email: "", message: "", projectType: "", xHandle: "" });
      
      analytics.track("Contact Form Submitted", {
        agencyId,
        agencyName,
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 rounded-lg border border-border bg-card text-center"
      >
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Mail className="h-6 w-6 text-foreground/60" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Message sent!</h3>
        <p className="text-sm text-foreground/60 mb-4">
          {agencyName} will get back to you soon.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSuccess(false)}
          className="cursor-pointer"
        >
          Send another message
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg border border-destructive/50 bg-destructive/10 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-foreground/80">
          Your name
        </label>
        <input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground/80">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          placeholder="john@example.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="xHandle" className="text-sm font-medium text-foreground/80">
          X (Twitter) handle <span className="text-foreground/40">(optional)</span>
        </label>
        <input
          id="xHandle"
          type="text"
          value={formData.xHandle}
          onChange={(e) => {
            let value = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
            if (value && !value.startsWith("@")) {
              value = "@" + value;
            }
            setFormData({ ...formData, xHandle: value });
          }}
          className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          placeholder="@username"
        />
        <p className="text-xs text-foreground/50">How can we reach you on X?</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="projectType" className="text-sm font-medium text-foreground/80">
          Project type <span className="text-foreground/40">(optional)</span>
        </label>
        <select
          id="projectType"
          value={formData.projectType}
          onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
          className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all cursor-pointer"
        >
          <option value="">Select project type</option>
          <option value="Token Launch">Token Launch</option>
          <option value="Community Building">Community Building</option>
          <option value="NFT Marketing">NFT Marketing</option>
          <option value="PR & Media">PR & Media</option>
          <option value="Content Strategy">Content Strategy</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-foreground/80">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
          placeholder="Tell them about your project and what you're looking for..."
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full cursor-pointer"
        size="lg"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
}
