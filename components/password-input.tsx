"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  onStrengthChange?: (strength: number) => void;
  showStrengthBar?: boolean;
}

export function PasswordInput({ 
  id, 
  value, 
  onChange, 
  placeholder = "••••••••",
  required = false,
  onStrengthChange,
  showStrengthBar = true
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const calculateStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    return Math.min(strength, 5);
  };

  const strength = calculateStrength(value);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    if (onStrengthChange) {
      onStrengthChange(calculateStrength(e.target.value));
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/40" />
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          required={required}
          value={value}
          onChange={handleChange}
          className="w-full h-11 pl-10 pr-10 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors cursor-pointer"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {showStrengthBar && value.length > 0 && (
        <div className="space-y-1">
          <div className="flex gap-1 h-1.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-colors ${
                  i < strength
                    ? strengthColors[strength - 1] || strengthColors[0]
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-foreground/50">
            {value.length > 0
              ? strength > 0
                ? `Password strength: ${strengthLabels[strength - 1]}`
                : "Password strength: Very Weak"
              : ""}
          </p>
        </div>
      )}
    </div>
  );
}
