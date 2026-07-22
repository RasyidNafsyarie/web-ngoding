"use client";

import { useState } from "react";

interface MdxEditorWithPreviewProps {
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
}

export function MdxEditorWithPreview({
  value,
  onChange,
  minHeight = "450px",
}: MdxEditorWithPreviewProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "split">("split");

  // Helper untuk menyisipkan snippet MDX ke posisi cursor
  const insertSnippet = (snippet: string) => {
    const textarea = document.getElementById("mdx-textarea") as HTMLTextAreaElement | null;
    if (!textarea) {
      onChange(value + "\n" + snippet);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + snippet + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  return (
    <div className="flex flex-col border-2 border-ink bg-card-white rounded-xl shadow-retro-md overflow-hidden">
      {/* ── Editor Toolbar & Tab Selector ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-container/40 border-b-2 border-ink">
        {/* Quick Insert Snippet Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => insertSnippet("## Judul Subbab\n")}
            title="Tambah Judul H2"
            className="px-2 py-1 border border-ink bg-card-white text-ink text-xs font-bold rounded hover:bg-soft-green"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("### Judul Topik\n")}
            title="Tambah Judul H3"
            className="px-2 py-1 border border-ink bg-card-white text-ink text-xs font-bold rounded hover:bg-soft-green"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("**Teks Tebal**")}
            title="Format Tebal"
            className="px-2 py-1 border border-ink bg-card-white text-ink text-xs font-bold rounded hover:bg-soft-green"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertSnippet("`kode_inline`")}
            title="Inline Code"
            className="px-2 py-1 border border-ink bg-card-white text-ink text-xs font-mono text-xs rounded hover:bg-soft-green"
          >
            `code`
          </button>
          <button
            type="button"
            onClick={() =>
              insertSnippet(
                "```javascript\nfunction hello() {\n  console.log('Hello World!');\n}\n```\n",
              )
            }
            title="Code Block"
            className="px-2 py-1 border border-ink bg-card-white text-ink text-xs font-mono rounded hover:bg-soft-green"
          >
            ``` js
          </button>
          <button
            type="button"
            onClick={() =>
              insertSnippet(
                "<Playground initialHtml='<h1>Halo</h1>' initialCss='h1 { color: green; }' initialJs='' />\n",
              )
            }
            title="Sisipkan Interactive Playground"
            className="px-2 py-1 border border-ink bg-retro-green text-ink text-xs font-bold rounded hover:bg-soft-green"
          >
            🎮 +Playground
          </button>
          <button
            type="button"
            onClick={() =>
              insertSnippet("<Callout title='Info Catatan'>Pesan penting...</Callout>\n")
            }
            title="Sisipkan Callout Box"
            className="px-2 py-1 border border-ink bg-sky-primary text-ink text-xs font-bold rounded hover:bg-soft-green"
          >
            💡 +Callout
          </button>
        </div>

        {/* View Tab Switcher */}
        <div className="flex items-center gap-1 border border-ink bg-card-white p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
              activeTab === "edit" ? "bg-retro-green text-ink border border-ink" : "text-ink/70"
            }`}
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("split")}
            className={`hidden md:block px-3 py-1 text-xs font-bold rounded transition-colors ${
              activeTab === "split" ? "bg-retro-green text-ink border border-ink" : "text-ink/70"
            }`}
          >
            ⚡ Split
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
              activeTab === "preview" ? "bg-retro-green text-ink border border-ink" : "text-ink/70"
            }`}
          >
            👁️ Preview
          </button>
        </div>
      </div>

      {/* ── Editor & Preview Workspace Area ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-ink">
        {/* Left Panel: Textarea Editor */}
        <div
          className={`p-4 flex flex-col gap-2 bg-card-white ${
            activeTab === "preview" ? "hidden" : activeTab === "edit" ? "col-span-2" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <label htmlFor="mdx-textarea" className="text-[10px] font-pixel uppercase text-ink/60">
              MDX Code Editor
            </label>
            <span className="text-[10px] font-mono text-ink/50">{value.length} Karakter</span>
          </div>
          <textarea
            id="mdx-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Tulis konten artikel dalam format MDX di sini..."
            style={{ minHeight }}
            className="
              w-full p-4 border-2 border-ink rounded-lg font-mono text-xs leading-relaxed text-ink
              bg-container/20 focus:outline-none focus:ring-2 focus:ring-ink focus:bg-card-white
              resize-y scrollbar-thin
            "
          />
        </div>

        {/* Right Panel: Live Preview Panel */}
        <div
          className={`p-4 flex flex-col gap-2 bg-container/10 overflow-y-auto ${
            activeTab === "edit" ? "hidden" : activeTab === "preview" ? "col-span-2" : ""
          }`}
          style={{ minHeight }}
        >
          <div className="flex items-center justify-between border-b border-ink/20 pb-2 mb-2">
            <span className="text-[10px] font-pixel uppercase text-ink/60">
              Live Content Preview
            </span>
            <span className="neo-badge bg-pond-green text-[9px]">Live Render</span>
          </div>

          <div className="mdx-content prose max-w-none text-ink text-xs sm:text-sm leading-relaxed">
            {value.trim() ? (
              <div className="whitespace-pre-wrap font-sans space-y-3">
                {value.split("\n\n").map((paragraph, index) => {
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2
                        key={index}
                        className="font-pixel text-xs sm:text-sm uppercase tracking-wide border-b-2 border-ink pb-2 mt-4 text-ink"
                      >
                        {paragraph.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith("### ")) {
                    return (
                      <h3
                        key={index}
                        className="font-pixel text-[10px] sm:text-xs uppercase tracking-wide mt-3 text-ink/80"
                      >
                        {paragraph.replace("### ", "")}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith("```")) {
                    return (
                      <pre
                        key={index}
                        className="p-3 bg-ink text-card-white font-mono text-xs rounded-lg border-2 border-ink overflow-x-auto"
                      >
                        <code>{paragraph.replace(/```[a-z]*/g, "").trim()}</code>
                      </pre>
                    );
                  }
                  if (paragraph.includes("<Playground")) {
                    return (
                      <div
                        key={index}
                        className="p-4 border-2 border-ink bg-sky-primary/30 rounded-xl font-pixel text-xs text-ink text-center shadow-retro-sm my-4"
                      >
                        🎮 [Interactive Code Playground Component]
                      </div>
                    );
                  }
                  if (paragraph.includes("<Callout")) {
                    return (
                      <div
                        key={index}
                        className="p-4 border-2 border-ink bg-pond-green/40 rounded-xl font-sans text-xs text-ink my-3"
                      >
                        💡 {paragraph.replace(/<[^>]+>/g, "")}
                      </div>
                    );
                  }
                  return (
                    <p key={index} className="text-xs sm:text-sm text-ink leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-ink/40">
                <span className="text-3xl mb-2">📄</span>
                <span className="font-pixel text-xs">Preview Kosong</span>
                <span className="text-xs font-sans mt-1">
                  Tulis MDX di editor untuk melihat preview.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
