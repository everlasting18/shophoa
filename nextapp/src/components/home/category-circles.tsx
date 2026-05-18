import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/schema";
import { getThumbUrl } from "@/lib/media";

export default function CategoryCircles({ categories }: { categories: Category[] }) {
  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="flex gap-5 sm:gap-7 overflow-x-auto pb-2 scrollbar-hide sm:justify-center">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="flex flex-col items-center gap-2.5 shrink-0 group"
            >
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-border group-hover:border-primary group-hover:scale-105 transition-all duration-300 relative bg-muted"
              >
                {cat.image ? (
                  <Image
                    src={getThumbUrl(cat.collectionId, cat.id, cat.image, "480x480")}
                    alt={cat.name}
                    fill
                    sizes="96px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                )}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-center leading-tight w-20 sm:w-24 group-hover:text-primary transition-colors">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
