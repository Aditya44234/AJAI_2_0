"use client";

import { useEffect } from "react";

export function UnhandledRejectionGuard() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      console.error("Unhandled promise rejection:", event.reason);
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
