import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-7xl font-heading font-bold text-muted-foreground/30 mb-4">404</p>
        <h1 className="font-heading text-2xl font-bold mb-2">Không tìm thấy trang</h1>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
          Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}