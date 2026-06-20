export function Footer() {
  return (
    <footer className="w-full border-t-2 border-[var(--comic-border-color)] bg-[var(--comic-paper-mid)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center">
        <p className="font-comic-neue text-sm text-[var(--comic-muted)]">
          Made with{" "}
          <span className="font-bangers text-[var(--comic-red)] tracking-wide">
            BLACKBOLT
          </span>
        </p>
      </div>
    </footer>
  );
}
