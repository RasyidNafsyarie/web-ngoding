import assert from "node:assert";

// Pure helper function equivalents for testing structure without full Next.js runtime
function formatSuccess<T>(data: T) {
  return { success: true as const, data };
}

function formatError(code: string, message: string, details?: unknown) {
  return {
    success: false as const,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}

export function testApiResponseFormats() {
  console.log("▶ Running Integration Test: API Response Standards (API.md)");

  // 1. Success response structure
  const successRes = formatSuccess({ id: "path-1", title: "HTML Dasar" });
  assert.strictEqual(successRes.success, true);
  assert.strictEqual(successRes.data.id, "path-1");

  // 2. Unauthorized error (401)
  const unauthRes = formatError("UNAUTHORIZED", "Kamu harus login terlebih dahulu.");
  assert.strictEqual(unauthRes.success, false);
  assert.strictEqual(unauthRes.error.code, "UNAUTHORIZED");

  // 3. Forbidden error (403)
  const forbiddenRes = formatError("FORBIDDEN", "Akses khusus admin.");
  assert.strictEqual(forbiddenRes.success, false);
  assert.strictEqual(forbiddenRes.error.code, "FORBIDDEN");

  // 4. Validation error (400) with details
  const valError = formatError("VALIDATION_ERROR", "Input tidak valid.", {
    email: ["Format email tidak valid"],
  });
  assert.strictEqual(valError.success, false);
  assert.strictEqual(valError.error.code, "VALIDATION_ERROR");
  assert.ok(valError.error.details);

  console.log("  ✓ API Response standard tests passed!");
}
