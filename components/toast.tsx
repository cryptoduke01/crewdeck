"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    className: "bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-300",
    iconClassName: "text-green-700 dark:text-green-300",
  },
  error: {
    icon: AlertCircle,
    className: "bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-300",
    iconClassName: "text-red-700 dark:text-red-300",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    iconClassName: "text-yellow-600 dark:text-yellow-400",
  },
  info: {
    icon: Info,
    className: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    iconClassName: "text-blue-600 dark:text-blue-400",
  },
};

function ToastItem({ toast, onClose }: ToastProps) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const duration = toast.duration ?? 5000;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, toast.id, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm max-w-md min-w-[300px]",
        config.className
      )}
    >
      <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.iconClassName)} />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm mb-0.5">{toast.title}</div>
        {toast.description && (
          <div className="text-xs opacity-80 leading-relaxed">{toast.description}</div>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[10000] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
