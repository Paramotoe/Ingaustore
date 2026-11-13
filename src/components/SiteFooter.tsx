import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary font-bold">
                I
              </span>
              <span className="text-lg font-semibold tracking-tight">Ingaustore</span>
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
    </footer>
  );
}