"use client";

import { ComicCard } from "@/components/comics/comic-card";
import type { ProjectListItem } from "@/lib/api";

interface ComicsGridProps {
  projects: ProjectListItem[];
}

export function ComicsGrid({ projects }: ComicsGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p
          className="font-bangers text-2xl text-[var(--comic-muted)] text-center"
          style={{
            textShadow: "1px 1px 0px rgba(0,0,0,0.3)",
          }}
        >
          No comics yet!
        </p>
        <p className="font-comic-neue text-[var(--comic-muted)] text-center mt-2">
          Upload your first comic above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {projects.map((project) => (
        <ComicCard key={project.id} project={project} />
      ))}
    </div>
  );
}
