import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <section className="space-y-8 pt-12">
      <div className="space-y-3">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-44 rounded-2xl" />
        ))}
      </div>
    </section>
  );
}
