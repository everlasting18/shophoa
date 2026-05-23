"use client";

import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/lib/posts";

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const onScroll = () => {
      let current = headings[0].id;
      for (const { id } of headings) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActiveId(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  // Scroll active item into view within the TOC container only
  useEffect(() => {
    if (!activeId) return;
    const container = containerRef.current;
    const item = itemRefs.current.get(activeId);
    if (!container || !item) return;
    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const offset = itemRect.top - containerRect.top - container.clientHeight / 2 + item.clientHeight / 2;
    container.scrollBy({ top: offset, behavior: "smooth" });
  }, [activeId]);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-24">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Nội dung bài viết
        </p>
        <div
          ref={containerRef}
          className="border-l border-border space-y-0.5 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-none"
        >
          {headings.map((h) => (
            <a
              key={h.id}
              ref={(el) => {
                if (el) itemRefs.current.set(h.id, el);
                else itemRefs.current.delete(h.id);
              }}
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                setActiveId(h.id);
              }}
              className={`block text-sm leading-snug py-1.5 transition-colors border-l-2 -ml-px ${
                h.level === 1 ? "pl-3" : h.level === 2 ? "pl-5" : "pl-7"
              } ${
                activeId === h.id
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {h.text}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
