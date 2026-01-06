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
  );
}
