"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-5xl mb-4">🌸</p>
        <h1 className="font-heading text-2xl font-bold mb-2">Có lỗi xảy ra</h1>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
          Rất tiếc, đã có lỗi khi tải trang này. Vui lòng thử lại.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="inline-flex items-center px-5 py-2.5 rounded-full border border-border text-sm font-semibold hover:bg-muted transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
