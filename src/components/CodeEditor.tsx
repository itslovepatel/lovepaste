"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "bash", label: "Bash" },
];

const EXPIRATIONS = [
  { value: "1d", label: "24 Hours" },
  { value: "1h", label: "1 Hour" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "never", label: "Never" },
];

// Simple language detection
function detectLanguage(content: string): string {
  const patterns: { language: string; patterns: RegExp[] }[] = [
    {
      language: "javascript",
      patterns: [
        /\bconst\s+\w+\s*=/,
        /\blet\s+\w+\s*=/,
        /\bfunction\s+\w+\s*\(/,
        /=>\s*[{(]/,
        /\bconsole\.log\(/,
      ],
    },
    {
      language: "typescript",
      patterns: [
        /:\s*(string|number|boolean|any)\b/,
        /\binterface\s+\w+/,
        /\btype\s+\w+\s*=/,
        /<\w+>/,
      ],
    },
    {
      language: "python",
      patterns: [
        /\bdef\s+\w+\s*\(/,
        /\bclass\s+\w+\s*:/,
        /\bimport\s+\w+/,
        /\bprint\s*\(/,
        /:\s*$/m,
      ],
    },
    {
      language: "java",
      patterns: [
        /\bpublic\s+(static\s+)?class\s+/,
        /\bprivate\s+\w+\s+\w+/,
        /System\.out\.println/,
      ],
    },
    {
      language: "html",
      patterns: [/<html/i, /<div/i, /<span/i, /<\/\w+>/],
    },
    {
      language: "css",
      patterns: [/\{[\s\S]*:\s*[\w#]+;[\s\S]*\}/, /@media\s*\(/, /\.([\w-]+)\s*\{/],
    },
    {
      language: "json",
      patterns: [/^\s*\{[\s\S]*"[\w]+":\s*[\[{"\d]/],
    },
    {
      language: "sql",
      patterns: [
        /\bSELECT\b.*\bFROM\b/i,
        /\bINSERT\s+INTO\b/i,
        /\bCREATE\s+TABLE\b/i,
      ],
    },
    {
      language: "bash",
      patterns: [/^#!/, /\becho\s+/, /\bsudo\s+/, /\|\s*grep\b/],
    },
  ];

  for (const { language, patterns: langPatterns } of patterns) {
    const matches = langPatterns.filter((p) => p.test(content)).length;
    if (matches >= 2 || (langPatterns.length === 1 && matches === 1)) {
      return language;
    }
  }

  return "plaintext";
}

export default function CodeEditor() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [expiration, setExpiration] = useState("1d");
  const [loading, setLoading] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  const [goToCode, setGoToCode] = useState("");

  // Handle go-to-paste navigation
  const handleGoToPaste = () => {
    const code = goToCode.trim().toLowerCase();
    if (code && /^[a-z2-9]{5}$/.test(code)) {
      router.push(`/p/${code}`);
    }
  };

  // Auto-detect language when content changes
  useEffect(() => {
    if (autoDetect && content.length > 20) {
      const detected = detectLanguage(content);
      if (detected !== "plaintext") {
        setLanguage(detected);
        setAutoDetect(false); // Stop auto-detecting after first detection
      }
    }
  }, [content, autoDetect]);

  const handlePublish = useCallback(async () => {
    if (!content.trim()) return;

    // Client-side validation
    const trimmedContent = content.trim();
    if (trimmedContent.length > 500000) {
      alert("Content too large. Maximum size is 500KB.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmedContent, language, expiration }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 429) {
          alert("Too many requests. Please wait a moment and try again.");
        } else if (res.status === 413) {
          alert("Content too large. Maximum size is 500KB.");
        } else {
          alert(data.error || "Failed to create paste. Please try again.");
        }
        return;
      }

      router.push(`/p/${data.id}`);
    } catch (error) {
      console.error("Error creating paste:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [content, language, expiration, router]);

  // Keyboard shortcut: Ctrl/Cmd + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (content.trim() && !loading) {
          handlePublish();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content, loading, handlePublish]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Main header row */}
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500 flex items-center justify-center group-hover:scale-105 group-hover:bg-rose-600 transition-all">
                <span className="text-white font-bold text-xs sm:text-sm">❤</span>
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight">LovePaste</span>
            </a>

            {/* Desktop Controls */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Go to paste input */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={goToCode}
                  onChange={(e) => setGoToCode(e.target.value.toLowerCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleGoToPaste()}
                  placeholder="Enter code..."
                  maxLength={5}
                  className="w-28 h-9 px-3 pr-8 text-sm bg-[#1a1a1a] border border-border/30 rounded-md 
                             placeholder:text-muted-foreground/40 focus:outline-none focus:border-rose-500/50
                             transition-colors font-mono"
                />
                <button
                  onClick={handleGoToPaste}
                  disabled={!goToCode.trim()}
                  className="absolute right-2 text-muted-foreground hover:text-rose-400 disabled:opacity-30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>

              {/* Language Select */}
              <Select value={language} onValueChange={(val) => {
                setLanguage(val);
                setAutoDetect(false);
              }}>
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Expiration Select */}
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger className="w-[120px] h-9 text-sm">
                  <SelectValue placeholder="Expires" />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRATIONS.map((exp) => (
                    <SelectItem key={exp.value} value={exp.value}>
                      {exp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Publish Button */}
              <Button
                onClick={handlePublish}
                disabled={loading || !content.trim()}
                className="h-9 px-4 font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-rose-500 hover:bg-rose-600 text-white"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Publishing...
                  </span>
                ) : (
                  "Share ⌘S"
                )}
              </Button>
            </div>

            {/* Mobile Publish Button */}
            <div className="flex sm:hidden items-center">
              <Button
                onClick={handlePublish}
                disabled={loading || !content.trim()}
                className="h-10 px-4 font-medium transition-all duration-200 active:scale-[0.98] bg-rose-500 hover:bg-rose-600 text-white"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  "Share"
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Controls Row */}
          <div className="flex sm:hidden items-center gap-2 pb-3 overflow-x-auto scrollbar-hide">
            {/* Language Select */}
            <Select value={language} onValueChange={(val) => {
              setLanguage(val);
              setAutoDetect(false);
            }}>
              <SelectTrigger className="w-[120px] h-10 text-sm flex-shrink-0">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Expiration Select */}
            <Select value={expiration} onValueChange={setExpiration}>
              <SelectTrigger className="w-[100px] h-10 text-sm flex-shrink-0">
                <SelectValue placeholder="Expires" />
              </SelectTrigger>
              <SelectContent>
                {EXPIRATIONS.map((exp) => (
                  <SelectItem key={exp.value} value={exp.value}>
                    {exp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Go to paste input */}
            <div className="relative flex items-center flex-shrink-0">
              <input
                type="text"
                value={goToCode}
                onChange={(e) => setGoToCode(e.target.value.toLowerCase())}
                onKeyDown={(e) => e.key === "Enter" && handleGoToPaste()}
                placeholder="Code..."
                maxLength={5}
                className="w-20 h-10 px-2 pr-7 text-sm bg-[#1a1a1a] border border-border/30 rounded-md 
                           placeholder:text-muted-foreground/40 focus:outline-none focus:border-rose-500/50
                           transition-colors font-mono"
              />
              <button
                onClick={handleGoToPaste}
                disabled={!goToCode.trim()}
                className="absolute right-2 text-muted-foreground hover:text-rose-400 disabled:opacity-30 transition-colors p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Editor */}
      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="flex-1 flex flex-col min-h-0">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your code or text here..."
            className="flex-1 min-h-[calc(100vh-200px)] sm:min-h-[calc(100vh-250px)] resize-none text-sm leading-relaxed p-4 sm:p-6 
                       bg-[#1a1a1a] border-2 border-border/30 rounded-xl
                       focus:ring-2 focus:ring-ring/20 focus:border-border
                       placeholder:text-muted-foreground/40
                       transition-all duration-200 scroll-touch"
            style={{ fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace" }}
            spellCheck={false}
          />
        </div>

        {/* Footer hint */}
        <div className="mt-3 sm:mt-4 flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
          <span>
            {content.length > 0 && (
              <>
                {content.length.toLocaleString()} chars • {content.split("\n").length} lines
              </>
            )}
          </span>
          <span className="hidden sm:block">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Ctrl</kbd> +{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">S</kbd> to share
          </span>
        </div>
      </main>
    </div>
  );
}
