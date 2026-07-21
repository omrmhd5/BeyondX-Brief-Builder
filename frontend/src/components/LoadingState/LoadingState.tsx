import BezelCard from "../ui/BezelCard";

export default function LoadingState() {
  return (
    <BezelCard reveal={false} innerClassName="p-5">
      <div
        className="flex items-center gap-4"
        role="status"
        aria-live="polite"
        aria-busy="true">
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-300"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-zinc-300">
          Generating your brief…
        </p>
      </div>
    </BezelCard>
  );
}
