"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth/context";
import { Logo } from "./logo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center cursor-pointer">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
            >
              <Logo variant="with-text" size={120} className="h-7" />
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/agencies"
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
            >
              Aggregator
            </Link>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 cursor-pointer"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}
            {!authLoading && (
              user ? (
                <Link href="/dashboard/agency">
                  <Button size="sm" variant="default" className="cursor-pointer">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button size="sm" variant="default" className="cursor-pointer">
                    Join as Agency
                  </Button>
                </Link>
              )
            )}
          </div>

          <div className="flex md:hidden items-center gap-2">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 cursor-pointer"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}
            <button
              className="p-2 cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.3
                }}
                className="md:hidden py-4 space-y-4 border-t border-border relative z-50 bg-background"
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link
                    href="/agencies"
                    className="block text-sm font-medium text-foreground/70 hover:text-foreground transition-colors cursor-pointer py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Aggregator
                  </Link>
                </motion.div>
                {!authLoading && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    {user ? (
                      <Link href="/dashboard/agency" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full cursor-pointer"
                        >
                          Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full cursor-pointer"
                        >
                          Join as Agency
                        </Button>
                      </Link>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
