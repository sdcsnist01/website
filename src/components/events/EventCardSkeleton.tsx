/** Loading placeholder that mirrors the EventCard layout so the list does not jump when data arrives. */
export default function EventCardSkeleton() {
  return (
    <div aria-hidden className="flex h-full flex-col overflow-hidden rounded-xl border border-[#e4ddd6] bg-white">
      <div className="aspect-[16/10] w-full animate-pulse bg-[#efeae4] motion-reduce:animate-none" />
      <div className="space-y-4 p-5 sm:p-6">
        <div className="h-5 w-3/4 animate-pulse rounded bg-[#efeae4] motion-reduce:animate-none" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#efeae4] motion-reduce:animate-none" />
        <div className="h-px w-full bg-[#e4ddd6]" />
        <div className="flex gap-6">
          <div className="h-8 w-20 animate-pulse rounded bg-[#efeae4] motion-reduce:animate-none" />
          <div className="h-8 w-20 animate-pulse rounded bg-[#efeae4] motion-reduce:animate-none" />
        </div>
        <div className="h-11 w-full animate-pulse rounded-full bg-[#efeae4] motion-reduce:animate-none" />
      </div>
    </div>
  );
}
