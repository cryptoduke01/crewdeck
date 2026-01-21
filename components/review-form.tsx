"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast/context";
import { analytics } from "@/lib/analytics/client";

interface ReviewFormProps {
  agencyId: string;
  agencyName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ agencyId, agencyName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      showError("Rating required", "Please select a rating before submitting.");
      return;
    }

    if (!comment.trim()) {
      showError("Comment required", "Please write a review comment.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createSupabaseClient();

      // Insert review
      const { error: reviewError } = await supabase
        .from("reviews")
        .insert({
          profile_id: agencyId,
          rating: rating,
          comment: comment.trim(),
          author: author.trim() || null,
        });

      if (reviewError) throw reviewError;

      // Recalculate agency rating
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("rating")
        .eq("agency_id", agencyId);

      if (reviewsError) throw reviewsError;

      if (reviewsData && reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / reviewsData.length;
        const reviewCount = reviewsData.length;

        // Update profile rating and review count
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            rating: averageRating.toFixed(2),
            review_count: reviewCount,
          })
          .eq("id", agencyId);

        if (updateError) throw updateError;
      }

      // Fetch profile email to send notification
      const { data: profileData } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", agencyId)
        .single();

      // Send email notification to profile (non-blocking)
      if (profileData?.email) {
        const reviewUrl = `${window.location.origin}/agencies/${agencyId}`;
        const reviewPreview = comment.trim().substring(0, 200);
        
        // Import and use email utility
        import("@/lib/email/utils").then(({ sendNewReviewNotification }) => {
          sendNewReviewNotification(
            profileData.email,
            agencyName,
            author.trim() || "Anonymous",
            rating,
            reviewPreview,
            reviewUrl
          ).catch((err) => {
            console.error("Failed to send email notification:", err);
            // Don't block the form submission if email fails
          });
        });
      }

      analytics.track("Review Submitted", {
        agencyId,
        agencyName,
        rating,
        hasComment: !!comment.trim(),
      });

      showSuccess("Review submitted!", "Thank you for your feedback.");
      
      // Reset form
      setRating(0);
      setAuthor("");
      setComment("");
      
      // Callback to refresh reviews
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      showError("Failed to submit review", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div>
        <label className="text-sm font-medium text-foreground/80 mb-2 block">
          Your rating *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="cursor-pointer transition-transform hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoveredRating || rating)
                    ? "fill-foreground/80 text-foreground/80"
                    : "fill-foreground/10 text-foreground/30"
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="author" className="text-sm font-medium text-foreground/80 mb-2 block">
          Your name (optional)
        </label>
        <input
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="John Doe"
          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label htmlFor="comment" className="text-sm font-medium text-foreground/80 mb-2 block">
          Your review *
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this agency..."
          required
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting || rating === 0 || !comment.trim()}
        className="w-full cursor-pointer"
      >
        {submitting ? (
          <>
            <LoadingSpinner size="sm" />
            Submitting...
          </>
        ) : (
          "Submit review"
        )}
      </Button>
    </motion.form>
  );
}
