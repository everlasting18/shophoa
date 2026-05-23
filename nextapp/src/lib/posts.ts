import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const postsDir = path.join(process.cwd(), "src/content/posts");

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  cover?: string;
  tags?: string[];
  readTime: number;
}

export interface Post extends PostMeta {
  contentHtml: string;
  headings: Heading[];
}

function calculateReadTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function extractHeadings(content: string): Heading[] {
  const regex = /^(#{1,3})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let idx = 0;
  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push({ id: `section-${idx++}`, text: match[2].trim(), level: match[1].length });
  }
  return headings;
}

function injectIds(html: string, headings: Heading[]): string {
  let i = 0;
  return html.replace(/<(h[123])>([\s\S]*?)<\/\1>/g, (_, tag, inner) => {
    const h = headings[i++];
    return h ? `<${tag} id="${h.id}">${inner}</${tag}>` : _;
  });
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  return files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(postsDir, filename), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug,
        readTime: calculateReadTime(content),
        ...(data as Omit<PostMeta, "slug" | "readTime">),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPrevNextPosts(currentSlug: string): {
  prev: PostMeta | null;
  next: PostMeta | null;
} {
  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === currentSlug);
  return {
    prev: index < posts.length - 1 ? posts[index + 1] : null,
    next: index > 0 ? posts[index - 1] : null,
  };
}

export async function getPost(slug: string): Promise<Post | null> {
  const filePath = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const headings = extractHeadings(content);
  const readTime = calculateReadTime(content);
  const processed = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(content);
  const contentHtml = injectIds(processed.toString(), headings);
  return {
    slug,
    readTime,
    ...(data as Omit<PostMeta, "slug" | "readTime">),
    contentHtml,
    headings,
  };
}
