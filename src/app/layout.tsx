import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LovePaste - Minimal Code & Text Sharing",
  description: "A modern, distraction-free paste sharing service with syntax highlighting, expiration options, and one-click sharing.",
  keywords: ["pastebin", "code sharing", "text sharing", "syntax highlighting", "code paste", "lovepaste"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        
        {/* Global Footer */}
        <footer className="mt-auto py-4 border-t border-border/20">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            Made with Love{" "}
            <span className="inline-block animate-pulse text-red-500">❤️</span>
            {" "}from Gujarat, India
          </div>
        </footer>
      </body>
    </html>
  );
}
