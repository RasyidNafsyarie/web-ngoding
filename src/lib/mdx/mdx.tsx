import React from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import { Alert, Note, Callout, CodeBlock, CodeGroup } from "@/components/mdx";
import { Playground } from "@/components/playground";

const mdxComponents = {
  Alert,
  Note,
  Callout,
  CodeGroup,
  Playground,
  pre: CodeBlock,
  // Custom styled headings to fit Kaeru-style Calm Retro
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-xs md:text-sm font-pixel uppercase tracking-wide mt-8 mb-4 border-b-2 border-ink pb-3"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="text-[10px] md:text-xs font-pixel uppercase tracking-wide mt-7 mb-4 border-b border-ink/20 pb-2"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="text-[8px] md:text-[9px] font-pixel uppercase tracking-wider mt-6 mb-3 text-ink/80"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-xs md:text-sm leading-relaxed mb-4 text-ink" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-5 mb-4 space-y-2 text-xs md:text-sm text-ink" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-5 mb-4 space-y-2 text-xs md:text-sm text-ink" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-xs md:text-sm text-ink leading-relaxed" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-ink font-semibold underline decoration-2 underline-offset-2 hover:text-retro-green transition-all"
      {...props}
    />
  ),
  // Style tables with a Calm Retro bordered card wrapper
  table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-6 border-2 border-ink rounded-xl shadow-retro-sm">
      <table className="min-w-full divide-y border-collapse divide-ink" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-pond-green/30" {...props} />
  ),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className="divide-y divide-ink/20 bg-card-white" {...props} />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="divide-x divide-ink/20" {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableHeaderCellElement>) => (
    <th
      className="px-4 py-3 text-left font-bold text-[10px] md:text-xs uppercase text-ink"
      {...props}
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableDataCellElement>) => (
    <td className="px-4 py-2.5 text-xs text-ink leading-relaxed" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="bg-ink/10 px-1 py-0.5 rounded font-mono text-xs text-ink" {...props} />
  ),
};

export async function renderMDX(content: string) {
  const { content: compiledContent } = await compileMDX({
    source: content,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: [rehypeSlug, rehypeHighlight],
      },
    },
  });
  return compiledContent;
}
