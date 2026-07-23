import assert from "node:assert";
import { loginSchema, registerSchema } from "../../src/lib/auth/validation";

export function testValidationSchemas() {
  console.log("▶ Running Unit Test: Zod Auth Validation Schemas");

  // Valid login
  const validLogin = loginSchema.safeParse({
    email: "user@example.com",
    password: "securepassword123",
  });
  assert.strictEqual(validLogin.success, true, "Login valid harus lolos validasi");

  // Invalid login email
  const invalidLogin = loginSchema.safeParse({
    email: "invalid-email-format",
    password: "123",
  });
  assert.strictEqual(invalidLogin.success, false, "Format email salah harus gagal");

  // Valid register
  const validRegister = registerSchema.safeParse({
    name: "Budi Santoso",
    email: "budi@ngodingsantuy.id",
    password: "password123",
  });
  assert.strictEqual(validRegister.success, true, "Register valid harus lolos validasi");

  // Short password register (<8 chars)
  const shortPassRegister = registerSchema.safeParse({
    name: "Budi",
    email: "budi@ngodingsantuy.id",
    password: "123",
  });
  assert.strictEqual(shortPassRegister.success, false, "Password < 8 karakter harus gagal");

  console.log("  ✓ Validation schema tests passed!");
}
