"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast/context";

interface ImageUploadProps {
  agencyId: string;
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  folder?: string;
}

export function ImageUpload({ agencyId, onUploadComplete, currentImageUrl, folder = "portfolio" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success: showSuccess, error: showError } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showError("Invalid file type", "Please select an image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("File too large", "Please select an image smaller than 5MB.");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const supabase = createSupabaseClient();

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${agencyId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("portfolio-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // Check if bucket doesn't exist
        if (uploadError.message?.includes('bucket') || uploadError.message?.includes('not found')) {
          throw new Error("Storage bucket not found. Please create 'portfolio-images' bucket in Supabase Storage (see sql/setup-storage.sql)");
        }
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("portfolio-images")
        .getPublicUrl(filePath);

      showSuccess("Image uploaded!", "Your image has been uploaded successfully.");
      onUploadComplete(publicUrl);
    } catch (err) {
      console.error("Error uploading image:", err);
      showError("Upload failed", err instanceof Error ? err.message : "Failed to upload image");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onUploadComplete("");
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative group">
          <div className="relative w-32 h-32 rounded-xl border border-border bg-muted overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 backdrop-blur-sm border border-border hover:bg-background transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
              <LoadingSpinner size="lg" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-32 h-32 rounded-xl border-2 border-dashed border-border bg-muted hover:border-foreground/40 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <LoadingSpinner size="lg" />
              <p className="text-xs text-foreground/60">Uploading...</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-6 w-6 text-foreground/40" />
              <div className="text-center px-2">
                <p className="text-xs font-medium text-foreground/70">Click to upload</p>
                <p className="text-[10px] text-foreground/50 mt-0.5">PNG, JPG</p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}
