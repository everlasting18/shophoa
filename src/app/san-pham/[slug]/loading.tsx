import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-1.5 mb-6">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Product main */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 mb-16">
        {/* Gallery skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-2.5">
            <Skeleton className="w-[72px] h-[72px] rounded-xl" />
            <Skeleton className="w-[72px] h-[72px] rounded-xl" />
            <Skeleton className="w-[72px] h-[72px] rounded-xl" />
            <Skeleton className="w-[72px] h-[72px] rounded-xl" />
          </div>
        </div>

        {/* Info skeleton */}
        <div className="flex flex-col gap-5">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-12 w-32 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Description skeleton */}
      <div className="max-w-3xl mb-16">
        <Skeleton className="h-6 w-40 mb-5" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-4/6 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
