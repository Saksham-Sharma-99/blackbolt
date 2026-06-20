"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileWarning, Check, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

type UploadStep = "idle" | "creating" | "uploading" | "confirming" | "done" | "error";

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<UploadStep>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep("idle");
    setProgress(0);
    setError(null);
    setFileName(null);
  }, []);

  const handleClose = useCallback(() => {
    if (step === "uploading" || step === "creating" || step === "confirming") return;
    reset();
    onClose();
  }, [step, reset, onClose]);

  const handleUpload = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setError(null);

      try {
        // Step 1: Create project
        setStep("creating");
        const { project_id, presigned_url } = await api.createProject(file.name);

        // Step 2: Upload to S3
        setStep("uploading");
        await api.uploadToPresignedUrl(presigned_url, file, setProgress);

        // Step 3: Confirm upload
        setStep("confirming");
        await api.confirmUpload(project_id);

        // Step 4: Done!
        setStep("done");
        setTimeout(() => {
          onClose();
          reset();
          router.push(`/projects/${project_id}`);
        }, 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setStep("error");
      }
    },
    [onClose, reset, router]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        setError("File too large. Maximum size is 100 MB.");
        setStep("error");
        return;
      }

      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files are supported.");
        setStep("error");
        return;
      }

      handleUpload(file);
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: step !== "idle" && step !== "error",
  });

  const stepMessages: Record<UploadStep, string> = {
    idle: "Drop your comic here!",
    creating: "Creating project...",
    uploading: `Uploading to vault... ${progress}%`,
    confirming: "Processing...",
    done: "Upload complete!",
    error: error || "Something went wrong",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg comic-border bg-[var(--comic-paper-mid)] rounded-lg overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            {/* Title bar */}
            <div className="bg-[var(--comic-red)] px-6 py-3 border-b-3 border-[var(--comic-border-color)]">
              <h2 className="font-[family-name:var(--font-bangers)] text-2xl text-white comic-text-shadow">
                UPLOAD COMIC
              </h2>
            </div>

            {/* Drop zone */}
            <div className="p-6">
              <div
                {...getRootProps()}
                className={`
                  relative flex flex-col items-center justify-center
                  min-h-[240px] rounded-lg cursor-pointer
                  border-3 border-dashed transition-colors
                  ${
                    isDragActive
                      ? "border-[var(--comic-blue)] bg-[var(--comic-blue)]/10"
                      : "border-[var(--comic-border-color)] bg-[var(--comic-surface)]"
                  }
                  ${step !== "idle" && step !== "error" ? "pointer-events-none opacity-70" : ""}
                `}
              >
                <input {...getInputProps()} />

                {/* Ben-Day dots background */}
                <div className="absolute inset-0 ben-day-dots rounded-lg" />

                <div className="relative z-10 flex flex-col items-center gap-4 p-8 text-center">
                  {step === "idle" && (
                    <>
                      <Upload
                        size={48}
                        className="text-[var(--comic-ink)]"
                      />
                      <p className="font-[family-name:var(--font-bangers)] text-xl text-[var(--comic-ink)]">
                        {isDragActive ? "DROP IT!" : "Drag PDF here"}
                      </p>
                      <p className="text-sm text-[var(--comic-muted)]">
                        or click to browse (PDF, max 100 MB)
                      </p>
                    </>
                  )}

                  {(step === "creating" ||
                    step === "uploading" ||
                    step === "confirming") && (
                    <>
                      <Loader2
                        size={48}
                        className="text-[var(--comic-blue)] animate-spin"
                      />
                      <p className="font-[family-name:var(--font-bangers)] text-xl text-[var(--comic-ink)]">
                        {stepMessages[step]}
                      </p>
                      {fileName && (
                        <p className="text-sm text-[var(--comic-muted)]">{fileName}</p>
                      )}
                      {step === "uploading" && (
                        <div className="w-full max-w-xs h-4 bg-[var(--comic-paper-light)] rounded-full overflow-hidden comic-border-thin">
                          <motion.div
                            className="h-full bg-[var(--comic-blue)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {step === "done" && (
                    <>
                      <Check
                        size={48}
                        className="text-[var(--comic-green)]"
                      />
                      <p className="font-[family-name:var(--font-bangers)] text-xl text-[var(--comic-green)]">
                        UPLOAD COMPLETE!
                      </p>
                    </>
                  )}

                  {step === "error" && (
                    <>
                      <FileWarning
                        size={48}
                        className="text-[var(--comic-red)]"
                      />
                      <p className="font-[family-name:var(--font-bangers)] text-lg text-[var(--comic-red)]">
                        {error}
                      </p>
                      <p className="text-sm text-[var(--comic-muted)]">
                        Click or drag to try again
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Close button */}
            {(step === "idle" || step === "error" || step === "done") && (
              <div className="px-6 pb-6 flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-bold text-[var(--comic-muted)] hover:text-[var(--comic-red)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
