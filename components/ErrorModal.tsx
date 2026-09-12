"use client";

import { AlertCircle, X } from "lucide-react";

interface ErrorModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export function ErrorModal({ open, message, onClose }: ErrorModalProps) {
  if (!open) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/60
        px-4
        backdrop-blur-sm
        animate-in
        fade-in
        duration-200
      "
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-modal-title"
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-2xl
          border
          border-white/10
          bg-primary/10
          p-6
          shadow-2xl
          animate-in
          zoom-in-95
          slide-in-from-bottom-2
          duration-200
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close error"
          className="
            absolute
            right-4
            top-4
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            text-white/50
            transition
            hover:bg-white/10
            hover:text-white
          "
        >
          <X className="h-4 w-4" />
        </button>

        {/* Error icon */}
        <div className="flex items-start gap-4">
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-destructive/10
              text-destructive
            "
          >
            <AlertCircle className="h-6 w-6" />
          </div>

          <div className="pr-6">
            <h2
              id="error-modal-title"
              className="text-lg font-semibold text-white"
            >
              Something went wrong
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/60">{message}</p>
          </div>
        </div>

        {/* Close button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              bg-white
              px-4
              py-2
              text-sm
              font-medium
              text-black
              transition
              hover:bg-white/90
              active:scale-[0.98]
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
