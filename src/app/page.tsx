import HeroSection from "@/components/HeroSection";
import CategoryStrip from "@/components/CategoryStrip";
import CollectionCard from "@/components/CollectionCard";
import ProductGrid from "@/components/ProductGrid";
import ProductFilters from "@/components/ProductFilters";
import EmptyState from "@/components/EmptyState";
import { getProducts, getCategories } from "@/lib/data";
import { featuredProducts } from "@/lib/data";

export default function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string; sort?: string; q?: string; featured?: string }>;
}) {
  // searchParams is a Promise in Next.js 16; resolve synchronously via await in server component
  return <HomeContent searchParamsPromise={searchParams} />;
}

async function HomeContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ search?: string; category?: string; page?: string; sort?: string; q?: string; featured?: string }>;
}) {
  const sp = await searchParamsPromise;
  const search = sp.search ?? sp.q ?? "";
  const category = sp.category ?? "";
  const sort = (sp.sort as "newest" | "price_asc" | "price_desc") ?? "newest";
  const page = Number(sp.page ?? "1") || 1;
  const limit = 12;

  const result = await getProducts({ search, category, sort, page, limit });
  const categories = await getCategories();
  const featured = await featuredProducts();

  const collections = [
    { title: "Tech Essentials", description: "Gadget dan aksesori pilihan", image: "https://picsum.photos/seed/tech/600/400", href: "/kategori/elektronik" },
    { title: "Beauty Ritual", description: "Perawatan dan kecantikan", image: "https://picsum.photos/seed/beauty/600/400", href: "/kategori/beauty" },
    { title: "Home Comfort", description: "Kenyamanan rumah", image: "https://picsum.photos/seed/home/600/400", href: "/kategori/home" },
    { title: "Everyday Style", description: "Gaya hidup sehari-hari", image: "https://picsum.photos/seed/style/600/400", href: "/kategori/fashion" },
  ].filter((c) => categories.some((cat) => c.href.includes(cat.slug)));

  return (
    <div>
      <HeroSection products={featured.length ? featured : result.data.slice(0, 4)} />

      <div id="kategori" className="py-6">
        <CategoryStrip categories={categories} />
      </div>

      {collections.length > 0 && (
        <section id="koleksi" className="mx-auto max-w-[1280px] px-4 py-10 md:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Koleksi Pilihan</h2>
          <p className="mt-1 text-sm text-muted-foreground">Shortcut ke kategori favoritmu.</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {collections.map((c) => (
              <CollectionCard key={c.title} {...c} />
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-4 py-10 md:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Pilihan Ingaustore</h2>
          <p className="mt-1 text-sm text-muted-foreground">Produk unggulan pilihan kami.</p>
          <div className="mt-6">
            <ProductGrid products={featured} />
          </div>
        </section>
      )}

      <section id="semua-produk" className="mx-auto max-w-[1280px] px-4 py-10 md:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Temukan Pilihanmu</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.pagination.total} hasil ditemukan
            </p>
          </div>
        </div>

        <div className="mt-6">
          <ProductFilters categories={categories} />
        </div>

        <div className="mt-6">
          {result.data.length === 0 ? (
            <EmptyState
              title="Tidak ada produk ditemukan"
              description="Coba ubah kata kunci atau filter kategori."
            />
          ) : (
            <ProductGrid products={result.data} />
          )}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Pagination page={result.pagination.page} totalPages={result.pagination.totalPages} search={search} category={category} sort={sort} />
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-12 md:px-6">
        <div className="rounded-3xl border border-border bg-surface p-8 md:p-12">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Pilihan menarik, detail yang jelas.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Jelajahi tanpa akun", "Lihat foto dan detail", "Buka marketplace pilihan"].map((t) => (
              <div key={t} className="flex items-center gap-3 rounded-xl bg-surface-elevated px-4 py-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  ✓
                </span>
                <span className="text-sm font-medium text-foreground">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Pagination({ page, totalPages, search, category, sort }: { page: number; totalPages: number; search: string; category: string; sort: string }) {
  const build = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    if (sort && sort !== "newest") params.set("sort", sort);
    params.set("page", String(p));
    return `?${params.toString()}`;
  };
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  return (
    <div className="flex items-center gap-2">
      {prev ? (
        <a
          href={build(prev)}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-surface-elevated"
        >
          Sebelumnya
        </a>
      ) : (
        <span className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm text-muted-foreground opacity-50">
          Sebelumnya
        </span>
      )}
      <span className="text-sm text-muted-foreground">
        Halaman {page} dari {totalPages}
      </span>
      {next ? (
        <a
          href={build(next)}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-surface-elevated"
        >
          Berikutnya
        </a>
      ) : (
        <span className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm text-muted-foreground opacity-50">
          Berikutnya
        </span>
      )}
    </div>
  );
}