import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(__dirname, "../src/content/posts");
const outFile = path.join(__dirname, "../src/content/posts-manifest.json");

function calculateReadTime(content) {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function extractHeadings(content) {
  const regex = /^(#{1,3})\s+(.+)$/gm;
  const headings = [];
  let idx = 0;
  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push({ id: `section-${idx++}`, text: match[2].trim(), level: match[1].length });
  }
  return headings;
}

function injectIds(html, headings) {
  let i = 0;
  return html.replace(/<(h[123])>([\s\S]*?)<\/\1>/g, (_, tag, inner) => {
    const h = headings[i++];
    return h ? `<${tag} id="${h.id}">${inner}</${tag}>` : _;
  });
}

const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

const posts = await Promise.all(
  files.map(async (filename) => {
    const slug = filename.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(postsDir, filename), "utf-8");
    const { data, content } = matter(raw);
    const headings = extractHeadings(content);
    const processed = await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(content);
    const contentHtml = injectIds(processed.toString(), headings);
    return {
      slug,
      title: data.title ?? "",
      description: data.description ?? "",
      date: data.date ?? "",
      cover: data.cover ?? null,
      tags: data.tags ?? [],
      readTime: calculateReadTime(content),
      headings,
      contentHtml,
    };
  })
);

posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

fs.writeFileSync(outFile, JSON.stringify(posts, null, 2));
console.log(`✓ posts-manifest.json — ${posts.length} bài viết`);
