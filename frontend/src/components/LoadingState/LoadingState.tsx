import BezelCard from "../ui/BezelCard";

function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}
    />
  );
}

function BriefSummarySkeleton() {
  return (
    <BezelCard reveal={false} innerClassName="">
      <div className="p-6 sm:p-8" aria-hidden="true">
        <div className="mb-5 flex flex-wrap gap-2">
          <SkeletonBar className="h-5 w-32" />
          <SkeletonBar className="h-5 w-16 rounded-full" />
        </div>
        <SkeletonBar className="h-8 w-[85%]" />
        <div className="mt-6">
          <SkeletonBar className="h-3 w-24" />
          <div className="mt-3 space-y-2.5">
            <SkeletonBar className="h-4 w-full" />
            <SkeletonBar className="h-4 w-full" />
            <SkeletonBar className="h-4 w-[92%]" />
            <SkeletonBar className="h-4 w-[78%]" />
          </div>
        </div>
        <div className="mt-6">
          <SkeletonBar className="h-3 w-36" />
          <div className="mt-3 space-y-2">
            <SkeletonBar className="h-4 w-full" />
            <SkeletonBar className="h-4 w-[88%]" />
          </div>
        </div>
      </div>
    </BezelCard>
  );
}

function DiscoveryQuestionsSkeleton() {
  return (
    <BezelCard reveal={false} innerClassName="">
      <div className="p-6 sm:p-8" aria-hidden="true">
        <SkeletonBar className="h-5 w-44" />
        <SkeletonBar className="mt-2 h-4 w-56" />
        <ol className="mt-6 space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <li key={i} className="flex gap-4">
              <SkeletonBar className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <SkeletonBar className="h-4 w-full" />
                <SkeletonBar className="h-4 w-[70%]" />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </BezelCard>
  );
}

export default function LoadingState() {
  return (
    <div
      className="grid gap-8 lg:grid-cols-2"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Generating your brief">
      <span className="sr-only">Generating your brief…</span>
      <BriefSummarySkeleton />
      <DiscoveryQuestionsSkeleton />
    </div>
  );
}
