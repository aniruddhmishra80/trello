"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 px-4">
      <div className="flex flex-col items-center space-y-4 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Something went wrong!</h1>
        <p className="max-w-md text-gray-600">
          We experienced an error while loading this page. Please try again or contact support if the problem persists.
        </p>
        <Button onClick={() => reset()} size="lg">
          Try again
        </Button>
      </div>
    </div>
  );
}
