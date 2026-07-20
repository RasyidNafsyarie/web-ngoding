"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import {
  Play,
  ArrowCounterClockwise,
  Trash,
  Terminal,
  Eye,
  Lightning,
} from "@phosphor-icons/react";
import { compileSrcDoc } from "./utils";

// Definisikan default starter code untuk playground jika tidak dikirim dari prop
const DEFAULT_HTML = `<!-- Ketik HTML di sini -->
<div class="card">
  <h1>Halo Dunia!</h1>
  <p>Selamat belajar ngoding di platform Ngoding Santuy.</p>
  <button id="btn-klik">Klik Saya!</button>
</div>`;

const DEFAULT_CSS = `/* Ketik CSS di sini */
body {
  font-family: sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  margin: 0;
  background-color: #f0fdf4;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 3px solid #1a1a2e;
}

button {
  background-color: #4ade80;
  color: #1a1a2e;
  border: 2px solid #1a1a2e;
  padding: 10px 20px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.1s;
}

button:active {
  transform: scale(0.95);
}`;

const DEFAULT_JS = `// Ketik JavaScript di sini
console.log("Playground Ngoding Santuy berhasil dimuat!");

const tombol = document.getElementById("btn-klik");
tombol.addEventListener("click", () => {
  console.log("Tombol berhasil diklik!");
  alert("Halo dari JavaScript!");
});`;

interface PlaygroundProps {
  initialHtml?: string;
  initialCss?: string;
  initialJs?: string;
}

interface LogMessage {
  type: "log" | "warn" | "error" | "info";
  args: string[];
}

