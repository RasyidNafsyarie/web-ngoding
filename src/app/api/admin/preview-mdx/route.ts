/**
 * src/app/api/admin/preview-mdx/route.ts
 *
 * POST /api/admin/preview-mdx (FR-10)
 * Live preview compiler MDX untuk editor admin.
 */

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { renderMDX } from "@/lib/mdx/mdx";
import { apiForbidden, apiSuccess, apiInternal } from "@/lib/utils/api-response";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiForbidden("Akses khusus admin.");

    const body = await request.json().catch(() => ({}));
    const content = typeof body.content === "string" ? body.content : "";

    if (!content.trim()) {
      return apiSuccess({ isCompiled: true, html: "" });
    }

    // Render MDX using our server MDX renderer
    const compiledNode = await renderMDX(content);

    // Turn React node to string via React server rendering if needed or return success indicator
    return apiSuccess({ isCompiled: true, hasNode: Boolean(compiledNode) });
  } catch (error) {
    console.error("Gagal compile preview MDX:", error);
    return apiInternal("Format MDX tidak valid.");
  }
}
