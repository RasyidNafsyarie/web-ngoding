import type { Metadata } from "next";
import { MainLayout } from "@/components/layout";
import { Card, Button } from "@/components/ui";
import { ArticleCompletionButton } from "@/components/article/ArticleCompletionButton";
import { prisma } from "@/lib/db/prisma";
import { Article, LearningPath } from "@prisma/client";
import { renderMDX } from "@/lib/mdx/mdx";
import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";

export const revalidate = 60; // ISR revalidate every 60 seconds

interface PageProps {
  params: Promise<{ slug: string; articleSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug: pathSlug, articleSlug } = resolvedParams;

  try {
    const path = await prisma.learningPath.findUnique({
      where: { slug: pathSlug },
      select: { title: true },
    });

    if (!path) {
      return { title: "Artikel Tidak Ditemukan" };
    }

    const article = await prisma.article.findFirst({
      where: {
        learningPath: { slug: pathSlug },
        slug: articleSlug,
        isPublished: true,
      },
      select: {
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!article) {
      return { title: "Artikel Tidak Ditemukan" };
    }

    const cleanSnippet = article.content
      .replace(/#+\s+/g, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n+/g, " ")
      .trim()
      .slice(0, 160);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ngodingsantuy.id";
    const articleUrl = `${baseUrl}/paths/${pathSlug}/${articleSlug}`;

    return {
      title: article.title,
      description: cleanSnippet || `Pelajari ${article.title} di Ngoding Santuy.`,
      openGraph: {
        title: `${article.title} | ${path.title}`,
        description: cleanSnippet || `Pelajari ${article.title} di Ngoding Santuy.`,
        url: articleUrl,
        type: "article",
        publishedTime: article.createdAt.toISOString(),
        modifiedTime: article.updatedAt.toISOString(),
        siteName: "Ngoding Santuy",
      },
      twitter: {
        card: "summary_large_image",
        title: `${article.title} | Ngoding Santuy`,
        description: cleanSnippet || `Pelajari ${article.title} di Ngoding Santuy.`,
      },
    };
  } catch {
    return { title: "Artikel | Ngoding Santuy" };
  }
}

// Clean markdown formatting from heading string
function cleanHeadingText(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .trim();
}

// Generate anchor ID matching rehype-slug standard
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface HeadingItem {
  level: number;
  text: string;
  id: string;
}

// Extract headings for Table of Contents
function getTableOfContents(content: string): HeadingItem[] {
  const headingRegex = /^(##|###)\s+(.*)$/gm;
  const headings: HeadingItem[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1] === "##" ? 2 : 3;
    const text = cleanHeadingText(match[2]);
    const id = slugify(text);
    headings.push({ level, text, id });
  }
  return headings;
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug: pathSlug, articleSlug } = resolvedParams;

  let path: LearningPath | null = null;
  let article: Article | null = null;
  let compiledContent: React.ReactNode = null;
  let tocHeadings: HeadingItem[] = [];
  let prevArticle: { slug: string; title: string; order: number } | null = null;
  let nextArticle: { slug: string; title: string; order: number } | null = null;

  try {
    // 1. Fetch path
    path = await prisma.learningPath.findUnique({
      where: { slug: pathSlug },
    });

    if (path) {
      // 2. Fetch article
      const dbArticle = await prisma.article.findFirst({
        where: {
          learningPathId: path.id,
          slug: articleSlug,
        },
      });

      if (dbArticle && dbArticle.isPublished) {
        article = dbArticle;

        // 3. Compile MDX
        compiledContent = await renderMDX(dbArticle.content);

        // 4. Generate TOC
        tocHeadings = getTableOfContents(dbArticle.content);

        // 5. Fetch next and previous articles
        const allArticles = await prisma.article.findMany({
          where: {
            learningPathId: path.id,
            isPublished: true,
          },
          orderBy: { order: "asc" },
          select: { slug: true, title: true, order: true },
        });

        const currentIndex = allArticles.findIndex((a) => a.slug === dbArticle.slug);
        prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
        nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;
      }
    }
  } catch (error) {
    console.error("Gagal memuat detail artikel dari database:", error);
  }

  if (!path || !article || !article.isPublished || !compiledContent) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ngodingsantuy.id";
  const articleUrl = `${baseUrl}/paths/${path.slug}/${article.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: `Modul ${article.order}: ${article.title} dalam jalur ${path.title}`,
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    author: {
      "@type": "Organization",
      name: "Ngoding Santuy",
    },
    publisher: {
      "@type": "Organization",
      name: "Ngoding Santuy",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Jalur Belajar",
        item: `${baseUrl}/paths`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: path.title,
        item: `${baseUrl}/paths/${path.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* ── Breadcrumb ── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 text-xs font-semibold text-ink/70"
        >
          <Link href="/" className="hover:text-ink hover:underline">
            Beranda
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/paths" className="hover:text-ink hover:underline">
            Jalur Belajar
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/paths/${path.slug}`} className="hover:text-ink hover:underline">
            {path.title}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink truncate max-w-[200px]" aria-current="page">
            {article.title}
          </span>
        </nav>

        {/* ── Two-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Main Article Content Panel */}
          <article className="lg:col-span-3 flex flex-col gap-6">
            <Card padding="p-6 md:p-8" hoverable={false}>
              <header className="border-b-2 border-ink pb-6 mb-8 flex flex-col gap-3">
                <span className="neo-badge w-fit bg-pond-green">Modul {article.order}</span>
                <h1 className="text-sm sm:text-md md:text-lg font-pixel tracking-wide text-ink leading-snug">
                  {article.title}
                </h1>
                <div className="text-[10px] font-semibold text-ink/50 flex flex-wrap gap-4 mt-2">
                  <span>
                    Jalur:{" "}
                    <Link href={`/paths/${path.slug}`} className="underline hover:text-ink">
                      {path.title}
                    </Link>
                  </span>
                  <span>•</span>
                  <span>
                    Diperbarui:{" "}
                    {new Date(article.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </header>

              {/* Rendered MDX Container */}
              <div className="mdx-content prose max-w-none text-ink leading-relaxed font-sans">
                {compiledContent}
              </div>

              {/* ── Mark as Completed Action ── */}
              <div className="mt-12 pt-8 border-t-2 border-dashed border-ink/20 flex justify-center">
                <ArticleCompletionButton articleId={article.id} />
              </div>
            </Card>

            {/* ── Navigation (Sebelumnya / Selanjutnya) ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              {prevArticle ? (
                <Button
                  href={`/paths/${path.slug}/${prevArticle.slug}`}
                  variant="outline"
                  className="w-full sm:w-auto text-left flex flex-col items-start gap-1 justify-center min-h-[64px]"
                >
                  <span className="text-[9px] uppercase tracking-widest text-ink/50">
                    Sebelumnya
                  </span>
                  <span className="text-xs font-bold line-clamp-1">← {prevArticle.title}</span>
                </Button>
              ) : (
                <div className="hidden sm:block" />
              )}

              {nextArticle ? (
                <Button
                  href={`/paths/${path.slug}/${nextArticle.slug}`}
                  variant="primary"
                  className="w-full sm:w-auto text-right flex flex-col items-end gap-1 justify-center min-h-[64px]"
                >
                  <span className="text-[9px] uppercase tracking-widest text-card-white/60">
                    Selanjutnya
                  </span>
                  <span className="text-xs font-bold line-clamp-1">{nextArticle.title} →</span>
                </Button>
              ) : (
                <div className="hidden sm:block" />
              )}
            </div>
          </article>

          {/* Sticky Table of Contents Sidebar */}
          {tocHeadings.length > 0 && (
            <aside className="hidden lg:block lg:col-span-1 sticky top-24">
              <Card
                padding="p-5"
                hoverable={false}
                className="max-h-[80vh] overflow-y-auto scrollbar-thin"
              >
                <h2 className="font-pixel text-[9px] tracking-wide text-ink uppercase border-b-2 border-ink pb-3 mb-4">
                  Daftar Isi
                </h2>
                <nav aria-label="Daftar isi artikel">
                  <ul className="flex flex-col gap-2.5">
                    {tocHeadings.map((heading, index) => {
                      const isSub = heading.level === 3;
                      return (
                        <li key={index} style={{ paddingLeft: isSub ? "12px" : "0px" }}>
                          <a
                            href={`#${heading.id}`}
                            className={`
                              block text-xs font-bold leading-tight hover:text-retro-green transition-colors
                              ${isSub ? "text-ink/60 border-l border-ink/20 pl-2 text-[11px]" : "text-ink"}
                            `}
                          >
                            {heading.text}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </Card>
            </aside>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export async function generateStaticParams() {
  try {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      include: { learningPath: true },
    });
    return articles.map((article) => ({
      slug: article.learningPath.slug,
      articleSlug: article.slug,
    }));
  } catch (error) {
    console.warn("Gagal generateStaticParams untuk artikel (database offline):", error);
    return [];
  }
}
