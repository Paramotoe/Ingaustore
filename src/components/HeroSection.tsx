import Link from "next/link";
import type { Product } from "@/lib/types";

export default function HeroSection({ products }: { products: Product[] }) {
  const cards = products.slice(0, 4);
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 md:px-6 md:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent">KURASI PILIHAN INGAUSTORE</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            Temukan yang cocok. Tampil lebih istimewa.
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground">
            Jelajahi koleksi pilihan dengan detail yang jelas, lalu temukan produk favoritmu di marketplace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="#semua-produk"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Jelajahi Produk
            </Link>
            <Link
              href="#kategori"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-elevated"
            >
              Lihat Koleksi
            </Link>
          </div>
        </div>

        <div className="relative lg:col-span-3">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent blur-2xl" />
          <div className="grid grid-cols-2 gap-4">
            {cards.map((p, i) => (
              <div
                key={p.id}
                className={`overflow-hidden rounded-2xl border border-border bg-surface shadow-sm ${
                  i === 0 ? "translate-y-2" : i === 3 ? "-translate-y-2" : ""
                }`}
              >
                <div className="aspect-[4/5] overflow-hidden bg-surface-elevated">
                  {p.images[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Tanpa foto</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}