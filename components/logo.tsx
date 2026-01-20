"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface LogoProps {
  variant?: "standalone" | "with-text";
  size?: number;
  className?: string;
}

export function Logo({ variant = "with-text", size, className = "" }: LogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`h-8 w-24 ${className}`} />;
  }

  const isDark = theme === "dark";
  const height = size || (variant === "standalone" ? 32 : 28);

  if (variant === "standalone") {
    return (
      <Image
        src={
          isDark
            ? "/crewdeck/svgs/logo-standalones/crewdeck-white-logo.svg"
            : "/crewdeck/svgs/logo-standalones/crewdeck-black-logo.svg"
        }
        alt="crewdeck"
        width={height}
        height={height}
        className={className}
        priority
      />
    );
  }

  return (
    <Image
      src={
        isDark
          ? "/crewdeck/svgs/logos-with-texts/crewdeck-logo-text-white.svg"
          : "/crewdeck/svgs/logos-with-texts/crewdeck-logo-text-black.svg"
      }
      alt="crewdeck"
      width={size || 140}
      height={height}
      className={className}
      priority
    />
  );
}
