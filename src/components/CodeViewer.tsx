"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState, useEffect } from "react";

interface CodeViewerProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
}

export default function CodeViewer({
  code,
  language,
  showLineNumbers = true,
}: CodeViewerProps) {
  const [isDark, setIsDark] = useState(true); // Default to dark mode
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    
    return () => observer.disconnect();
  }, []);

  // Responsive styles based on viewport
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Copy Button Above Code Block */}
      <div className="mb-3 flex justify-end">
        <button
          onClick={handleCopy}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${copied 
                        ? "bg-green-500/20 border border-green-500/50 text-green-400" 
                        : "bg-muted/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
          aria-label="Copy code"
        >
          {copied ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Code
            </span>
          )}
        </button>
      </div>

      {/* Code Block */}
      <div className="rounded-xl overflow-hidden border-2 border-border/30 bg-[#1a1a1a] overflow-x-auto scroll-touch">
        <SyntaxHighlighter
          language={language === "plaintext" ? "text" : language}
          style={isDark ? oneDark : oneLight}
          showLineNumbers={showLineNumbers && !isMobile}
          customStyle={{
            margin: 0,
            padding: isMobile ? "1rem" : "1.5rem",
            fontSize: isMobile ? "12px" : "14px",
            lineHeight: "1.7",
            background: "transparent",
            fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
          }}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "0.75em",
            color: "#666",
            opacity: 0.6,
          }}
          wrapLines
          wrapLongLines
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
