import BezelCard from "../ui/BezelCard";

interface ErrorBannerProps {
  message?: string;
  fieldErrors?: Record<string, string>;
}

export default function ErrorBanner({
  message,
  fieldErrors,
}: ErrorBannerProps) {
  if (!message && (!fieldErrors || Object.keys(fieldErrors).length === 0)) {
    return null;
  }

  return (
    <BezelCard reveal={false} innerClassName="border border-red-400/20 p-5">
      <div role="alert" aria-live="assertive">
        {message && (
          <p className="text-sm font-medium text-red-300">{message}</p>
        )}
        {fieldErrors && Object.keys(fieldErrors).length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-red-300/90">
            {Object.entries(fieldErrors).map(([field, err]) => (
              <li key={field}>
                <span className="font-medium text-red-200">{field}:</span> {err}
              </li>
            ))}
          </ul>
        )}
      </div>
    </BezelCard>
  );
}
