"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CLICK_WINDOW_MS = 2000;
const REQUIRED_CLICKS = 5;

export default function SiteFooter() {
  const router = useRouter();
  const [, setClicks] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setClicks(0);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const handleTrigger = useCallback(() => {
    setClicks((prev) => {
      const next = prev + 1;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => { setClicks(0); }, CLICK_WINDOW_MS);
      if (next >= REQUIRED_CLICKS) {
        setShowDialog(true);
        setClicks(0);
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      }
      return next;
    });
  }, []);

  // Keyboard shortcut: Ctrl+Alt+I (documented privately for site owner)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === "i" || e.key === "I")) {
        e.preventDefault();
        setShowDialog(true);
      }
      if (e.key === "Escape" && showDialog) {
        setShowDialog(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDialog]);

  // Focus management for dialog
  useEffect(() => {
    if (showDialog) {
      dialogRef.current?.focus();
    }
  }, [showDialog]);

  const confirm = () => {
    setShowDialog(false);
    router.push("/admin/login");
  };

  const cancel = () => {
    setShowDialog(false);
    reset();
    triggerRef.current?.focus();
  };

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <button
                ref={triggerRef}
                type="button"
                onClick={handleTrigger}
                aria-label="Ingaustore"
                className="inline-flex items-center gap-2 rounded-lg px-1 py-0.5 text-left focus:outline-none focus:ring-2 focus:ring-focus-ring"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary font-bold">
                  I
                </span>
                <span className="text-lg font-semibold tracking-tight">Ingaustore</span>
              </button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Katalog produk pilihan dengan detail yang jelas. Temukan produk favoritmu di marketplace.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Beranda</Link>
            <Link href="/#koleksi" className="hover:text-foreground">Koleksi</Link>
            <Link href="/#semua-produk" className="hover:text-foreground">Semua Produk</Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          © 2026 Ingaustore. Semua hak dilindungi.
        </p>
      </div>

      {showDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="internal-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={cancel}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl focus:outline-none"
          >
            <h2 id="internal-dialog-title" className="text-base font-semibold text-foreground">
              Lanjutkan ke area internal?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Anda akan diarahkan ke halaman masuk admin.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancel}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-surface-elevated"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirm}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary hover:opacity-90"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}