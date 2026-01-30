import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8f6f3] via-[#faf9f7] to-[#f5f3f0]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 text-center lg:text-left space-y-6">
            <Skeleton className="h-4 w-48 mx-auto lg:mx-0" />
            <Skeleton className="h-16 w-full max-w-md mx-auto lg:mx-0" />
            <Skeleton className="h-6 w-full max-w-sm mx-auto lg:mx-0" />
            <div className="flex gap-4 justify-center lg:justify-start pt-4">
              <Skeleton className="h-14 w-36" />
              <Skeleton className="h-14 w-36" />
            </div>
          </div>
          <div className="order-1 lg:order-2 flex justify-center">
            <Skeleton className="w-[300px] h-[500px] rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContentSkeleton() {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full max-w-md" />
            <Skeleton className="h-[1px] w-16" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function BenefitsSkeleton() {
  return (
    <section className="py-32 bg-[#1a1a1a]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 space-y-4">
          <Skeleton className="h-4 w-32 mx-auto bg-[#c9a962]/20" />
          <Skeleton className="h-12 w-64 mx-auto bg-[#c9a962]/20" />
          <Skeleton className="h-6 w-full max-w-lg mx-auto bg-[#c9a962]/20" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="p-8 border border-[#c9a962]/20 space-y-4">
              <Skeleton className="h-8 w-8 bg-[#c9a962]/20" />
              <Skeleton className="h-6 w-32 bg-[#c9a962]/20" />
              <Skeleton className="h-16 w-full bg-[#c9a962]/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GallerySkeleton() {
  return (
    <section className="py-32 bg-gradient-to-b from-background to-[#f8f6f3]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <Skeleton className="h-4 w-24 mx-auto" />
          <Skeleton className="h-12 w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="aspect-square" />
          <Skeleton className="aspect-[4/5] md:row-span-2" />
          <Skeleton className="aspect-square" />
          <Skeleton className="aspect-square" />
          <Skeleton className="aspect-square md:col-span-2" />
        </div>
      </div>
    </section>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="flex flex-col" role="status" aria-label="Loading page content">
      <HeroSkeleton />
      <ContentSkeleton />
      <BenefitsSkeleton />
      <GallerySkeleton />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
