"use client";

/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PageInfo } from "@/lib/api";

type PageGridProps = {
  pages: PageInfo[];
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPageClick: (pageInfo: PageInfo) => void;
};

export function PageGrid({
  pages,
  currentPage,
  totalPages,
  total,
  perPage,
  loading,
  onPageChange,
  onPageClick,
}: PageGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-[var(--comic-ink)] border-t-transparent" />
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-[family-name:var(--font-bangers)] text-2xl text-[var(--comic-muted)]">
          Pages are being extracted...
        </p>
        <p className="text-sm text-[var(--comic-muted)] mt-2">
          This may take a moment for larger comics.
        </p>
      </div>
    );
  }

  const rangeStart = (currentPage - 1) * perPage + 1;
  const rangeEnd = Math.min(currentPage * perPage, total);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
        {pages.map((pageInfo, index) => (
          <motion.div
            key={pageInfo.id}
            className="comic-border-thin rounded-md overflow-hidden bg-[var(--comic-surface)] cursor-pointer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => onPageClick(pageInfo)}
          >
            <img
              src={pageInfo.url}
              alt={`Page ${pageInfo.page_number}`}
              className="w-full h-auto"
            />
            <div className="px-2 py-1 text-xs font-bold text-center text-[var(--comic-muted)] bg-[var(--comic-paper-mid)]">
              Page {pageInfo.page_number}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4 border-t border-[var(--comic-border-color)]">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold rounded-md border-2 border-[var(--comic-border-color)] bg-[var(--comic-surface)] text-[var(--comic-ink)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--comic-paper-mid)] transition-colors"
          >
            <ChevronLeft size={16} />
            Prev
          </button>
          <span className="text-sm text-[var(--comic-muted)]">
            Showing {rangeStart}–{rangeEnd} of {total}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold rounded-md border-2 border-[var(--comic-border-color)] bg-[var(--comic-surface)] text-[var(--comic-ink)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--comic-paper-mid)] transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
