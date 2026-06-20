"use client";

import Link from "next/link";
import { Upload } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";

interface HeaderProps {
  onUploadClick?: () => void;
}

export function Header({ onUploadClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--comic-paper-mid)] border-b-4 border-[var(--comic-border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1" aria-label="BLACKBOLT home">
          <h1
            className="font-bangers text-3xl sm:text-4xl text-[var(--comic-red)] uppercase tracking-wider select-none"
            style={{
              textShadow:
                "2px 2px 0px rgba(0,0,0,0.7), 4px 4px 0px rgba(0,0,0,0.3)",
            }}
          >
            BLACKBOLT
          </h1>
        </Link>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {onUploadClick && (
            <button
              onClick={onUploadClick}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-[var(--comic-red)] text-white font-bangers text-sm uppercase tracking-wide border-3 border-[var(--comic-border-color)] rounded-sm shadow-[3px_3px_0px_rgba(0,0,0,0.5)] hover:bg-[#c62828] transition-colors cursor-pointer"
            >
              <Upload size={16} />
              Upload
            </button>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
