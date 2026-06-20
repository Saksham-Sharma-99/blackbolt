"use client";

import { Loader2 } from "lucide-react";

interface PipelineProgress {
  completed?: number;
  total?: number;
  currentPipeline?: string;
}

interface StatusBadgeProps {
  status: string;
  pipelineProgress?: PipelineProgress;
}

function getStatusConfig(status: string): {
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
} {
  switch (status.toLowerCase()) {
    case "draft":
      return {
        color: "text-[var(--comic-ink)]",
        bgColor: "bg-[var(--comic-paper-light)]",
        borderColor: "border-[var(--comic-border-color)]",
        label: "Draft",
      };
    case "analyzing":
      return {
        color: "text-[var(--comic-blue)]",
        bgColor: "bg-[var(--comic-blue)]/15",
        borderColor: "border-[var(--comic-blue)]",
        label: "Analyzing",
      };
    case "character_review_required":
      return {
        color: "text-[var(--comic-yellow)]",
        bgColor: "bg-[var(--comic-yellow)]/15",
        borderColor: "border-[var(--comic-yellow)]",
        label: "Character Review",
      };
    case "producing":
      return {
        color: "text-[var(--comic-blue)]",
        bgColor: "bg-[var(--comic-blue)]/15",
        borderColor: "border-[var(--comic-blue)]",
        label: "Producing",
      };
    case "scene_review_required":
      return {
        color: "text-[var(--comic-yellow)]",
        bgColor: "bg-[var(--comic-yellow)]/15",
        borderColor: "border-[var(--comic-yellow)]",
        label: "Scene Review",
      };
    case "ready":
      return {
        color: "text-[var(--comic-green)]",
        bgColor: "bg-[var(--comic-green)]/15",
        borderColor: "border-[var(--comic-green)]",
        label: "Ready",
      };
    case "published":
      return {
        color: "text-[var(--comic-green)]",
        bgColor: "bg-[var(--comic-green)]/15",
        borderColor: "border-[var(--comic-green)]",
        label: "Published",
      };
    case "failed":
      return {
        color: "text-[var(--comic-red)]",
        bgColor: "bg-[var(--comic-red)]/15",
        borderColor: "border-[var(--comic-red)]",
        label: "Failed",
      };
    default:
      return {
        color: "text-[var(--comic-ink)]",
        bgColor: "bg-[var(--comic-paper-light)]",
        borderColor: "border-[var(--comic-border-color)]",
        label: status,
      };
  }
}

export function StatusBadge({
  status,
  pipelineProgress,
}: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const isSpinning =
    status.toLowerCase() === "analyzing" ||
    status.toLowerCase() === "producing";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1
        font-comic-neue text-xs font-bold uppercase tracking-wide
        border-2 rounded-full
        ${config.color} ${config.bgColor} ${config.borderColor}
      `}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {isSpinning && <Loader2 className="w-3 h-3 animate-spin" />}
      {config.label}
      {pipelineProgress?.completed != null &&
        pipelineProgress?.total != null && (
          <span className="opacity-70">
            ({pipelineProgress.completed}/{pipelineProgress.total})
          </span>
        )}
    </span>
  );
}
