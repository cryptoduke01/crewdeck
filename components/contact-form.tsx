"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/lib/supabase/client";
import { analytics } from "@/lib/analytics/client";
import { useToast } from "@/lib/toast/context";
import { sendNewMessageNotification } from "@/lib/email/utils";

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
  const { success: showSuccess, error: showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createSupabaseClient();

      const contactInfo = [
        `Name: ${formData.name}`,
        `Email: ${formData.email}`,
        formData.xHandle ? `X (Twitter): @${formData.xHandle.replace(/^@/, "")}` : null,
        `Project Type: ${formData.projectType || "Not specified"}`,
      ].filter(Boolean).join("\n");

      const fullMessageContent = `${contactInfo}\n\nMessage:\n${formData.message}`;

      // Insert message into database
      const { error: insertError, data: messageData } = await supabase
        .from("messages")
        .insert({
          agency_id: agencyId,
          content: fullMessageContent,
          sender_id: formData.email,
        })
        .select();

      if (insertError) {
        console.error("Error inserting message:", insertError);
        // Check if it's an RLS error
        if (insertError.message?.includes('row-level security') || insertError.message?.includes('policy')) {
          throw new Error("Unable to send message. The agency may not be verified yet.");
        }
        throw new Error(insertError.message || "Failed to send message");
      }

      if (!messageData || messageData.length === 0) {
        throw new Error("Message was not saved. Please try again.");
      }

      // Fetch agency email to send notification
      const { data: agencyData, error: fetchError } = await supabase
        .from("agencies")
        .select("email")
        .eq("id", agencyId)
        .single();

      if (fetchError) {
        console.error("Error fetching agency email:", fetchError);
        // Don't throw - message was saved, just email notification failed
      }

      // Send email notification to agency (truly non-blocking - fire and forget)
      if (agencyData?.email) {
        // Don't await - let it run in background
        const messageUrl = typeof window !== "undefined" 
          ? `${window.location.origin}/dashboard/agency/messages`
          : `/dashboard/agency/messages`;
        const messagePreview = formData.message.substring(0, 200);
        
        // Fire and forget - don't block on email sending
        sendNewMessageNotification(
          agencyData.email,
          agencyName,
          formData.name,
          messagePreview,
          messageUrl
        ).catch((emailErr) => {
          // Silently log error - don't show to user since message was saved
          console.error("Failed to send email notification (non-blocking):", emailErr);
        });
      }

      setSuccess(true);
      setFormData({ name: "", email: "", message: "", projectType: "", xHandle: "" });
      
      showSuccess("Message sent!", `${agencyName} will get back to you soon.`);
      
      analytics.track("Contact Form Submitted", {
        agencyId,
        agencyName,
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error sending message:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      showError("Failed to send message", errorMessage);
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
