import ProductSkeleton from "@/components/ProductSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}