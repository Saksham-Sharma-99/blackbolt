"use client";

import { motion } from "framer-motion";

type ComicButtonVariant = "primary" | "secondary" | "ghost";
type ComicButtonSize = "sm" | "md" | "lg";

interface ComicButtonProps {
  variant?: ComicButtonVariant;
  size?: ComicButtonSize;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}

const variantStyles: Record<ComicButtonVariant, string> = {
  primary:
    "bg-[var(--comic-red)] text-white border-[var(--comic-border-color)] hover:bg-[#c62828] shadow-[3px_3px_0px_rgba(0,0,0,0.5)]",
  secondary:
    "bg-[var(--comic-yellow)] text-[#1a1a1a] border-[var(--comic-border-color)] hover:bg-[#f9a825] shadow-[3px_3px_0px_rgba(0,0,0,0.5)]",
  ghost:
    "bg-transparent text-[var(--comic-ink)] border-[var(--comic-border-color)] hover:bg-[var(--comic-paper-light)] shadow-none",
};

const sizeStyles: Record<ComicButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm border-2",
  md: "px-5 py-2.5 text-base border-3",
  lg: "px-7 py-3.5 text-lg border-4",
};

export function ComicButton({
  variant = "primary",
  size = "md",
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  "aria-label": ariaLabel,
}: ComicButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center justify-center gap-2
        font-bangers tracking-wide uppercase
        border-solid rounded-sm cursor-pointer
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      whileHover={disabled ? {} : { scale: 1.05, boxShadow: "5px 5px 0px rgba(0,0,0,0.6)" }}
      whileTap={disabled ? {} : { scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}
