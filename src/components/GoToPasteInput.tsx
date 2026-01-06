"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GoToPasteInputProps {
  className?: string;
}

export default function GoToPasteInput({ className = "" }: GoToPasteInputProps) {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleGoToPaste = () => {
    const trimmedCode = code.trim().toLowerCase();
    if (trimmedCode && /^[a-z2-9]{5}$/.test(trimmedCode)) {
      router.push(`/p/${trimmedCode}`);
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toLowerCase())}
        onKeyDown={(e) => e.key === "Enter" && handleGoToPaste()}
        placeholder="Code..."
        maxLength={5}
        className="w-20 sm:w-28 h-10 sm:h-9 px-2 sm:px-3 pr-8 text-sm bg-[#1a1a1a] border border-border/30 rounded-md 
                   placeholder:text-muted-foreground/40 focus:outline-none focus:border-rose-500/50
                   transition-colors font-mono"
      />
      <button
        onClick={handleGoToPaste}
        disabled={!code.trim()}
        className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center text-muted-foreground hover:text-rose-400 active:text-rose-500 disabled:opacity-30 transition-colors"
        aria-label="Go to paste"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}
