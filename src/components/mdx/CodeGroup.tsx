"use client";

import React, { useState } from "react";

interface CodeGroupProps {
  children: React.ReactNode;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLanguageFromChild(child: any): string {
  // If it's a code block, its child is likely pre/code
  let codeProps = child?.props?.children?.props || {};

  // If child is already CodeBlock, it might be wrapped differently
  if (child?.props?.children?.type === "code") {
    codeProps = child.props.children.props;
  }

  const className = codeProps.className || "";
  const match = /language-(\w+)/.exec(className);
  return match ? match[1].toUpperCase() : "";
}

export function CodeGroup({ children }: CodeGroupProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const childrenArray = React.Children.toArray(children).filter(Boolean);

  if (childrenArray.length === 0) return null;

  const handleCopy = async () => {
    const activeChild = childrenArray[activeIndex];
    const codeText = getTextFromChildren(activeChild).trim();
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin kode:", err);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tabs = childrenArray.map((child: any, idx) => {
    const label =
      child?.props?.title ||
      child?.props?.filename ||
      getLanguageFromChild(child) ||
      `TAB ${idx + 1}`;
    return {
      label,
      element: child,
    };
  });

  return (
    <div className="my-6 border-2 border-ink bg-[#1e1e2f] text-card-white rounded-xl shadow-retro-sm overflow-hidden flex flex-col">
      {/* Tabs Header bar */}
      <div className="border-b-2 border-ink flex items-center justify-between bg-ink">
        {/* Tab Buttons */}
        <div className="flex overflow-x-auto scrollbar-thin">
          {tabs.map((tab, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`
                  px-4 py-2 border-r-2 border-ink text-[9px] md:text-xs uppercase font-pixel tracking-wider
                  transition-all duration-100 cursor-pointer
                  ${isActive ? "bg-[#1e1e2f] text-retro-green font-bold" : "text-card-white/60 hover:text-card-white hover:bg-card-white/5"}
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="
            mx-3 px-2.5 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider
            border border-card-white/30 rounded-md bg-[#2d2d44] hover:bg-retro-green hover:text-ink hover:border-ink
            active:translate-x-[0.5px] active:translate-y-[0.5px]
            transition-all duration-100 cursor-pointer
          "
        >
          {copied ? "Tersalin!" : "Salin"}
        </button>
      </div>

      {/* Code body (clone child and inject insideGroup parameter) */}
      <div className="relative">
        {React.cloneElement(
          tabs[activeIndex].element as React.ReactElement<{ isInsideGroup?: boolean }>,
          {
            isInsideGroup: true,
          },
        )}
      </div>
    </div>
  );
}
