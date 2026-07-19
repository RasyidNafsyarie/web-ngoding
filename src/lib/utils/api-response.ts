/**
 * src/lib/utils/api-response.ts
 *
 * Helper untuk format response API yang konsisten sesuai API.md.
 *
 * Success:  { success: true, data, message? }
 * Error:    { success: false, error: { code, message, details? } }
 */

import { NextResponse } from "next/server";
import type { ZodError } from "zod";

// ─── Error codes sesuai API.md ─────────────────────────────────────────────────
export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "INTERNAL_ERROR";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ApiSuccessResponse<T> {
  success: true;
  data?: T;
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

// ─── Success helpers ───────────────────────────────────────────────────────────
export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiMessage(message: string, status = 200): NextResponse<ApiSuccessResponse<never>> {
  return NextResponse.json({ success: true, message }, { status });
}

// ─── Error helpers ─────────────────────────────────────────────────────────────
export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ success: false, error: { code, message, details } }, { status });
}

export const apiUnauthorized = (message = "Kamu harus login terlebih dahulu.") =>
  apiError("UNAUTHORIZED", message, 401);

export const apiForbidden = (message = "Kamu tidak memiliki akses ke resource ini.") =>
  apiError("FORBIDDEN", message, 403);

export const apiNotFound = (message = "Resource tidak ditemukan.") =>
  apiError("NOT_FOUND", message, 404);

export const apiConflict = (message: string) => apiError("CONFLICT", message, 409);

export const apiInternal = (message = "Terjadi kesalahan server. Coba lagi nanti.") =>
  apiError("INTERNAL_ERROR", message, 500);

export function apiValidationError(error: ZodError) {
  return apiError("VALIDATION_ERROR", "Input tidak valid.", 400, error.flatten().fieldErrors);
}
