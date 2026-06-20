"use client";

import { motion } from "framer-motion";

export function ComicLoader({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="relative">
        {/* Spinning ring */}
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-[var(--comic-border-color)] border-t-[var(--comic-blue)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner dot bounce */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.5 }}
          animate={{ scale: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-3 h-3 rounded-full bg-[var(--comic-blue)]" />
        </motion.div>
      </div>

      <div className="text-center space-y-1">
        <p className="font-[family-name:var(--font-bangers)] text-2xl text-[var(--comic-blue)] tracking-wide">
          Processing {label}...
        </p>
        <p className="font-comic-neue text-sm text-[var(--comic-muted)]">
          Our AI crew is hard at work
        </p>
      </div>
    </div>
  );
}
