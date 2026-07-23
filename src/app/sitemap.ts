import { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ngodingsantuy.id";

  // Base static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/paths`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    // Dynamic paths routes
    const paths = await prisma.learningPath.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const pathRoutes: MetadataRoute.Sitemap = paths.map((path) => ({
      url: `${baseUrl}/paths/${path.slug}`,
      lastModified: path.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Dynamic article routes
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
        learningPath: {
          select: { slug: true },
        },
      },
    });

    const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${baseUrl}/paths/${article.learningPath.slug}/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...pathRoutes, ...articleRoutes];
  } catch (error) {
    console.error("Gagal membuat sitemap dari database:", error);
    return staticRoutes;
  }
}
