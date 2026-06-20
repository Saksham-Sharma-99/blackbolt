"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ComicsGrid } from "@/components/comics/comics-grid";
import { UploadModal } from "@/components/upload/upload-modal";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { api, type ProjectListItem } from "@/lib/api";

export default function Home() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const publicProjects = await api.getPublicProjects();
        let userProjects: ProjectListItem[] = [];

        if (session?.user) {
          try {
            userProjects = await api.getUserProjects();
          } catch {
            // Not authenticated or error — just show public
          }
        }

        // Merge: user projects first, then public ones not already in user's list
        const userIds = new Set(userProjects.map((p) => p.id));
        const merged = [
          ...userProjects,
          ...publicProjects.filter((p) => !userIds.has(p.id)),
        ];
        setProjects(merged);
      } catch {
        // API might not be running yet
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [session]);

  const handleUploadClick = useCallback(() => {
    if (!session?.user) {
      setShowSignIn(true);
    } else {
      setShowUpload(true);
    }
  }, [session]);

  return (
    <div className="flex flex-col min-h-full">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24">
          {/* Ben-Day dots background */}
          <div className="absolute inset-0 ben-day-dots" />

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <motion.h1
              className="font-[family-name:var(--font-bangers)] text-5xl md:text-7xl text-[var(--comic-red)] comic-text-shadow mb-6 leading-tight"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Turn Comics Into
              <br />
              Audio Experiences
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-[var(--comic-ink)] mb-8 max-w-2xl mx-auto leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Upload your comics and listen to them with AI-generated character
              voices, ambient audio, and music.
            </motion.p>

            <motion.button
              onClick={handleUploadClick}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--comic-red)] text-white font-[family-name:var(--font-bangers)] text-2xl comic-border rounded-lg hover:bg-[#c62828] transition-colors cursor-pointer"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload size={28} />
              Upload Comic
            </motion.button>
          </div>
        </section>

        {/* Comics Grid Section */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="font-[family-name:var(--font-bangers)] text-3xl text-[var(--comic-ink)] mb-8">
            {session?.user ? "Your Comics" : "Featured Comics"}
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-[var(--comic-ink)] border-t-transparent" />
            </div>
          ) : (
            <ComicsGrid projects={projects} />
          )}
        </section>
      </main>

      <Footer />

      {/* Modals */}
      <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} />
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </div>
  );
}
