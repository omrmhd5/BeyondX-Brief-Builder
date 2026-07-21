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
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-4"
      role="alert"
      aria-live="assertive">
      {message && <p className="text-sm font-medium text-red-800">{message}</p>}
      {fieldErrors && Object.keys(fieldErrors).length > 0 && (
        <ul className="mt-2 list-inside list-disc text-sm text-red-700">
          {Object.entries(fieldErrors).map(([field, err]) => (
            <li key={field}>
              <span className="font-medium">{field}:</span> {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
