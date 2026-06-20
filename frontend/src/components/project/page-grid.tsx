"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type PageGridProps = {
  pages: string[];
  loading?: boolean;
};

export function PageGrid({ pages, loading }: PageGridProps) {
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {pages.map((url, index) => (
        <motion.div
          key={index}
          className="comic-border-thin rounded-md overflow-hidden bg-[var(--comic-surface)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.03 }}
        >
          <Image
            src={url}
            alt={`Page ${index + 1}`}
            width={600}
            height={900}
            className="w-full h-auto"
          />
          <div className="px-2 py-1 text-xs font-bold text-center text-[var(--comic-muted)] bg-[var(--comic-paper-mid)]">
            Page {index + 1}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
