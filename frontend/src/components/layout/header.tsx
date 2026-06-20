"use client";

import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--comic-paper-mid)] border-b-4 border-[var(--comic-border-color)]">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
        <UserMenu />
      </div>
    </header>
  );
}
