"use client";

import { Check, Loader2, Clock } from "lucide-react";

type StepState = "done" | "loading" | "scheduled";

type WorkflowStep = {
  id: string;
  label: string;
  state: StepState;
};

type WorkflowSidebarProps = {
  steps: WorkflowStep[];
  selectedStepId: string;
  onStepClick: (stepId: string) => void;
};

export function WorkflowSidebar({
  steps,
  selectedStepId,
  onStepClick,
}: WorkflowSidebarProps) {
  return (
    <nav className="p-5">
      <h3
        className="font-[family-name:var(--font-bangers)] text-2xl text-[var(--comic-ink)] mb-6 uppercase tracking-wide italic"
        style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.5)" }}
      >
        Workflow
      </h3>

      <ul className="space-y-3">
        {steps.map((step) => {
          const isSelectable = step.state === "done" || step.state === "loading";
          const isSelected = selectedStepId === step.id;

          return (
            <li key={step.id}>
              <button
                onClick={() => isSelectable && onStepClick(step.id)}
                disabled={!isSelectable}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold
                  transition-all duration-200 border-3
                  ${step.state === "done"
                    ? `text-[var(--comic-green)] border-[var(--comic-green)]/30 ${isSelected ? "bg-[var(--comic-green)]/15 shadow-[3px_3px_0px_rgba(0,0,0,0.4)]" : "bg-[var(--comic-green)]/5 hover:bg-[var(--comic-green)]/10"}`
                    : ""
                  }
                  ${step.state === "loading"
                    ? `text-[var(--comic-blue)] border-[var(--comic-blue)]/30 ${isSelected ? "bg-[var(--comic-blue)]/15 shadow-[3px_3px_0px_rgba(0,0,0,0.4)]" : "bg-[var(--comic-blue)]/5 hover:bg-[var(--comic-blue)]/10"}`
                    : ""
                  }
                  ${step.state === "scheduled"
                    ? "text-[var(--comic-muted)] border-transparent bg-transparent cursor-default"
                    : "cursor-pointer"
                  }
                `}
              >
                {step.state === "done" && (
                  <Check size={20} className="text-[var(--comic-green)] shrink-0" />
                )}
                {step.state === "loading" && (
                  <Loader2
                    size={20}
                    className="text-[var(--comic-blue)] animate-spin shrink-0"
                  />
                )}
                {step.state === "scheduled" && (
                  <Clock size={20} className="text-[var(--comic-muted)] shrink-0" />
                )}
                <span className="font-bangers text-base tracking-wide">
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
