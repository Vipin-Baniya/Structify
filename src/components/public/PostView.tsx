"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Post } from "@/types";
import { Loader2, ArrowLeft } from "lucide-react";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// Minimal markdown renderer — handles headings, bold, italic, code blocks, inline code, links, lists
function renderMarkdown(md: string): string {
  let html = md
    // Escape HTML
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Code blocks (``` ... ```)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) =>
      `<pre class="bg-surface border border-border rounded-lg p-4 overflow-x-auto my-4"><code class="font-mono text-xs text-text" data-lang="${lang}">${code.trimEnd()}</code></pre>`
    )
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="font-mono text-xs bg-surface text-green px-1.5 py-0.5 rounded">$1</code>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-text mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 class="text-xl font-bold text-text mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 class="text-2xl font-black text-text mt-8 mb-4">$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,     '<strong class="font-bold text-text">$1</strong>')
    .replace(/\*(.+?)\*/g,         '<em class="italic">$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer" class="text-green hover:underline">$1</a>'
    )
    // Unordered list items
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 text-muted text-sm mb-1 list-disc">$1</li>')
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-muted text-sm mb-1 list-decimal">$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-border my-6" />')
    // Blockquote
    .replace(/^> (.+)$/gm,
      '<blockquote class="border-l-2 border-green pl-4 text-muted italic my-4">$1</blockquote>'
    )
    // Paragraphs (double newline = paragraph break)
    .replace(/\n\n(?!<[h|pre|hr|blockquote|li])/g, '</p><p class="text-muted text-sm leading-relaxed mb-4">')
    // Single newlines inside paragraphs
    .replace(/\n(?![<\s])/g, "<br />");

  return `<p class="text-muted text-sm leading-relaxed mb-4">${html}</p>`;
}

export default function PostView({ slug }: { slug: string }) {
  const [post,     setPost]     = useState<Post | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(async r => {
        if (!r.ok) { setNotFound(true); return; }
        const d = await r.json();
        if (d.error) { setNotFound(true); return; }
        setPost(d);
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-2xl font-black text-text mb-2">404</p>
          <p className="text-muted text-sm">Post not found.</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-green" /></div>;
  }

  return (
    <div className="max-w-2xl">
      <Link href="/blog" className="flex items-center gap-1.5 text-xs text-muted hover:text-green transition-colors mb-6 font-mono">
        <ArrowLeft size={12} /> Back to Notes
      </Link>

      {post.coverUrl && (
        <img src={post.coverUrl} alt={post.title} className="w-full h-48 object-cover rounded-2xl mb-6 border border-border" />
      )}

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {post.tags.map(t => (
          <span key={t} className="font-mono text-[10px] bg-surface text-dim px-2 py-0.5 rounded border border-border">{t}</span>
        ))}
        <span className="font-mono text-[10px] text-dim ml-auto">{fmtDate(post.createdAt)}</span>
      </div>

      <h1 className="text-3xl font-black text-text mb-4">{post.title}</h1>

      {post.excerpt && (
        <p className="text-muted text-base leading-relaxed mb-6 border-l-2 border-green pl-4">{post.excerpt}</p>
      )}

      {post.content && (
        <div
          className="prose-structify"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />
      )}
    </div>
  );
}
