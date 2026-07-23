import assert from "node:assert";

// Helper functions to test
function cleanHeadingText(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .trim();
}

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

export function testMdxHeadingExtraction() {
  console.log("▶ Running Unit Test: MDX Heading & TOC Extraction");

  const sampleMdx = `
# Judul Utama (H1 Diabaikan dari TOC)

## Intro \`HTML\` & **CSS**

Ini adalah paragraf pengantar.

### Subtopik *Atribut* HTML

Penjelasan subtopik.

## Kesimpulan & Penutup
`;

  const toc = getTableOfContents(sampleMdx);

  assert.strictEqual(toc.length, 3, "Harus mengekstrak 3 heading (H2 & H3)");

  // H2 Intro
  assert.strictEqual(toc[0].level, 2);
  assert.strictEqual(toc[0].text, "Intro HTML & CSS");
  assert.strictEqual(toc[0].id, "intro-html-css");

  // H3 Subtopik
  assert.strictEqual(toc[1].level, 3);
  assert.strictEqual(toc[1].text, "Subtopik Atribut HTML");
  assert.strictEqual(toc[1].id, "subtopik-atribut-html");

  // H2 Kesimpulan
  assert.strictEqual(toc[2].level, 2);
  assert.strictEqual(toc[2].text, "Kesimpulan & Penutup");
  assert.strictEqual(toc[2].id, "kesimpulan-penutup");

  console.log("  ✓ MDX TOC extraction tests passed!");
}
