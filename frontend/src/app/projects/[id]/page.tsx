"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { WorkflowSidebar } from "@/components/project/workflow-sidebar";
import { PageGrid } from "@/components/project/page-grid";
import { ComicLoader } from "@/components/project/comic-loader";
import { api, type ProjectDetail } from "@/lib/api";

const POLL_INTERVAL = 4000;

function getStepState(
  stepId: string,
  status: string,
  progress: Record<string, string>,
): "done" | "loading" | "scheduled" {
  switch (stepId) {
    case "upload":
      return "done";
    case "characters": {
      if (status === "analyzing" || progress?.extraction === "processing") return "loading";
      if (progress?.extraction === "complete" || status !== "draft") return "done";
      return "scheduled";
    }
    case "dialogue": {
      if (progress?.script === "processing") return "loading";
      if (progress?.script === "complete") return "done";
      return "scheduled";
    }
    case "preview": {
      if (
        progress?.audio === "processing" ||
        progress?.preview === "processing"
      )
        return "loading";
      if (progress?.audio === "complete" || progress?.preview === "complete")
        return "done";
      return "scheduled";
    }
    default:
      return "scheduled";
  }
}

const FALLBACK_STEPS = [
  { id: "upload", label: "Upload", state: "done" as const },
  { id: "characters", label: "Characters", state: "scheduled" as const },
  { id: "dialogue", label: "Dialogue Script", state: "scheduled" as const },
  { id: "preview", label: "Preview", state: "scheduled" as const },
];

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [selectedStepId, setSelectedStepId] = useState<string>("upload");
  const userClickedRef = useRef(false);
  const didAutoSelect = useRef(false);

  // Initial fetch
  useEffect(() => {
    async function init() {
      const [projectData, pagesData] = await Promise.all([
        api.getProject(projectId).catch(() => null),
        api
          .getProjectPages(projectId)
          .then((d) => d.pages)
          .catch(() => []),
      ]);
      if (projectData) setProject(projectData);
      setPages(pagesData);
      setLoading(false);
      setPagesLoading(false);
    }
    init();
  }, [projectId]);

  // Poll for updates while processing
  useEffect(() => {
    if (!project) return;
    if (project.status !== "analyzing" && project.status !== "producing")
      return;

    const interval = setInterval(async () => {
      try {
        const updated = await api.getProject(projectId);
        setProject(updated);
        if (
          updated.status !== "analyzing" &&
          updated.status !== "producing"
        ) {
          const pagesData = await api
            .getProjectPages(projectId)
            .catch(() => ({ pages: [] }));
          setPages(pagesData.pages);
        }
      } catch {
        // ignore
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [project?.status, projectId]);

  // Auto-select the active step once on initial project data load
  useEffect(() => {
    if (!project || didAutoSelect.current) return;
    const states = [
      { id: "upload", state: getStepState("upload", project.status, project.pipeline_progress) },
      { id: "characters", state: getStepState("characters", project.status, project.pipeline_progress) },
      { id: "dialogue", state: getStepState("dialogue", project.status, project.pipeline_progress) },
      { id: "preview", state: getStepState("preview", project.status, project.pipeline_progress) },
    ];
    const activeIdx = states.findIndex((s) => s.state === "loading");
    if (activeIdx !== -1) {
      setSelectedStepId(states[activeIdx].id);
    } else {
      const lastDone = [...states].reverse().find((s) => s.state === "done");
      if (lastDone) setSelectedStepId(lastDone.id);
    }
    didAutoSelect.current = true;
  }, [project]);

  const workflowSteps = useMemo(() => {
    if (!project) return FALLBACK_STEPS;
    return [
      {
        id: "upload",
        label: "Upload",
        state: getStepState("upload", project.status, project.pipeline_progress),
      },
      {
        id: "characters",
        label: "Characters",
        state: getStepState("characters", project.status, project.pipeline_progress),
      },
      {
        id: "dialogue",
        label: "Dialogue Script",
        state: getStepState("dialogue", project.status, project.pipeline_progress),
      },
      {
        id: "preview",
        label: "Preview",
        state: getStepState("preview", project.status, project.pipeline_progress),
      },
    ];
  }, [project?.status, project?.pipeline_progress]);

  function renderContent() {
    const charState = workflowSteps.find((s) => s.id === "characters")?.state;
    const scriptState = workflowSteps.find((s) => s.id === "dialogue")?.state;
    const previewState = workflowSteps.find((s) => s.id === "preview")?.state;

    switch (selectedStepId) {
      case "upload":
        if (pagesLoading || pages.length === 0) {
          return <ComicLoader label="uploaded pages" />;
        }
        return <PageGrid pages={pages} />;

      case "characters":
        if (charState === "loading" || charState === "scheduled") {
          return <ComicLoader label="character detection" />;
        }
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-[family-name:var(--font-bangers)] text-2xl text-[var(--comic-ink)]">
              Character Workspace
            </p>
            <p className="text-sm text-[var(--comic-muted)] mt-2">
              Coming soon — identify and review comic characters here.
            </p>
          </div>
        );

      case "dialogue":
        if (scriptState === "loading" || scriptState === "scheduled") {
          return <ComicLoader label="dialogue extraction" />;
        }
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-[family-name:var(--font-bangers)] text-2xl text-[var(--comic-ink)]">
              Dialogue Script
            </p>
            <p className="text-sm text-[var(--comic-muted)] mt-2">
              Coming soon — review and edit dialogue lines here.
            </p>
          </div>
        );

      case "preview":
        if (previewState === "loading" || previewState === "scheduled") {
          return <ComicLoader label="preview generation" />;
        }
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-[family-name:var(--font-bangers)] text-2xl text-[var(--comic-ink)]">
              Preview & Export
            </p>
            <p className="text-sm text-[var(--comic-muted)] mt-2">
              Coming soon — listen to the final audio experience here.
            </p>
          </div>
        );

      default:
        return <PageGrid pages={pages} loading={pagesLoading} />;
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-[var(--comic-ink)] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="font-[family-name:var(--font-bangers)] text-2xl text-[var(--comic-red)]">
            Project not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="flex-1 flex min-h-0">
        {/* Workflow Sidebar — sticky, full height, non-scrolling */}
        <aside className="w-64 shrink-0 border-r-3 border-[var(--comic-border-color)] bg-[var(--comic-paper)] overflow-y-auto">
          <WorkflowSidebar
            steps={workflowSteps}
            selectedStepId={selectedStepId}
            onStepClick={(id) => {
              userClickedRef.current = true;
              setSelectedStepId(id);
            }}
          />
        </aside>

        {/* Main Content — scrollable */}
        <main className="flex-1 overflow-y-auto min-h-0">
          {/* Project header — sticky within main */}
          <div className="sticky top-0 z-10 border-b-3 border-[var(--comic-border-color)] bg-[var(--comic-paper-mid)] px-6 py-4">
            <h1 className="font-[family-name:var(--font-bangers)] text-3xl text-[var(--comic-ink)]">
              {project.name}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-[var(--comic-muted)]">
              <span>{project.page_count} pages</span>
              <span>
                Status:{" "}
                <span className="font-bold capitalize text-[var(--comic-ink)]">
                  {project.status.replace("_", " ")}
                </span>
              </span>
              {project.error_message && (
                <span className="text-[var(--comic-red)]">
                  Error: {project.error_message}
                </span>
              )}
            </div>
          </div>

          {/* Dynamic content based on selected step */}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
