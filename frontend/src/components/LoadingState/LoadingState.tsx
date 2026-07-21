export default function LoadingState() {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4"
      role="status"
      aria-live="polite"
      aria-busy="true">
      <div
        className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-indigo-800">
        Generating your brief…
      </p>
    </div>
  );
}
