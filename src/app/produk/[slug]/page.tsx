import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import MarketplaceLinks from "@/components/MarketplaceLinks";
import ProductGrid from "@/components/ProductGrid";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";

export const instant = false;
import { formatRupiah } from "@/lib/format";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6 md:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Beranda</Link>
        <span className="mx-2">/</span>
        <Link href={`/kategori/${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          <p className="text-xs font-medium text-muted-foreground">{product.category.name}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">{product.name}</h1>
          {product.code && (
            <p className="mt-1 text-sm text-muted-foreground">Kode: {product.code}</p>
          )}
          <p className="mt-4 text-2xl font-bold text-primary">{formatRupiah(product.priceIdr)}</p>

          {product.description && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-foreground">Deskripsi</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>
          )}

          <MarketplaceLinks links={product.links} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Produk Terkait</h2>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}