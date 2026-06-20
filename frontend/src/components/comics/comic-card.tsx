"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Image as ImageIcon } from "lucide-react";
import { StatusBadge } from "@/components/comics/status-badge";
import type { ProjectListItem } from "@/lib/api";

interface ComicCardProps {
  project: ProjectListItem;
}

export function ComicCard({ project }: ComicCardProps) {
  const { id, name, status, thumbnail_url, page_count, is_public, updated_at } = project;

  // Random rotation between -1 and 1 degrees, stable per card
  const rotation = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash << 5) - hash + id.charCodeAt(i);
      hash |= 0;
    }
    return (hash % 200) / 100; // -1 to 1
  }, [id]);

  const hasThumbnail = !!thumbnail_url && thumbnail_url.startsWith("http");

  return (
    <Link href={`/projects/${id}`} className="block">
      <motion.div
        style={{ rotate: `${rotation}deg` }}
        whileHover={{ scale: 1.04, rotate: 0 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", damping: 15, stiffness: 300 }}
      >
        <div className="bg-[var(--comic-surface)] border-4 border-[var(--comic-border-color)] rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,0.5)] overflow-hidden hover:shadow-[6px_6px_0px_rgba(0,0,0,0.6)] transition-shadow group">
          {/* Cover image */}
          <div className="relative aspect-[3/4] bg-[var(--comic-paper-light)] overflow-hidden">
            {hasThumbnail ? (
              <Image
                src={thumbnail_url}
                alt={`Cover of ${name}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--comic-muted)]">
                <ImageIcon className="w-12 h-12" />
                <span className="font-comic-neue text-sm">No cover</span>
              </div>
            )}

            {/* Featured badge */}
            {is_public && (
              <div className="absolute top-2 right-2 bg-[var(--comic-yellow)] border-2 border-[var(--comic-border-color)] rounded-full p-1.5 shadow-[2px_2px_0px_rgba(0,0,0,0.4)]">
                <Star
                  className="w-4 h-4 text-[#1a1a1a] fill-[#1a1a1a]"
                  aria-label="Featured comic"
                />
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="p-3 border-t-3 border-[var(--comic-border-color)]">
            <h3 className="font-bangers text-[var(--comic-ink)] text-lg leading-tight truncate mb-2">
              {name}
            </h3>
            <div className="flex items-center justify-between gap-2">
              <StatusBadge status={status} />
              {page_count != null && (
                <span className="font-comic-neue text-xs text-[var(--comic-muted)]">
                  {page_count} {page_count === 1 ? "page" : "pages"}
                </span>
              )}
            </div>
            {updated_at && (
              <p className="font-comic-neue text-xs text-[var(--comic-muted)] mt-2">
                Updated{" "}
                {new Date(updated_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
