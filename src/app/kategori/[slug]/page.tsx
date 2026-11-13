import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import ProductFilters from "@/components/ProductFilters";
import EmptyState from "@/components/EmptyState";
import { getProducts, getCategories, getCategoryBySlug } from "@/lib/data";

export const instant = false;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string; q?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const sort = (sp.sort as "newest" | "price_asc" | "price_desc") ?? "newest";
  const page = Number(sp.page ?? "1") || 1;
  const result = await getProducts({ category: slug, sort, page, limit: 12 });
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6 md:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Beranda</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">{category.name}</h1>
      {category.description && (
        <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
      )}

      <div className="mt-6">
        <ProductFilters categories={categories} />
      </div>

      <div className="mt-6">
        {result.data.length === 0 ? (
          <EmptyState title="Belum ada produk di kategori ini" description="Coba kategori lain." />
        ) : (
          <ProductGrid products={result.data} />
        )}
      </div>
    </div>
  );
}