export function Playground({ initialHtml, initialCss, initialJs }: PlaygroundProps) {
  // Simpan nilai default jika tidak disediakan prop
  const defHtml = initialHtml || DEFAULT_HTML;
  const defCss = initialCss || DEFAULT_CSS;
  const defJs = initialJs || DEFAULT_JS;

  // State untuk kode editor
  const [htmlCode, setHtmlCode] = useState(defHtml);
  const [cssCode, setCssCode] = useState(defCss);
  const [jsCode, setJsCode] = useState(defJs);

  // Tab editor aktif ('html' | 'css' | 'js')
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");

  // Tab kanan aktif ('preview' | 'console')
  const [rightActiveTab, setRightActiveTab] = useState<"preview" | "console">("preview");

  // State log konsol
  const [logs, setLogs] = useState<LogMessage[]>([]);

  // Opsi jalankan otomatis (auto-run) dengan debounce
  const [autoRun, setAutoRun] = useState(true);

  // Referensi kontainer DOM untuk CodeMirror
  const editorContainerRef = useRef<HTMLDivElement>(null);
  // Referensi instance EditorView CodeMirror
  const viewRef = useRef<EditorView | null>(null);
  // Referensi iframe sandbox
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Tema CodeMirror retro yang disesuaikan dengan Kaeru-style Calm Retro
  const retroTheme = EditorView.theme(
    {
      "&": {
        color: "#1a1a2e",
        backgroundColor: "#fafaf5",
        fontFamily: "var(--font-mono)",
        fontSize: "13px",
        height: "100%",
      },
      ".cm-content": {
        caretColor: "#1a1a2e",
        padding: "12px 0",
      },
      ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#1a1a2e" },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
        backgroundColor: "#b8d8ba80",
      },
      ".cm-gutters": {
        backgroundColor: "#e8e4d9",
        color: "#6b7280",
        borderRight: "2px solid #1a1a2e",
        fontFamily: "var(--font-mono)",
      },
      ".cm-gutterElement": {
        padding: "0 8px 0 4px",
      },
      ".cm-activeLine": { backgroundColor: "#4ade8010" },
      ".cm-activeLineGutter": { backgroundColor: "#4ade8025", color: "#1a1a2e" },
    },
    { dark: false },
  );

  // Mendapatkan ekstensi bahasa berdasarkan tab aktif
  const getLanguageExtension = (tab: "html" | "css" | "js") => {
    switch (tab) {
      case "html":
        return html();
      case "css":
        return css();
      case "js":
        return javascript();
    }
  };

  // Mendapatkan nilai kode berdasarkan tab aktif
  const getCodeValue = (tab: "html" | "css" | "js") => {
    switch (tab) {
      case "html":
        return htmlCode;
      case "css":
        return cssCode;
      case "js":
        return jsCode;
    }
  };

  // Fungsi untuk memicu eksekusi kode di dalam iframe sandbox
  const runCode = useCallback(() => {
    if (!iframeRef.current) return;
    const srcDoc = compileSrcDoc(htmlCode, cssCode, jsCode);
    iframeRef.current.srcdoc = srcDoc;
  }, [htmlCode, cssCode, jsCode]);

  // Handler untuk membersihkan konsol
  const clearConsole = () => {
    setLogs([]);
  };

  // Handler untuk mereset seluruh kode ke starter code asal
  const handleReset = () => {
    setHtmlCode(defHtml);
    setCssCode(defCss);
    setJsCode(defJs);

    if (viewRef.current) {
      const code = activeTab === "html" ? defHtml : activeTab === "css" ? defCss : defJs;
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: code },
      });
    }

    setLogs([]);

    // Jalankan ulang kode pasca reset
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.srcdoc = compileSrcDoc(defHtml, defCss, defJs);
      }
    }, 50);
  };

  // Setup dan inisialisasi CodeMirror
  useEffect(() => {
    if (!editorContainerRef.current) return;

    const startState = EditorState.create({
      doc: getCodeValue(activeTab),
      extensions: [
        basicSetup,
        getLanguageExtension(activeTab),
        retroTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const currentContent = update.state.doc.toString();
            if (activeTab === "html") setHtmlCode(currentContent);
            else if (activeTab === "css") setCssCode(currentContent);
            else if (activeTab === "js") setJsCode(currentContent);
          }
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorContainerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Debounce jalankan kode secara otomatis (auto-run) saat kode berubah
  useEffect(() => {
    if (!autoRun) return;

    const delayDebounce = setTimeout(() => {
      runCode();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [htmlCode, cssCode, jsCode, autoRun, runCode]);

  // Jalankan preview sekali di awal pemasangan komponen
  useEffect(() => {
    runCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen pesan log konsol dari iframe sandboxed
  useEffect(() => {
    const handleMessageEvent = (event: MessageEvent) => {
      // Validasi origin: pastikan bersumber dari playground kita
      if (event.data?.source !== "ngoding-santuy-playground") return;

      // Validasi pengirim: pastikan jendela yang mengirim pesan adalah iframe sandbox kita
      if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
        if (event.data.type === "KONSOL_LOG") {
          const newLog = event.data.payload as LogMessage;
          setLogs((prev) => [...prev, newLog]);

          // Jika ada error runtime, otomatis arahkan tab kanan ke panel konsol
          if (newLog.type === "error") {
            setRightActiveTab("console");
          }
        }
      }
    };

    window.addEventListener("message", handleMessageEvent);
    return () => {
      window.removeEventListener("message", handleMessageEvent);
    };
  }, []);

  return (
    <div className="w-full flex flex-col border-2 border-ink rounded-xl bg-card-white shadow-retro-md my-8 overflow-hidden">
      {/* ── Header Playground Kontrol Utama ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 border-b-2 border-ink bg-container">
        <div className="flex items-center gap-2">
          <Terminal size={20} className="text-ink" weight="bold" />
          <h3 className="font-pixel text-[10px] sm:text-xs tracking-wide text-ink m-0">
            Interactive Playground
          </h3>
        </div>

        {/* Kontrol Run, Auto-Run, Reset */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Checkbox auto run */}
          <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer select-none mr-2">
            <input
              type="checkbox"
              checked={autoRun}
              onChange={(e) => setAutoRun(e.target.checked)}
              className="w-4 h-4 accent-retro-green border-2 border-ink rounded focus:ring-0 focus:ring-offset-0"
            />
            <span className="flex items-center gap-1">
              <Lightning size={14} weight="fill" className="text-warning" />
              Jalankan otomatis
            </span>
          </label>

          {/* Tombol Jalankan */}
          <button
            onClick={runCode}
            disabled={autoRun}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg border-2 border-ink transition-all shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-retro-pressed ${
              autoRun
                ? "bg-ink/5 text-ink/40 cursor-not-allowed border-ink/30 shadow-none active:translate-y-0"
                : "bg-retro-green text-ink hover:bg-[#3fe276]"
            }`}
          >
            <Play size={14} weight="bold" />
            Jalankan
          </button>

          {/* Tombol Reset */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg border-2 border-ink bg-card-white text-ink hover:bg-soft-green transition-all shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-retro-pressed"
            title="Reset kode ke kondisi awal"
          >
            <ArrowCounterClockwise size={14} weight="bold" />
            Reset Kode
          </button>
        </div>
      </div>

      {/* ── Main Workspace: Split Editor & Preview/Console ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] border-b-2 border-ink">
        {/* PANEL KIRI: Editor Kode (CodeMirror) */}
        <div className="flex flex-col border-r-0 lg:border-r-2 lg:border-b-0 border-b-2 border-ink bg-card-white overflow-hidden min-h-[300px] lg:min-h-[500px]">
          {/* Tab Editor HTML, CSS, JS */}
          <div className="flex border-b-2 border-ink bg-container/50 px-2 pt-2 gap-1">
            {(["html", "css", "js"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-bold uppercase border-t-2 border-x-2 border-ink rounded-t-lg transition-all translate-y-[2px] ${
                    isActive
                      ? "bg-card-white text-ink border-b-transparent z-10 scale-105"
                      : "bg-container/70 text-ink/60 border-b-ink hover:bg-container hover:text-ink opacity-80"
                  }`}
                >
                  {tab === "js" ? "JavaScript" : tab.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Kontainer Area CodeMirror */}
          <div
            ref={editorContainerRef}
            className="flex-1 w-full overflow-auto max-h-[400px] lg:max-h-[460px]"
          />
        </div>

        {/* PANEL KANAN: Preview (Iframe) & Console */}
        <div className="flex flex-col bg-card-white overflow-hidden min-h-[300px] lg:min-h-[500px]">
          {/* Tab Toggle Output (Tampilan vs Konsol) */}
          <div className="flex justify-between items-center border-b-2 border-ink bg-container/50 px-2 pt-2 gap-1">
            <div className="flex gap-1">
              {/* Tab Tampilan */}
              <button
                onClick={() => setRightActiveTab("preview")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-t-2 border-x-2 border-ink rounded-t-lg transition-all translate-y-[2px] ${
                  rightActiveTab === "preview"
                    ? "bg-card-white text-ink border-b-transparent z-10 scale-105"
                    : "bg-container/70 text-ink/60 border-b-ink hover:bg-container hover:text-ink opacity-80"
                }`}
              >
                <Eye size={13} weight="bold" />
                Tampilan
              </button>

              {/* Tab Konsol */}
              <button
                onClick={() => setRightActiveTab("console")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-t-2 border-x-2 border-ink rounded-t-lg transition-all translate-y-[2px] ${
                  rightActiveTab === "console"
                    ? "bg-card-white text-ink border-b-transparent z-10 scale-105"
                    : "bg-container/70 text-ink/60 border-b-ink hover:bg-container hover:text-ink opacity-80"
                }`}
              >
                <Terminal size={13} weight="bold" />
                Konsol ({logs.length})
              </button>
            </div>

            {/* Opsi tombol pembersih konsol jika sedang di tab konsol */}
            {rightActiveTab === "console" && logs.length > 0 && (
              <button
                onClick={clearConsole}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-destructive border-2 border-ink bg-card-white rounded-md transition-all shadow-retro-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-retro-pressed translate-y-[-4px]"
                title="Bersihkan log konsol"
              >
                <Trash size={12} weight="bold" />
                Bersihkan
              </button>
            )}
          </div>

          {/* Area Konten Panel Kanan */}
          <div className="flex-1 w-full h-full relative overflow-auto bg-card-white flex flex-col">
            {/* TAMPILAN PREVIEW (IFrame Sandbox) */}
            <iframe
              ref={iframeRef}
              title="Ngoding Santuy Playground Sandbox"
              sandbox="allow-scripts"
              className={`w-full h-full border-none flex-1 min-h-[300px] lg:min-h-[440px] bg-card-white ${
                rightActiveTab === "preview" ? "block" : "hidden"
              }`}
            />

            {/* AREA OUTPUT LOG KONSOL */}
            <div
              className={`flex-1 w-full p-4 font-mono text-xs overflow-y-auto bg-ink text-card-white min-h-[300px] lg:min-h-[440px] select-text ${
                rightActiveTab === "console" ? "block" : "hidden"
              }`}
            >
              {logs.length === 0 ? (
                <div className="text-card-white/40 italic p-2">
                  Konsol kosong. Jalankan skrip atau picu aksi untuk melihat output log.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {logs.map((log, idx) => {
                    let textClass = "text-card-white";
                    let prefix = "•";
                    if (log.type === "error") {
                      textClass = "text-destructive font-bold";
                      prefix = "✕ [Error]";
                    } else if (log.type === "warn") {
                      textClass = "text-warning";
                      prefix = "⚠️ [Peringatan]";
                    } else if (log.type === "info") {
                      textClass = "text-sky-primary";
                      prefix = "ℹ [Info]";
                    }

                    return (
                      <div
                        key={idx}
                        className={`py-1 px-2 rounded border border-card-white/5 bg-card-white/5 flex flex-col gap-1 ${textClass}`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="opacity-50 select-none text-[10px]">{prefix}</span>
                          <div className="flex-1 whitespace-pre-wrap word-break-all">
                            {log.args.join(" ")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Bantuan Kecil */}
      <div className="p-3 bg-container/30 text-[10px] text-ink/60 border-t-2 border-ink flex items-center justify-between">
        <span>Gunakan console.log() di tab JavaScript untuk mencetak hasil ke Konsol.</span>
        <span>Client-side Sandbox (Aman)</span>
      </div>
    </div>
  );
}
