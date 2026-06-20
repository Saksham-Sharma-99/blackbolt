"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PageInfo } from "@/lib/api";

type PageLightboxProps = {
  pages: PageInfo[];
  currentIndex: number;
  totalPages: number;
  onNavigate: (direction: "prev" | "next") => void;
  onClose: () => void;
};

export function PageLightbox({
  pages,
  currentIndex,
  totalPages,
  onNavigate,
  onClose,
}: PageLightboxProps) {
  const currentPage = pages[currentIndex] ?? null;
  const isFirst = !currentPage || currentPage.page_number <= 1;
  const isLast = !currentPage || currentPage.page_number >= totalPages;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && !isFirst) onNavigate("prev");
      if (e.key === "ArrowRight" && !isLast) onNavigate("next");
    },
    [onClose, onNavigate, isFirst, isLast]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!currentPage) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[var(--comic-paper)] text-[var(--comic-ink)] hover:bg-[var(--comic-paper-mid)] transition-colors"
      >
        <X size={24} />
      </button>

      {/* Page counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-[var(--comic-paper)] text-sm font-bold text-[var(--comic-ink)]">
        Page {currentPage.page_number} of {totalPages}
      </div>

      {/* Left arrow */}
      {!isFirst && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate("prev");
          }}
          className="absolute left-4 z-10 p-3 rounded-full bg-[var(--comic-paper)] text-[var(--comic-ink)] hover:bg-[var(--comic-paper-mid)] transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Main image */}
      <motion.div
        key={currentPage.id}
        className="relative max-w-[90vw] max-h-[85vh]"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentPage.url}
          alt={`Page ${currentPage.page_number}`}
          className="max-h-[85vh] w-auto object-contain rounded-md"
        />
      </motion.div>

      {/* Right arrow */}
      {!isLast && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate("next");
          }}
          className="absolute right-4 z-10 p-3 rounded-full bg-[var(--comic-paper)] text-[var(--comic-ink)] hover:bg-[var(--comic-paper-mid)] transition-colors"
        >
          <ChevronRight size={28} />
        </button>
      )}
    </motion.div>
  );
}
