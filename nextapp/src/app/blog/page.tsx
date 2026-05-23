import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Home, ChevronRight, BookOpen, Calendar, Clock, ArrowRight } from "lucide-react";
import type { PostMeta } from "@/lib/posts";
import postsManifest from "@/content/posts-manifest.json";
import { SITE_NAME } from "@/config";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Blog Hoa Tươi – Ý Nghĩa Các Loài Hoa",
  description: `Khám phá ý nghĩa của các loài hoa tươi qua góc nhìn của ${SITE_NAME}. Bí quyết chọn hoa, ý nghĩa màu sắc và cách phối hoa đẹp.`,
  alternates: { canonical: "/blog" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function BlogPage() {
  const posts = postsManifest as PostMeta[];
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          Trang chủ
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Blog</span>
      </nav>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Blog Hoa Tươi</h1>
        </div>
        <p className="text-muted-foreground">
          Ý nghĩa các loài hoa, bí quyết chọn hoa và câu chuyện đằng sau từng cánh hoa.
        </p>
      </div>

      {!featured ? (
        <p className="text-muted-foreground">Chưa có bài viết nào.</p>
      ) : (
        <div className="space-y-5">
          {/* Featured post */}
          <Link
            href={`/blog/${featured.slug}`}
            className="group block rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            {featured.cover && (
              <div className="relative aspect-[2/1] overflow-hidden">
                <Image
                  src={featured.cover}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
              </div>
            )}
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(featured.date)}
                </span>
                <span aria-hidden>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featured.readTime} phút đọc
                </span>
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl leading-snug mb-3 group-hover:text-primary transition-colors">
                {featured.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">{featured.description}</p>
              {featured.tags && featured.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {featured.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Đọc bài <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          {/* Rest of posts */}
          {rest.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {post.cover && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={post.cover}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 448px"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(post.date)}
                      </span>
                      <span aria-hidden>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime} phút đọc
                      </span>
                    </div>
                    <h2 className="font-heading font-semibold text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                      {post.description}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="inline-block text-xs font-medium text-primary">
                      Đọc bài →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
