import ProductGrid from "@/components/ProductGrid";
import EmptyState from "@/components/EmptyState";
import { getProducts } from "@/lib/data";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const sort = (sp.sort as "newest" | "price_asc" | "price_desc") ?? "newest";
  const page = Number(sp.page ?? "1") || 1;
  const result = await getProducts({ search: q, sort, page, limit: 12 });

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6 md:py-12">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Hasil pencarian{q ? `: "${q}"` : ""}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{result.pagination.total} hasil ditemukan</p>

      <div className="mt-6">
        {result.data.length === 0 ? (
          <EmptyState title="Tidak ada produk ditemukan" description="Coba kata kunci lain." />
        ) : (
          <ProductGrid products={result.data} />
        )}
      </div>
    </div>
  );
}