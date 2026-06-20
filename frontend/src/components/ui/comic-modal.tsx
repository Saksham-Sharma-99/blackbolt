"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ComicModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function ComicModal({
  isOpen,
  onClose,
  title,
  children,
}: ComicModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative z-10 w-full max-w-md mx-4"
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 40 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="bg-[var(--comic-paper-mid)] border-4 border-[var(--comic-border-color)] rounded-sm shadow-[6px_6px_0px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Title bar */}
              <div className="bg-[var(--comic-red)] border-b-4 border-[var(--comic-border-color)] px-5 py-3 flex items-center justify-between">
                <h2 className="font-bangers text-white text-xl tracking-wide uppercase">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="text-white hover:text-[var(--comic-yellow)] text-2xl font-bold leading-none cursor-pointer transition-colors"
                >
                  &times;
                </button>
              </div>

              {/* Content */}
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
