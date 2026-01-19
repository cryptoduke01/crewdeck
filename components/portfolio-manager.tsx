"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast/context";

interface PortfolioItem {
  id?: string;
  title: string;
  description: string;
  image: string;
  metrics: string;
}

interface PortfolioManagerProps {
  agencyId: string;
  initialItems?: PortfolioItem[];
  onSave: (items: PortfolioItem[]) => Promise<void>;
}

export function PortfolioManager({ agencyId, initialItems = [], onSave }: PortfolioManagerProps) {
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [saving, setSaving] = useState(false);
  const { success: showSuccess, error: showError } = useToast();

  const addItem = () => {
    setItems([...items, { title: "", description: "", image: "", metrics: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PortfolioItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(items);
      showSuccess("Portfolio saved!", "Your portfolio items have been saved.");
    } catch (err) {
      showError("Failed to save", err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Portfolio items</h3>
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </div>

      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg border border-border bg-card space-y-4"
          >
            <div className="flex items-start justify-between">
              <h4 className="font-medium">Item {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-1 rounded hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 text-foreground/60" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground/80 mb-2 block">
                  Title *
                </label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="Project name"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/80 mb-2 block">
                  Description
                </label>
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
                  placeholder="Project description..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/80 mb-2 block">
                  Metrics
                </label>
                <input
                  type="text"
                  value={item.metrics}
                  onChange={(e) => updateItem(index, "metrics", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  placeholder="e.g., +300% growth, 50K users"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/80 mb-2 block">
                  Image
                </label>
                <ImageUpload
                  agencyId={agencyId}
                  currentImageUrl={item.image}
                  onUploadComplete={(url) => updateItem(index, "image", url)}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {items.length === 0 && (
        <div className="text-center py-12 border border-border rounded-lg bg-card">
          <ImageIcon className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
          <p className="text-sm text-foreground/60 mb-4">No portfolio items yet</p>
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add your first item
          </Button>
        </div>
      )}

      {items.length > 0 && (
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full gap-2 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving portfolio...
            </>
          ) : (
            <>
              <Loader2 className="h-4 w-4" />
              Save portfolio
            </>
          )}
        </Button>
      )}
    </div>
  );
}
