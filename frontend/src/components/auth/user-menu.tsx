"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { LogOut, ChevronDown } from "lucide-react";
import { ComicButton } from "@/components/ui/comic-button";
import { SignInModal } from "@/components/auth/sign-in-modal";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="w-9 h-9 rounded-full bg-[var(--comic-paper-light)] animate-pulse border-2 border-[var(--comic-border-color)]" />
    );
  }

  if (!session?.user) {
    return (
      <>
        <ComicButton
          variant="primary"
          size="sm"
          onClick={() => setIsSignInOpen(true)}
          aria-label="Sign in"
        >
          Sign In
        </ComicButton>
        <SignInModal
          isOpen={isSignInOpen}
          onClose={() => setIsSignInOpen(false)}
        />
      </>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 cursor-pointer group"
        aria-label="User menu"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "User avatar"}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full border-3 border-[var(--comic-border-color)] object-cover group-hover:border-[var(--comic-red)] transition-colors"
          />
        ) : (
          <div className="w-9 h-9 rounded-full border-3 border-[var(--comic-border-color)] bg-[var(--comic-yellow)] flex items-center justify-center font-bangers text-[#1a1a1a] text-lg group-hover:border-[var(--comic-red)] transition-colors">
            {(session.user.name ?? "U").charAt(0).toUpperCase()}
          </div>
        )}
        <ChevronDown
          className={`w-4 h-4 text-[var(--comic-ink)] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[var(--comic-paper-mid)] border-3 border-[var(--comic-border-color)] rounded-sm shadow-[4px_4px_0px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
          <div className="px-4 py-3 border-b-2 border-[var(--comic-border-color)]">
            <p className="font-bangers text-[var(--comic-ink)] text-sm truncate">
              {session.user.name ?? "Hero"}
            </p>
            <p className="font-comic-neue text-[var(--comic-muted)] text-xs truncate">
              {session.user.email}
            </p>
          </div>
          <button
            onClick={() => {
              setIsDropdownOpen(false);
              signOut();
            }}
            className="w-full flex items-center gap-2 px-4 py-3 font-comic-neue text-sm text-[var(--comic-red)] hover:bg-[var(--comic-paper-light)] cursor-pointer transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
