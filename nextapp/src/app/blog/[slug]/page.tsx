import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Home, ChevronRight, ChevronLeft, Calendar, Clock, ArrowLeft } from "lucide-react";
import postsManifest from "@/content/posts-manifest.json";
import { SITE_NAME, SITE_URL } from "@/config";
import TableOfContents from "@/components/blog/table-of-contents";

export const dynamic = "force-static";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return postsManifest.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = postsManifest.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      siteName: SITE_NAME,
      ...(post.cover ? { images: [{ url: post.cover }] } : {}),
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = postsManifest.find((p) => p.slug === slug);
  if (!post) notFound();

  const idx = postsManifest.findIndex((p) => p.slug === slug);
  const prev = idx < postsManifest.length - 1 ? postsManifest[idx + 1] : null;
  const next = idx > 0 ? postsManifest[idx - 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
    ...(post.cover ? { image: post.cover } : {}),
  };

  return (
    <div className="mx-auto px-4 py-10 w-full max-w-5xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          Trang chủ
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium line-clamp-1">{post.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_224px] gap-0 lg:gap-14 items-start">
        {/* Main content */}
        <div className="min-w-0">
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-4">
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
            <h1 className="font-heading text-2xl sm:text-3xl font-bold leading-snug tracking-tight mb-4">
              {post.title}
            </h1>
            <p className="text-muted-foreground leading-relaxed">{post.description}</p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-5 border-t border-border" />
          </div>

          {/* Cover image */}
          {post.cover && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8">
              <Image
                src={post.cover}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 800px"
                priority
              />
            </div>
          )}

          <article
            className="prose prose-stone max-w-none prose-headings:font-heading prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl [&_table]:block [&_table]:overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* Bottom navigation */}
          <div className="mt-12 pt-6 border-t border-border space-y-6">
            {(prev || next) && (
              <div className="grid grid-cols-2 gap-4">
                {prev ? (
                  <Link href={`/blog/${prev.slug}`} className="group flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <ChevronLeft className="w-3.5 h-3.5" /> Bài trước
                    </span>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {prev.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
                {next ? (
                  <Link
                    href={`/blog/${next.slug}`}
                    className="group flex flex-col gap-1 items-end text-right"
                  >
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      Bài sau <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {next.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            )}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Xem tất cả bài viết
            </Link>
          </div>
        </div>

        {/* TOC sidebar */}
        <TableOfContents headings={post.headings} />
      </div>
    </div>
  );
}
