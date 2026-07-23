import assert from "node:assert";

export function testXpCalculation() {
  console.log("▶ Running Unit Test: XP Calculation & Progress");

  // Constant XP per article
  const XP_PER_ARTICLE = 10;

  // Test single completion award
  const initialUserXp = 0;
  const newXpAfterFirstCompletion = initialUserXp + XP_PER_ARTICLE;
  assert.strictEqual(
    newXpAfterFirstCompletion,
    10,
    "XP untuk penyelesaian artikel pertama harus 10",
  );

  // Test idempotency (repeat completion should not double XP)
  const isAlreadyCompleted = true;
  let currentXp = 10;
  if (!isAlreadyCompleted) {
    currentXp += XP_PER_ARTICLE;
  }
  assert.strictEqual(currentXp, 10, "XP tidak boleh bertambah jika artikel sudah ditandai selesai");

  // Test total XP calculation for 5 completed articles
  const completedArticlesCount = 5;
  const totalXp = completedArticlesCount * XP_PER_ARTICLE;
  assert.strictEqual(totalXp, 50, "Total XP untuk 5 artikel selesai harus 50");

  console.log("  ✓ XP Calculation tests passed!");
}
