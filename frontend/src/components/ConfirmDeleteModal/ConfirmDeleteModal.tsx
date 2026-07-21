import {
  BEZEL_INNER,
  BEZEL_OUTER,
  GHOST_BTN,
  MOTION,
} from "../../lib/uiClasses";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-3xl"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-message"
      onClick={onCancel}>
      <div
        className={`w-full max-w-md ${BEZEL_OUTER} ${MOTION}`}
        onClick={(e) => e.stopPropagation()}>
        <div className={`${BEZEL_INNER} p-6 sm:p-8`}>
          <h2
            id="confirm-delete-title"
            className="text-lg font-semibold tracking-tight text-white">
            {title}
          </h2>
          <p
            id="confirm-delete-message"
            className="mt-3 text-sm leading-relaxed text-zinc-400">
            {message}
          </p>
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className={GHOST_BTN}>
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`rounded-full border border-red-400/30 bg-red-500/20 px-6 py-3 text-sm font-semibold text-red-200 ${MOTION} cursor-pointer hover:bg-red-500/30 focus:outline-none focus:ring-2 focus:ring-red-400/30 disabled:cursor-not-allowed disabled:opacity-40`}>
              {loading ? "Deleting…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
