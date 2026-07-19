"use client";

import React, { useState } from "react";

interface CodeBlockProps {
  children: React.ReactElement;
  className?: string;
  isInsideGroup?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTextFromChildren(children: any): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(getTextFromChildren).join("");
  if (children && children.props && children.props.children) {
    return getTextFromChildren(children.props.children);
  }
  return "";
}

export function CodeBlock({ children, isInsideGroup = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract code text for copy feature
  const codeText = getTextFromChildren(children).trim();

  // Find language class
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const codeProps = (children?.props as any) || {};
  const className = codeProps.className || "";
  const match = /language-(\w+)/.exec(className);
  const lang = match ? match[1] : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin kode:", err);
    }
  };

  if (isInsideGroup) {
    return (
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-left bg-transparent">
        {React.cloneElement(children as React.ReactElement<{ className?: string }>, {
          className: `${codeProps.className || ""} !bg-transparent !p-0 !m-0 !border-0`,
        })}
      </pre>
    );
  }

  return (
    <div className="my-6 border-2 border-ink bg-[#1e1e2f] text-card-white rounded-xl shadow-retro-sm overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="border-b-2 border-ink px-4 py-2 flex items-center justify-between bg-ink text-card-white/90">
        <span className="font-pixel text-[9px] uppercase tracking-wider text-soft-green">
          {lang || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="
            px-2.5 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider
            border border-card-white/30 rounded-md bg-[#2d2d44] hover:bg-retro-green hover:text-ink hover:border-ink
            active:translate-x-[0.5px] active:translate-y-[0.5px]
            transition-all duration-100 cursor-pointer
          "
        >
          {copied ? "Tersalin!" : "Salin"}
        </button>
      </div>

      {/* Code body */}
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-left bg-transparent">
        {/* Render the syntax-highlighted code children directly */}
        {React.cloneElement(children as React.ReactElement<{ className?: string }>, {
          className: `${codeProps.className || ""} !bg-transparent !p-0 !m-0 !border-0`,
        })}
      </pre>
    </div>
  );
}
