"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/header";
import { WorkflowSidebar } from "@/components/project/workflow-sidebar";
import { PageGrid } from "@/components/project/page-grid";
import { PageLightbox } from "@/components/project/page-lightbox";
import { ComicLoader } from "@/components/project/comic-loader";
import { api, type ProjectDetail, type PageInfo } from "@/lib/api";

const POLL_INTERVAL = 4000;
const PAGES_PER_PAGE = 20;

function getStepState(
  stepId: string,
  status: string,
  progress: Record<string, string>,
): "done" | "loading" | "scheduled" {
  switch (stepId) {
    case "upload": {
      if (progress?.extraction === "processing") return "loading";
      if (progress?.extraction === "complete") return "done";
      if (status === "analyzing" || status === "producing") return "done";
      return "scheduled";
    }
    case "characters": {
      // Scheduled while extraction is still processing
      if (progress?.extraction === "processing") return "scheduled";
      // Loading once extraction is done but character detection hasn't finished
      if (status === "analyzing" && progress?.extraction === "complete") return "loading";
      if (progress?.characters === "complete" || status === "character_review") return "done";
      if (status !== "draft" && status !== "analyzing") return "done";
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

function computeInitialStep(
  status: string,
  progress: Record<string, string>,
): string {
  const stepIds = ["upload", "characters", "dialogue", "preview"];
  const states = stepIds.map((id) => ({
    id,
    state: getStepState(id, status, progress),
  }));
  const loading = states.find((s) => s.state === "loading");
  if (loading) return loading.id;
  const lastDone = [...states].reverse().find((s) => s.state === "done");
  return lastDone?.id ?? "upload";
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
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [paginationPage, setPaginationPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [totalPaginationPages, setTotalPaginationPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fetchPages = useCallback(async (page: number) => {
    setPagesLoading(true);
    try {
      const data = await api.getProjectPages(projectId, page, PAGES_PER_PAGE);
      setPages(data.pages);
      setTotalPageCount(data.total);
      setTotalPaginationPages(data.total_pages);
      setPaginationPage(data.page);
    } catch {
      // ignore
    } finally {
      setPagesLoading(false);
    }
  }, [projectId]);

  // Initial fetch — also computes the initial selected step
  useEffect(() => {
    async function init() {
      const projectData = await api.getProject(projectId).catch(() => null);
      if (projectData) {
        setProject(projectData);
        setSelectedStepId(
          computeInitialStep(projectData.status, projectData.pipeline_progress)
        );
      }
      setLoading(false);
      await fetchPages(1);
    }
    init();
  }, [projectId, fetchPages]);

  // Poll for updates while processing — also re-fetches pages
  useEffect(() => {
    if (!project) return;
    if (project.status !== "analyzing" && project.status !== "producing")
      return;

    const interval = setInterval(async () => {
      try {
        const [updated, pagesData] = await Promise.all([
          api.getProject(projectId),
          api.getProjectPages(projectId, paginationPage, PAGES_PER_PAGE),
        ]);
        setProject(updated);
        setPages(pagesData.pages);
        setTotalPageCount(pagesData.total);
        setTotalPaginationPages(pagesData.total_pages);
      } catch {
        // ignore
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [project?.status, projectId, paginationPage, fetchPages]);

  const activeStepId = selectedStepId ?? "upload";

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
  }, [project]);

  const handleLightboxNavigate = useCallback(
    async (direction: "prev" | "next") => {
      if (lightboxIndex === null) return;

      if (direction === "next") {
        if (lightboxIndex < pages.length - 1) {
          setLightboxIndex(lightboxIndex + 1);
        } else if (paginationPage < totalPaginationPages) {
          await fetchPages(paginationPage + 1);
          setLightboxIndex(0);
        }
      } else {
        if (lightboxIndex > 0) {
          setLightboxIndex(lightboxIndex - 1);
        } else if (paginationPage > 1) {
          await fetchPages(paginationPage - 1);
          setLightboxIndex(PAGES_PER_PAGE - 1);
        }
      }
    },
    [lightboxIndex, pages.length, paginationPage, totalPaginationPages, fetchPages]
  );

  function renderContent() {
    const charState = workflowSteps.find((s) => s.id === "characters")?.state;
    const scriptState = workflowSteps.find((s) => s.id === "dialogue")?.state;
    const previewState = workflowSteps.find((s) => s.id === "preview")?.state;

    switch (activeStepId) {
      case "upload":
        if (pagesLoading && pages.length === 0) {
          return <ComicLoader label="uploaded pages" />;
        }
        return (
          <PageGrid
            pages={pages}
            currentPage={paginationPage}
            totalPages={totalPaginationPages}
            total={totalPageCount}
            perPage={PAGES_PER_PAGE}
            loading={pagesLoading && pages.length === 0}
            onPageChange={(newPage) => fetchPages(newPage)}
            onPageClick={(pageInfo) => {
              const idx = pages.findIndex((p) => p.id === pageInfo.id);
              setLightboxIndex(idx >= 0 ? idx : 0);
            }}
          />
        );

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
        return (
          <PageGrid
            pages={pages}
            currentPage={paginationPage}
            totalPages={totalPaginationPages}
            total={totalPageCount}
            perPage={PAGES_PER_PAGE}
            loading={pagesLoading}
            onPageChange={(newPage) => fetchPages(newPage)}
            onPageClick={(pageInfo) => {
              const idx = pages.findIndex((p) => p.id === pageInfo.id);
              setLightboxIndex(idx >= 0 ? idx : 0);
            }}
          />
        );
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
        {/* Workflow Sidebar */}
        <aside className="w-64 shrink-0 border-r-3 border-[var(--comic-border-color)] bg-[var(--comic-paper)] overflow-y-auto">
          <WorkflowSidebar
            steps={workflowSteps}
            selectedStepId={activeStepId}
            onStepClick={(id) => setSelectedStepId(id)}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto min-h-0">
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

          {renderContent()}
        </main>
      </div>

      {/* Lightbox overlay */}
      <AnimatePresence>
        {lightboxIndex !== null && pages.length > 0 && (
          <PageLightbox
            pages={pages}
            currentIndex={lightboxIndex}
            totalPages={totalPageCount}
            onNavigate={handleLightboxNavigate}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
