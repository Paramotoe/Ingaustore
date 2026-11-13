import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const thumb = product.images[0]?.url;
  const photoCount = product.images.length;

  return (
    <Link
      href={`/produk/${product.slug}`}
      className="group block overflow-hidden rounded-[20px] border border-border bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-focus-ring"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-elevated">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={product.images[0]?.altText ?? product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <span className="text-sm">Tanpa foto</span>
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-on-primary">
            Pilihan
          </span>
        )}
        {photoCount > 1 && (
          <span className="absolute right-3 bottom-3 rounded-full bg-surface/80 px-2 py-0.5 text-xs text-foreground backdrop-blur">
            {photoCount} foto
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground">{product.category.name}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-foreground">
          {product.name}
        </h3>
        <p className="mt-2 text-base font-bold text-primary">{formatRupiah(product.priceIdr)}</p>
      </div>
    </Link>
  );
}